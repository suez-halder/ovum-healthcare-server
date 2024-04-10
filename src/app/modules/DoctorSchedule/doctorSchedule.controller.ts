//* src/app/modules/Schedule/doctorSchedules.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { TAuthUser } from "../../interfaces/common";
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

// * -------------------------- * //
//! Get Doctor Schedules
// * -------------------------- * //

const getDoctorSchedulesFromDB = catchAsync(async (req, res) => {
    const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const user = req.user as TAuthUser;

    const result = await DoctorScheduleService.getDoctorSchedulesFromDB(
        filters,
        options,
        user
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "All Doctor Schedules fetched successfully!",
        data: result.data,
        meta: result.meta,
    });
});

// * -------------------------- * //
//!  Delete Doctor Schedule
// * -------------------------- * //

const deleteDoctorScheduleFromDB = catchAsync(async (req, res) => {
    const user = req.user as TAuthUser;
    const { scheduleId } = req.params;

    const result = await DoctorScheduleService.deleteDoctorScheduleFromDB(
        user,
        scheduleId
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Doctor Schedule deleted successfully!",
        data: result,
    });
});

export const DoctorScheduleController = {
    createDoctorScheduleIntoDB,
    getDoctorSchedulesFromDB,
    deleteDoctorScheduleFromDB,
};
