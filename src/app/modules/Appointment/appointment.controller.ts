//* src/app/modules/Appointment/appointment.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { TAuthUser } from "../../interfaces/common";
import { AppointmentService } from "./appointment.service";

// * -------------------------- * //
//!  Create Appointment
// * -------------------------- * //

const createAppointmentIntoDB = catchAsync(async (req, res) => {
    const user = req.user as TAuthUser;
    const result = await AppointmentService.createAppointmentIntoDB(
        user,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Appointment created successfully!",
        data: result,
    });
});
// * -------------------------- * //
//!   Get My Appointment
// * -------------------------- * //

const getMyAppointment = catchAsync(async (req, res) => {
    const user = req.user as TAuthUser;
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AppointmentService.getMyAppointment(
        user,
        filters,
        options
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "My appointment fetched successfully!",
        data: result.data,
        meta: result.meta,
    });
});

export const AppointmentController = {
    createAppointmentIntoDB,
    getMyAppointment,
};
