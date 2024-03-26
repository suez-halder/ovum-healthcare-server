//* src/app/modules/User/user.routes.ts

import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";

import { fileUploader } from "../../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = express.Router();

// * -------------------------- * //
//! Create Admin
// * -------------------------- * //

router.post(
    "/create-admin",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createAdmin.parse(JSON.parse(req.body.data));
        return userController.createAdmin(req, res);
    }
);

// * -------------------------- * //
//! Create Doctor
// * -------------------------- * //

router.post(
    "/create-doctor",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createDoctor.parse(JSON.parse(req.body.data));
        return userController.createDoctor(req, res);
    }
);
// * -------------------------- * //
//! Create Patient
// * -------------------------- * //

router.post(
    "/create-patient",
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createPatient.parse(
            JSON.parse(req.body.data)
        );
        return userController.createPatient(req, res);
    }
);

export const UserRoutes = router;
