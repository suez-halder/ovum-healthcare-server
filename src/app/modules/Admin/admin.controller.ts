//* src/app/modules/Admin/admin.controller.ts

import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import { AdminServices } from "./admin.service";

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

export const AdminControllers = {
    getAllAdminsFromDB,
};
