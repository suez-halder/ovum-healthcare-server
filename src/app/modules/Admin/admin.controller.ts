//* src/app/modules/Admin/admin.controller.ts

import { Request, Response } from "express";
import pick from "../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import { AdminServices } from "./admin.service";

const getAllAdminsFromDB = async (req: Request, res: Response) => {
    try {
        const filters = pick(req.query, adminFilterableFields);
        const result = await AdminServices.getAllAdminsFromDB(filters);

        res.status(200).json({
            success: true,
            message: "Admins retrieved successfully!",
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
};
