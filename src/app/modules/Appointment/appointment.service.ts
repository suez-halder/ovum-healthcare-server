//* src/app/modules/Appointment/appointment.service.ts

import prisma from "../../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from "uuid";
import { TPaginationOptions } from "../../interfaces/pagination.types";
import { paginationHelper } from "../../../helpers/paginationHelper";
import {
    AppoiintmentStatus,
    PaymentStatus,
    Prisma,
    UserRole,
} from "@prisma/client";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

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

// * -------------------------- * //
//!  Get All Appointments
// * -------------------------- * //

const getAllAppointmentsFromDB = async (
    filters: any,
    options: TPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { patientEmail, doctorEmail, ...filterData } = filters;
    const andConditions = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail,
            },
        });
    } else if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail,
            },
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: (filterData as any)[key],
                    },
                };
            }),
        });
    }

    // console.dir(andConditions, { depth: Infinity })
    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                      createdAt: "desc",
                  },
        include: {
            doctor: true,
            patient: true,
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

// * -------------------------- * //
//!  Change Appointment Status
// * -------------------------- * //

const changeAppointmentStatus = async (
    payload: { status: AppoiintmentStatus },
    user: TAuthUser,
    appointmentId: string
) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId,
        },
        include: {
            doctor: true,
        },
    });

    if (user.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email)) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "This is not your appointment"
            );
        }
    }

    const result = await prisma.appointment.update({
        where: {
            id: appointmentId,
        },
        data: payload,
    });

    return result;
};

// * ------------------------------------------- * //
//!  Cancel Unpaid Appointments after 30 minutes
// * -------------------------------------------* //

const cancelUnpaidAppointments = async () => {
    const thirtyMinuteAgo = new Date(Date.now() - 30 * 60 * 1000); // 30mins into millisecond

    const unpaidAppointments = await prisma.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinuteAgo,
            },
            paymentStatus: PaymentStatus.UNPAID,
        },
    });

    const appointmentIdsToCancel = unpaidAppointments.map(
        (appointment) => appointment.id
    );

    await prisma.$transaction(async (tx) => {
        await tx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel, // loop chalano hoise
                },
            },
        });

        await tx.appointment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel,
                },
            },
        });

        for (const unpaidAppointment of unpaidAppointments) {
            await tx.doctorSchedules.updateMany({
                where: {
                    doctorId: unpaidAppointment.doctorId,
                    scheduleId: unpaidAppointment.scheduleId,
                },
                data: {
                    isBooked: false,
                },
            });
        }
    });

    // console.log("cancelled");
};

export const AppointmentService = {
    createAppointmentIntoDB,
    getMyAppointment,
    getAllAppointmentsFromDB,
    changeAppointmentStatus,
    cancelUnpaidAppointments,
};
