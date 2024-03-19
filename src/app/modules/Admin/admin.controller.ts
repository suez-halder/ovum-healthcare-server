//* src/app/modules/Admin/admin.controller.ts

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { adminFilterableFields } from "./admin.constant";
import { AdminServices } from "./admin.service";

// * -------------- * //
//!  Get All Admins
// * -------------- * //

const getAllAdminsFromDB = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const filters = pick(req.query, adminFilterableFields);
        const options = pick(req.query, [
            "limit",
            "page",
            "sortBy",
            "sortOrder",
        ]);

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
    } catch (err: any) {
        next(err);
    }
};

// * ----------------------- * //
//! Get Single Admin by ID
// * ----------------------- * //

const getAdminByIdFromDB = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // console.log(req.params.id);
    const { id } = req.params;

    try {
        const result = await AdminServices.getAdminByIdFromDB(id);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Single admin data retrieved successfully!",
            data: result,
        });
    } catch (err: any) {
        next(err);
    }
};

// * -------------------------- * //
//! UPDATE Single Admin by ID
// * -------------------------- * //

const updateAdminIntoDB = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    try {
        const result = await AdminServices.updateAdminIntoDB(id, req.body);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Updated admin data successfully!",
            data: result,
        });
    } catch (err: any) {
        next(err);
    }
};

// * ------------------ * //
//! DELETE Admin by ID
// * ------------------ * //

const deleteAdminFromDB = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    try {
        const result = await AdminServices.deleteAdminFromDB(id);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Admin data deleted successfully!",
            data: result,
        });
    } catch (err: any) {
        next(err);
    }
};

// * ------------ * //
//!  Soft DELETE
// * ------------ * //

const softDeleteAdminFromDB = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    try {
        const result = await AdminServices.softDeleteAdminFromDB(id);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Admin soft data deleted!",
            data: result,
        });
    } catch (err: any) {
        next(err);
    }
};

export const AdminControllers = {
    getAllAdminsFromDB,
    getAdminByIdFromDB,
    updateAdminIntoDB,
    deleteAdminFromDB,
    softDeleteAdminFromDB,
};
