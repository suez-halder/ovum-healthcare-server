//* src/app/modules/User/user.controller.ts

import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { userFilterableFields } from "./user.constant";
import { userService } from "./user.service";

// * -------------------------- * //
//! Create Admin
// * -------------------------- * //

const createAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.createAdmin(req);
    // res.send(result);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Admin created successfully!",
        data: result,
    });
});

// * -------------------------- * //
//! Create Doctor
// * -------------------------- * //

const createDoctor = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.createDoctor(req);
    // res.send(result);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Doctor created successfully!",
        data: result,
    });
});

// * -------------------------- * //
//! Create Patient
// * -------------------------- * //

const createPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.createPatient(req);
    // res.send(result);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Patient created successfully!",
        data: result,
    });
});

// * -------------- * //
//!  Get All Users
// * -------------- * //

const getAllUsersFromDB = catchAsync(async (req, res) => {
    const filters = pick(req.query, userFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await userService.getAllUsersFromDB(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully!",
        meta: result.meta,
        data: result.data,
    });
});

// * -------------- * //
//!  Change Profile Status
// * -------------- * //

const changeProfileStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await userService.changeProfileStatus(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users profile status changed successfully!",
        data: result,
    });
});

export const userController = {
    createAdmin,
    createDoctor,
    createPatient,
    getAllUsersFromDB,
    changeProfileStatus,
};
