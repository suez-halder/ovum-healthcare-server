//* src/app/modules/Payment/payment.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PaymentService } from "./payment.service";

// * --------------------- * //
//!  Payment Initialization
// * --------------------- * //

const initPayment = catchAsync(async (req, res) => {
    const { appointmentId } = req.params;
    const result = await PaymentService.initPayment(appointmentId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment initiated successfully",
        data: result,
    });
});

// * --------------------- * //
//!  Payment Validation
// * --------------------- * //

const validatePayment = catchAsync(async (req, res) => {
    const result = await PaymentService.validatePayment(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Payment validated successfully",
        data: result,
    });
});

export const PaymentController = {
    initPayment,
    validatePayment,
};
