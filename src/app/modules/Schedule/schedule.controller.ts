//* src/app/modules/Schedule/schedule.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
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

export const ScheduleController = {
    createScheduleIntoDB,
};
