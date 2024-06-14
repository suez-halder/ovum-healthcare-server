//* src/app/modules/Schedule/schedule.service.ts

import { Prisma, Schedule } from "@prisma/client";
import { addHours, addMinutes, format } from "date-fns";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { TPaginationOptions } from "../../interfaces/pagination.types";
import { TFilterRequest, TSchedule } from "./schedule.interface";
import { convertDateTime } from "./schedule.utils";

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
            //! create 30 mins interval

            //? save time in local time
            // const scheduleData = {
            //     startDateTime: startDateTime,
            //     endDateTime: addMinutes(startDateTime, intervalTime),
            // };

            const sTime = await convertDateTime(startDateTime);
            const eTime = await convertDateTime(
                addMinutes(startDateTime, intervalTime)
            );

            //? save time in UTC
            const scheduleData = {
                startDateTime: sTime,
                endDateTime: eTime,
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

// * ------------------------------- * //
//! Get All Schedules with filtering
// * -------------------------------- * //

// const getAllSchedulesFromDB = async (
//     filters: TFilterRequest,
//     options: TPaginationOptions,
//     user: TAuthUser
// ) => {
//     const { limit, page, skip } = paginationHelper.calculatePagination(options);
//     const { startDate, endDate, ...filterData } = filters;

//     const andConditions = [];

//     if (startDate && endDate) {
//         andConditions.push({
//             AND: [
//                 {
//                     startDateTime: {
//                         gte: startDate,
//                     },
//                 },
//                 {
//                     endDateTime: {
//                         lte: endDate,
//                     },
//                 },
//             ],
//         });
//     }

//     if (Object.keys(filterData).length > 0) {
//         andConditions.push({
//             AND: Object.keys(filterData).map((key) => {
//                 return {
//                     [key]: {
//                         equals: (filterData as any)[key],
//                     },
//                 };
//             }),
//         });
//     }

//     const whereConditions: Prisma.ScheduleWhereInput =
//         andConditions.length > 0 ? { AND: andConditions } : {};

//     //! je doctor er schedule already book kora segula all schedules e dekhaite chaina
//     const doctorSchedules = await prisma.doctorSchedules.findMany({
//         where: {
//             doctor: {
//                 email: user.email,
//             },
//         },
//     });

//     const doctorSchedulesIds = new Set(
//         doctorSchedules.map((schedule) => schedule.scheduleId)
//     );

//     const result = await prisma.schedule.findMany({
//         where: {
//             ...whereConditions,
//             id: {
//                 // notIn: doctorSchedulesIds,
//                 notIn: [...doctorSchedulesIds],
//             },
//         },
//         skip,
//         take: limit,
//         orderBy:
//             options.sortBy && options.sortOrder
//                 ? { [options.sortBy]: options.sortOrder }
//                 : {
//                       createdAt: "desc",
//                   },
//     });
//     const total = await prisma.schedule.count({
//         where: {
//             ...whereConditions,
//             id: {
//                 // notIn: doctorSchedulesIds,
//                 notIn: [...doctorSchedulesIds],
//             },
//         },
//     });

//     return {
//         meta: {
//             total,
//             page,
//             limit,
//         },
//         data: result,
//     };
// };

const getAllSchedulesFromDB = async (
    filters: TFilterRequest,
    options: TPaginationOptions,
    user: TAuthUser
) => {
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    const { startDate, endDate, ...filterData } = filters; // Extracting startDate and endDate from filters

    const andConditions = [];

    // Adding date filtering conditions if startDate and endDate are provided
    if (startDate && endDate) {
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: startDate, // Greater than or equal to startDate
                    },
                },
                {
                    endDateTime: {
                        lte: endDate, // Less than or equal to endDate
                    },
                },
            ],
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

    const whereConditions: Prisma.ScheduleWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const doctorsSchedules = await prisma.doctorSchedules.findMany({
        where: {
            doctor: {
                email: user.email,
            },
        },
    });

    const doctorScheduleIds = new Set(
        doctorsSchedules.map((schedule) => schedule.scheduleId)
    );

    const total = await prisma.schedule.count({
        where: {
            ...whereConditions,
            id: {
                notIn: [...doctorScheduleIds],
            },
        },
    });

    const result = await prisma.schedule.findMany({
        where: {
            ...whereConditions,
            id: {
                notIn: [...doctorScheduleIds],
            },
        },
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                      createdAt: "desc",
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

// * ------------------------------- * //
//! Get Single Schedule
// * -------------------------------- * //

const getScheduleByIdFromDB = async (id: string): Promise<Schedule | null> => {
    const result = await prisma.schedule.findUnique({
        where: {
            id,
        },
    });

    // console.log(
    //     result?.startDateTime.getHours() +
    //         ":" +
    //         result?.startDateTime.getMinutes()
    // );

    // console.log(
    //     result?.startDateTime.getUTCHours() +
    //         ":" +
    //         result?.startDateTime.getUTCMinutes()
    // );

    return result;
};

// * ------------------------------- * //
//! Delete Schedule
// * -------------------------------- * //

const deleteScheduleFromDB = async (id: string): Promise<Schedule> => {
    const result = await prisma.schedule.delete({
        where: {
            id,
        },
    });
    return result;
};

export const ScheduleService = {
    createScheduleIntoDB,
    getAllSchedulesFromDB,
    getScheduleByIdFromDB,
    deleteScheduleFromDB,
};
