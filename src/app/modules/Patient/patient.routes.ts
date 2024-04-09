//* src/app/modules/Patient/patient.routes.ts

import express from "express";
import { PatientController } from "./patient.controller";

const router = express.Router();

router.get("/", PatientController.getAllPatientsFromDB);

router.get("/:id", PatientController.getPatientByIdFromDB);

router.patch("/:id", PatientController.updatePatientIntoDB);

router.delete("/:id", PatientController.deletePatientFromDB);
router.delete("/soft/:id", PatientController.softDeletePatient);

export const PatientRoutes = router;
