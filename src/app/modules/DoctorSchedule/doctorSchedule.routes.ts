//* src/app/modules/Schedule/doctorSchedules.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { DoctorScheduleController } from "./doctorSchedule.controller";

const router = express.Router();

router.get(
    "/my-schedule",
    auth(UserRole.DOCTOR),
    DoctorScheduleController.getDoctorSchedulesFromDB
);

router.post(
    "/",
    auth(UserRole.DOCTOR),
    DoctorScheduleController.createDoctorScheduleIntoDB
);

export const DoctorScheduleRoutes = router;
