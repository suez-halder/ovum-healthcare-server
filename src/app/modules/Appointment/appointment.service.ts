//* src/app/modules/Appointment/appointment.service.ts

import prisma from "../../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from "uuid";

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
            "VUM-HEALTHCARE-" +
            today.getFullYear() +
            today.getMonth() +
            today.getDate() +
            today.getHours() +
            today.getMinutes();

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

export const AppointmentService = {
    createAppointmentIntoDB,
};
