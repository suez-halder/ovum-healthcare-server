//* src/app/modules/Specialties/specialties.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { doctorFilterableFields } from "./doctor.constant";
import { DoctorService } from "./doctor.service";

// * --------------------- * //
//!  Get ALl Doctors
// * --------------------- * //

const getAllDoctorsFromDB = catchAsync(async (req, res) => {
    const filters = pick(req.query, doctorFilterableFields);
    console.log("filters: ", filters);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await DoctorService.getAllDoctorsFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctors retrieval successfully",
        meta: result.meta,
        data: result.data,
    });
});

// * --------------------- * //
//!  Get Single Doctor
// * --------------------- * //

const getDoctorByIdFromDB = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await DoctorService.getDoctorByIdFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor retrieval successfully",
        data: result,
    });
});

// * --------------------- * //
//!  Update Doctor Profile
// * --------------------- * //

const updateDoctorIntoDB = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await DoctorService.updateDoctorIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Doctor data updated successfully!",
        data: result,
    });
});

// * --------------------- * //
//!  Delete Doctor
// * --------------------- * //

const deleteDoctorFromDB = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await DoctorService.deleteDoctorFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor deleted successfully",
        data: result,
    });
});

// * --------------------- * //
//!  Soft Delete Doctor
// * --------------------- * //

const softDeleteDoctorFromDB = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await DoctorService.softDeleteDoctorFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Doctor soft deleted successfully",
        data: result,
    });
});

export const DoctorController = {
    getAllDoctorsFromDB,
    getDoctorByIdFromDB,
    updateDoctorIntoDB,
    deleteDoctorFromDB,
    softDeleteDoctorFromDB,
};
