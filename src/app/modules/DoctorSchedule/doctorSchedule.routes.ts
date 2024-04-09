//* src/app/modules/Schedule/doctorSchedules.routes.ts

import express from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";

const router = express.Router();

router.post("/", DoctorScheduleController.createDoctorScheduleIntoDB);

export const DoctorScheduleRoutes = router;
