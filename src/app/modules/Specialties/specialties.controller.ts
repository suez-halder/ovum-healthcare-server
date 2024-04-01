//* src/app/modules/Specialties/specialties.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { specialtiesService } from "./specialties.service";

// * -------------------------- * //
//!  Create Specialty
// * -------------------------- * //

const createSpecialtyIntoDB = catchAsync(async (req, res) => {
    const result = await specialtiesService.createSpecialtyIntoDB(req);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Specialty created successfully!",
        data: result,
    });
});

export const specialtiesController = {
    createSpecialtyIntoDB,
};
