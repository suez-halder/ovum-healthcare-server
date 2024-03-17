//* src/app/modules/Admin/admin.controller.ts

import { Request, Response } from "express";
import { AdminServices } from "./admin.service";

const getAllAdminsFromDB = async (req: Request, res: Response) => {
    try {
        // console.log(req.query);
        const result = await AdminServices.getAllAdminsFromDB(req.query);

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
