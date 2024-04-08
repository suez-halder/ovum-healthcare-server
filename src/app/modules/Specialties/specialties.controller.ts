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

const getAllSpecialtyFromDB = catchAsync(async (req, res) => {
    const result = await specialtiesService.getAllSpecialtyFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Specialties data fetched successfully",
        data: result,
    });
});

const deleteSpecialtyFromDB = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await specialtiesService.deleteSpecialtyFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Specialty deleted successfully",
        data: result,
    });
});

export const specialtiesController = {
    createSpecialtyIntoDB,
    getAllSpecialtyFromDB,
    deleteSpecialtyFromDB,
};
