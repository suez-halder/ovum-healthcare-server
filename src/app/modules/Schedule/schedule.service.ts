//* src/app/modules/Schedule/schedule.service.ts
import { addHours, format } from "date-fns";

// * -------------------------- * //
//!  Create Schedule
// * -------------------------- * //

const createScheduleIntoDB = async (payload: any) => {
    const { startDate, endDate, startTime, endTime } = payload;

    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
        const startDateTime = new Date(
            addHours(
                `${format(currentDate, "yyyy-MM-dd")}`,
                Number(startTime.split(":")[0])
            )
        );

        const endDateTime = new Date(
            addHours(
                `${format(lastDate, "yyyy-MM-dd")}`,
                Number(endTime.split(":")[0])
            )
        );

        while (startDateTime <= endDateTime) {
            // create 30 mins interval
        }
    }
};

export const ScheduleService = {
    createScheduleIntoDB,
};
