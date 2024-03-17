//* src/app/modules/Admin/admin.controller.ts

import { Request, Response } from "express";
import { AdminServices } from "./admin.service";

//! Selecting Data Fields for Filtering and Searching : vul search/filtering field dile ignore korbe, sothik dile search/filter kaaj korbe
const pick = (obj, keys) => {
    const finalObj = {};

    for (const key of keys) {
        if (obj && Object.hasOwnProperty.call(obj, key)) {
            finalObj[key] = obj[key];
        }
    }

    // console.dir(finalObj, { depth: Infinity });
    return finalObj;
};

const getAllAdminsFromDB = async (req: Request, res: Response) => {
    try {
        // console.log(req.query);
        // pick(req.query, ["name", "email", "searchTerm", "contactNumber"]);
        // const filters = req.query;
        const filters = pick(req.query, [
            "name",
            "email",
            "searchTerm",
            "contactNumber",
        ]);
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
