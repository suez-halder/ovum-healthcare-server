//* src/app/modules/Specialties/specialties.routes.ts

import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import { DoctorController } from "./doctor.controller";

const router = express.Router();

router.patch("/:id", DoctorController.updateDoctorIntoDB);

export const DoctorRoutes = router;
