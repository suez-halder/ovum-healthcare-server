//* src/app/modules/Patient/patient.controller.ts

import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { PatientService } from "./patient.service";
import { patientFilterableFields } from "./patient.constant";

const getAllPatientsFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, patientFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await PatientService.getAllPatientsFromDB(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient retrieval successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getPatientByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientService.getPatientByIdFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient retrieval successfully",
        data: result,
    });
});

const updatePatientIntoDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientService.updatePatientIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient updated successfully",
        data: result,
    });
});

const deletePatientFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientService.deletePatientFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient deleted successfully",
        data: result,
    });
});

const softDeletePatient = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PatientService.softDeletePatient(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Patient soft deleted successfully",
        data: result,
    });
});

export const PatientController = {
    getAllPatientsFromDB,
    getPatientByIdFromDB,
    updatePatientIntoDB,
    deletePatientFromDB,
    softDeletePatient,
};
