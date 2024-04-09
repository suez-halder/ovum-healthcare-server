//* src/app/modules/Schedule/doctorSchedules.service.ts

import prisma from "../../../shared/prisma";

// * -------------------------- * //
//!  Create Doctor Schedules
// * -------------------------- * //

const createDoctorScheduleIntoDB = async (user: any) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    console.log(doctorData);
};

export const DoctorScheduleService = {
    createDoctorScheduleIntoDB,
};
