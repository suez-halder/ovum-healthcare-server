//* src/app/modules/User/user.routes.ts

import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";

import { fileUploader } from "../../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
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
        return userController.createAdmin(req, res, next);
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
        return userController.createDoctor(req, res, next);
    }
);
// * -------------------------- * //
//! Create Patient
// * -------------------------- * //

router.post(
    "/create-patient",
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createPatient.parse(
            JSON.parse(req.body.data)
        );
        return userController.createPatient(req, res, next);
    }
);

// * -------------- * //
//!  Get All Users
// * -------------- * //

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    userController.getAllUsersFromDB
);

// * --------------------- * //
//!  Change Profile Status
// * --------------------- * //

router.patch(
    "/:id/status",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    validateRequest(userValidation.changeProfileStatus),
    userController.changeProfileStatus
);

// * --------------------- * //
//!  Get My Profile
// * --------------------- * //

router.get(
    "/me",
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    userController.getMyProfile
);

// * -------------------------- * //
//! Update My Profile
// * -------------------------- * //

router.patch(
    "/update-my-profile",
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        return userController.updateMyProfile(req, res, next);
    }
);

export const UserRoutes = router;
