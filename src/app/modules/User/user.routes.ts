//* src/app/modules/User/user.routes.ts

import express, { NextFunction, Request, Response } from "express";

import { fileUploader } from "../../../helpers/fileUploader";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = express.Router();

router.post(
    "/create-admin",
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createAdmin.parse(JSON.parse(req.body.data));
        return userController.createAdmin(req, res);
    }
);

export const UserRoutes = router;
