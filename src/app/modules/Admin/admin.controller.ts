//* src/app/modules/Admin/admin.controller.ts

import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { adminFilterableFields } from "./admin.constant";
import { AdminServices } from "./admin.service";

// * -------------- * //
//!  Get All Admins
// * -------------- * //

const getAllAdminsFromDB: RequestHandler = catchAsync(async (req, res) => {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AdminServices.getAllAdminsFromDB(filters, options);

    // res.status(200).json({
    //     success: true,
    //     message: "Admins retrieved successfully!",
    //     meta: result.meta,
    //     data: result.data,
    // });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admins retrieved successfully!",
        meta: result.meta,
        data: result.data,
    });
});

// * ----------------------- * //
//!  Get Single Admin by ID
// * ----------------------- * //

const getAdminByIdFromDB = catchAsync(async (req, res) => {
    // console.log(req.params.id);
    const { id } = req.params;

    const result = await AdminServices.getAdminByIdFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Single admin data retrieved successfully!",
        data: result,
    });
});

// * -------------------------- * //
//! UPDATE Single Admin by ID
// * -------------------------- * //

const updateAdminIntoDB = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await AdminServices.updateAdminIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Updated admin data successfully!",
        data: result,
    });
});

// * ------------------ * //
//! DELETE Admin by ID
// * ------------------ * //

const deleteAdminFromDB = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await AdminServices.deleteAdminFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data deleted successfully!",
        data: result,
    });
});

// * ------------ * //
//!  Soft DELETE
// * ------------ * //

const softDeleteAdminFromDB = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await AdminServices.softDeleteAdminFromDB(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin soft data deleted!",
        data: result,
    });
});

export const AdminControllers = {
    getAllAdminsFromDB,
    getAdminByIdFromDB,
    updateAdminIntoDB,
    deleteAdminFromDB,
    softDeleteAdminFromDB,
};
