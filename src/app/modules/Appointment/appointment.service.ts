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

    const videoCallingId = uuidv4();

    const result = await prisma.appointment.create({
        data: {
            patientId: patientData.id,
            doctorId: doctorData.id,
            scheduleId: payload.scheduleId,
            videoCallingId,
        },
    });

    return result;
};

export const AppointmentService = {
    createAppointmentIntoDB,
};
