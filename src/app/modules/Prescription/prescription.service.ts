//* src/app/modules/Prescription/prescription.service.ts

import {
    AppoiintmentStatus,
    PaymentStatus,
    Prescription,
} from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { TAuthUser } from "../../interfaces/common";

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

export const PrescriptionService = {
    createPrescriptionIntoDB,
};
