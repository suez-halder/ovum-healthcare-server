//* src/app/modules/Prescription/prescription.service.ts

import {
    AppoiintmentStatus,
    PaymentStatus,
    Prescription,
} from "@prisma/client";
import httpStatus from "http-status";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { TAuthUser } from "../../interfaces/common";
import { TPaginationOptions } from "../../interfaces/pagination.types";

// * -------------------------- * //
//!  Create Prescription
// * -------------------------- * //

const createPrescriptionIntoDB = async (
    payload: Partial<Prescription>,
    user: TAuthUser
) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            status: AppoiintmentStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID,
        },
        include: {
            doctor: true,
        },
    });

    if (!(user.email === appointmentData.doctor.email)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "This is not your appointment"
        );
    }

    const result = await prisma.prescription.create({
        data: {
            appointmentId: appointmentData.id,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            instructions: payload.instructions as string,
            followUpDate: payload.followUpDate || null || undefined,
        },
        include: {
            patient: true,
        },
    });

    return result;
};

// * -------------------------- * //
//!  Get Patient Prescription
// * -------------------------- * //

const getPatientPrescriptionFromDB = async (
    user: TAuthUser,
    options: TPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);

    const result = await prisma.prescription.findMany({
        where: {
            patient: {
                email: user.email,
            },
        },
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { createdAt: "desc" },
        include: {
            doctor: true,
            patient: true,
            appointment: true,
        },
    });

    const total = await prisma.prescription.count({
        where: {
            patient: {
                email: user.email,
            },
        },
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

export const PrescriptionService = {
    createPrescriptionIntoDB,
    getPatientPrescriptionFromDB,
};
