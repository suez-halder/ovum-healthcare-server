//* src/app/modules/Specialties/specialties.routes.ts

import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import { DoctorController } from "./doctor.controller";

const router = express.Router();

router.get("/", DoctorController.getAllDoctorsFromDB);

router.get("/:id", DoctorController.getDoctorByIdFromDB);

router.patch("/:id", DoctorController.updateDoctorIntoDB);

router.delete(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    DoctorController.deleteDoctorFromDB
);

router.delete(
    "/soft/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    DoctorController.softDeleteDoctorFromDB
);

export const DoctorRoutes = router;
