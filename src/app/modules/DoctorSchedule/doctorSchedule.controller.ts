//* src/app/modules/Schedule/doctorSchedules.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DoctorScheduleService } from "./doctorSchedule.service";

// * -------------------------- * //
//!  Create Doctor Schedule
// * -------------------------- * //

const createDoctorScheduleIntoDB = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await DoctorScheduleService.createDoctorScheduleIntoDB(
        user,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Doctor Schedules created successfully!",
        data: result,
    });
});

export const DoctorScheduleController = {
    createDoctorScheduleIntoDB,
};
