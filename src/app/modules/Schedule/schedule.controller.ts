//* src/app/modules/Schedule/schedule.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";

// * -------------------------- * //
//!  Create Schedule
// * -------------------------- * //

const createScheduleIntoDB = catchAsync(async (req, res) => {
    const result = await ScheduleService.createScheduleIntoDB(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Schedule created successfully!",
        data: result,
    });
});

// * -------------------------- * //
//! Get All Schedules
// * -------------------------- * //

const getAllSchedulesFromDB = catchAsync(async (req, res) => {
    const filters = pick(req.query, ["startDateTime", "endDateTime"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await ScheduleService.getAllSchedulesFromDB(
        filters,
        options
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "All Schedules fetched successfully!",
        data: result.data,
        meta: result.meta,
    });
});

export const ScheduleController = {
    createScheduleIntoDB,
    getAllSchedulesFromDB,
};
