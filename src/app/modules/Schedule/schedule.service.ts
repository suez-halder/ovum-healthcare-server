//* src/app/modules/Schedule/schedule.service.ts

import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../../shared/prisma";

// * -------------------------- * //
//!  Create Schedule
// * -------------------------- * //

const createScheduleIntoDB = async (payload: any) => {
    const { startDate, endDate, startTime, endTime } = payload;

    const intervalTime = 30;

    const schedules = [];

    const currentDate = new Date(startDate); // start date
    const lastDate = new Date(endDate); // end date

    while (currentDate <= lastDate) {
        const startDateTime = new Date(
            addHours(
                `${format(currentDate, "yyyy-MM-dd")}`,
                Number(startTime.split(":")[0])
            )
        );

        const endDateTime = new Date(
            addHours(
                `${format(currentDate, "yyyy-MM-dd")}`,
                Number(endTime.split(":")[0])
            )
        );

        while (startDateTime < endDateTime) {
            // create 30 mins interval
            const scheduleData = {
                startDateTime: startDateTime,
                endDateTime: addMinutes(startDateTime, intervalTime),
            };

            // console.log(scheduleData);
            const result = await prisma.schedule.create({
                data: scheduleData,
            });
            schedules.push(result);

            startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
};

export const ScheduleService = {
    createScheduleIntoDB,
};
