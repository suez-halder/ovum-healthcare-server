//* src/app/modules/Schedule/schedule.service.ts

import { Prisma, Schedule } from "@prisma/client";
import { addHours, addMinutes, format } from "date-fns";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { TPaginationOptions } from "../../interfaces/pagination.types";
import { TSchedule } from "./schedule.interface";

// * -------------------------- * //
//!  Create Schedule
// * -------------------------- * //

const createScheduleIntoDB = async (
    payload: TSchedule
): Promise<Schedule[]> => {
    const { startDate, endDate, startTime, endTime } = payload;

    const intervalTime = 30;

    const schedules = [];

    const currentDate = new Date(startDate); // start date
    const lastDate = new Date(endDate); // end date

    while (currentDate <= lastDate) {
        const startDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(startTime.split(":")[0])
                ),
                Number(startTime.split(":")[1])
            )
        );

        const endDateTime = new Date(
            addMinutes(
                addHours(
                    `${format(currentDate, "yyyy-MM-dd")}`,
                    Number(endTime.split(":")[0])
                ),
                Number(endTime.split(":")[1])
            )
        );

        while (startDateTime < endDateTime) {
            // create 30 mins interval
            const scheduleData = {
                startDateTime: startDateTime,
                endDateTime: addMinutes(startDateTime, intervalTime),
            };

            const existingSchedule = await prisma.schedule.findFirst({
                where: {
                    startDateTime: scheduleData.startDateTime,
                    endDateTime: scheduleData.endDateTime,
                },
            });

            if (!existingSchedule) {
                // console.log(scheduleData);
                const result = await prisma.schedule.create({
                    data: scheduleData,
                });
                schedules.push(result);
            }

            startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
};

// * -------------------------- * //
//! Get All Schedules
// * -------------------------- * //

const getAllSchedulesFromDB = async (
    filters: any,
    options: TPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

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

    const whereConditions: Prisma.ScheduleWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.schedule.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                      createdAt: "desc",
                  },
    });
    const total = await prisma.schedule.count({
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

export const ScheduleService = {
    createScheduleIntoDB,
    getAllSchedulesFromDB,
};
