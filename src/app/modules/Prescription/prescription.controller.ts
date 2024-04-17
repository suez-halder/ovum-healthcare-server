//* src/app/modules/Prescription/prescription.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { TAuthUser } from "../../interfaces/common";
import { PrescriptionService } from "./prescription.service";

// * -------------------------- * //
//!  Create Prescription
// * -------------------------- * //

const createPrescriptionIntoDB = catchAsync(async (req, res) => {
    const user = req.user as TAuthUser;
    const result = await PrescriptionService.createPrescriptionIntoDB(
        req.body,
        user
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Prescription created successfully!",
        data: result,
    });
});

// * -------------------------- * //
//!  Get Patient Prescription
// * -------------------------- * //

const getPatientPrescriptionFromDB = catchAsync(async (req, res) => {
    const user = req.user as TAuthUser;
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await PrescriptionService.getPatientPrescriptionFromDB(
        user,
        options
    );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Patient Prescription fetched successfully!",
        meta: result.meta,
        data: result.data,
    });
});

export const PrescriptionController = {
    createPrescriptionIntoDB,
    getPatientPrescriptionFromDB,
};
