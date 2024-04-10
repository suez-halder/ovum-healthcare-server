//* src/app/modules/Appointment/appointment.service.ts

import prisma from "../../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from "uuid";
import { TPaginationOptions } from "../../interfaces/pagination.types";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { Prisma, UserRole } from "@prisma/client";

// * -------------------------- * //
//!  Create Appointment
// * -------------------------- * //

const createAppointmentIntoDB = async (user: TAuthUser, payload: any) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
        },
    });

    const doctorScheduleData = await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: doctorData.id,
            scheduleId: payload.scheduleId,
            isBooked: false,
        },
    });

    const videoCallingId: string = uuidv4();

    const result = await prisma.$transaction(async (tx) => {
        const appointmentData = await tx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId,
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true,
            },
        });

        await tx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId,
                },
            },
            data: {
                isBooked: true,
                appointmentId: appointmentData.id,
            },
        });

        // generate transaction id -> OVUM-HEALTHCARE-datetime
        const today = new Date();
        const transactionId =
            "OVUM-HEALTHCARE" +
            "-" +
            today.getFullYear() +
            "-" +
            today.getMonth() +
            "-" +
            today.getDay() +
            "-" +
            today.getHours() +
            "-" +
            today.getMinutes();

        // console.log(transactionId);

        await tx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId,
            },
        });

        return appointmentData;
    });

    return result;
};

// * -------------------------- * //
//!  Get My Appointment
// * -------------------------- * //

const getMyAppointment = async (
    user: TAuthUser,
    filters: any,
    options: TPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { ...filterData } = filters;

    const andConditions: Prisma.AppointmentWhereInput[] = [];

    // ei condition use na korle sob data show kore
    // doctor hoile doctor er data show korbe, patient hoile patient er data show korbe
    if (user.role === UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user.email,
            },
        });
    } else if (user.role === UserRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user.email,
            },
        });
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData as any)[key],
            },
        }));
        andConditions.push(...filterConditions);
    }
    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { createdAt: "desc" },
        include:
            user.role === UserRole.PATIENT
                ? { doctor: true, schedule: true }
                : {
                      patient: {
                          include: {
                              patientHealthData: true,
                              medicalReport: true,
                          },
                      },
                      schedule: true,
                  },
    });

    const total = await prisma.appointment.count({
        where: whereConditions,
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

export const AppointmentService = {
    createAppointmentIntoDB,
    getMyAppointment,
};
