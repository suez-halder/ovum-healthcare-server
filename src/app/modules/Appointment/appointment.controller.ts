//* src/app/modules/Appointment/appointment.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
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

export const AppointmentController = {
    createAppointmentIntoDB,
};
