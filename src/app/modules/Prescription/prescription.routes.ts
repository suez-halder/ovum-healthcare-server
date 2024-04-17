//* src/app/modules/Prescription/prescription.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { PrescriptionController } from "./prescription.controller";

const router = express.Router();

router.get(
    "/my-prescription",
    auth(UserRole.PATIENT),
    PrescriptionController.getPatientPrescriptionFromDB
);
router.post(
    "/",
    auth(UserRole.DOCTOR),
    PrescriptionController.createPrescriptionIntoDB
);

export const PrescriptionRoutes = router;
