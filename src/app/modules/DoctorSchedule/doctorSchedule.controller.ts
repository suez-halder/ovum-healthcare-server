//* src/app/modules/Schedule/doctorSchedules.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { TAuthUser } from "../../interfaces/common";
import { scheduleFilterableFields } from "./doctorSchedule.constant";
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

const getMySchedulesFromDB = catchAsync(async (req, res) => {
    const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const user = req.user as TAuthUser;

    const result = await DoctorScheduleService.getMySchedulesFromDB(
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

// * -------------------------- * //
//!  Get All Doctor Schedules
// * -------------------------- * //

const getAllDoctorSchedulesFromDB = catchAsync(async (req, res) => {
    const filters = pick(req.query, scheduleFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await DoctorScheduleService.getAllDoctorSchedulesFromDB(
        filters,
        options
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor Schedule retrieval successfully",
        meta: result.meta,
        data: result.data,
    });
});

export const DoctorScheduleController = {
    createDoctorScheduleIntoDB,
    getMySchedulesFromDB,
    deleteDoctorScheduleFromDB,
    getAllDoctorSchedulesFromDB,
};
