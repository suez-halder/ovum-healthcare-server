//* src/app/modules/User/user.controller.ts

import { Request, Response } from "express";
import { userService } from "./user.service";

const createAdmin = async (req: Request, res: Response) => {
    try {
        const result = await userService.createAdmin(req.body);
        // res.send(result);
        res.status(201).json({
            success: true,
            message: "Admin created successfully!",
            data: result,
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.name || "Something went wrong!",
            error: err,
        });
    }
};

export const userController = {
    createAdmin,
};
