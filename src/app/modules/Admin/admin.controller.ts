//* src/app/modules/Admin/admin.controller.ts

import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import { AdminServices } from "./admin.service";

// * -------------------------- * //
//! Get All Admins
// * -------------------------- * //

const getAllAdminsFromDB = async (req: Request, res: Response) => {
    try {
        const filters = pick(req.query, adminFilterableFields);
        const options = pick(req.query, [
            "limit",
            "page",
            "sortBy",
            "sortOrder",
        ]);

        const result = await AdminServices.getAllAdminsFromDB(filters, options);

        res.status(200).json({
            success: true,
            message: "Admins retrieved successfully!",
            meta: result.meta,
            data: result.data,
        });
    } catch (err: any) {
        res.status(500).json({
            success: true,
            message: err.name || "Something went wrong!",
            error: err,
        });
    }
};

// * -------------------------- * //
//! Get Single Admin by ID
// * -------------------------- * //

const getAdminByIdFromDB = async (req: Request, res: Response) => {
    // console.log(req.params.id);
    const { id } = req.params;

    try {
        const result = await AdminServices.getAdminByIdFromDB(id);

        res.status(200).json({
            success: true,
            message: "Single admin data retrieved successfully!",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({
            success: true,
            message: err.name || "Something went wrong!",
            error: err,
        });
    }
};

// * -------------------------- * //
//! UPDATE Single Admin by ID
// * -------------------------- * //

const updateAdminIntoDB = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await AdminServices.updateAdminIntoDB(id, req.body);

        res.status(200).json({
            success: true,
            message: "Updated admin data successfully!",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({
            success: true,
            message: err.name || "Something went wrong!",
            error: err,
        });
    }
};

// * -------------------------- * //
//! DELETE Admin by ID
// * -------------------------- * //

const deleteAdminFromDB = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await AdminServices.deleteAdminFromDB(id);

        res.status(200).json({
            success: true,
            message: "Admin data deleted successfully!",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({
            success: true,
            message: err.name || "Something went wrong!",
            error: err,
        });
    }
};

// * -------------------------- * //
//! Soft DELETE
// * -------------------------- * //

const softDeleteAdminFromDB = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await AdminServices.softDeleteAdminFromDB(id);

        res.status(200).json({
            success: true,
            message: "Admin data deleted successfully!",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({
            success: true,
            message: err.name || "Something went wrong!",
            error: err,
        });
    }
};

export const AdminControllers = {
    getAllAdminsFromDB,
    getAdminByIdFromDB,
    updateAdminIntoDB,
    deleteAdminFromDB,
    softDeleteAdminFromDB,
};
