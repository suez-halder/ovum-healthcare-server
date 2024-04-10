//* src/app/modules/Schedule/doctorSchedules.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { DoctorScheduleController } from "./doctorSchedule.controller";

const router = express.Router();

router.get(
    "/",
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.PATIENT
    ),
    DoctorScheduleController.getAllDoctorSchedulesFromDB
);

router.get(
    "/my-schedule",
    auth(UserRole.DOCTOR),
    DoctorScheduleController.getMySchedulesFromDB
);

router.post(
    "/",
    auth(UserRole.DOCTOR),
    DoctorScheduleController.createDoctorScheduleIntoDB
);

router.delete(
    "/:scheduleId",
    auth(UserRole.DOCTOR),
    DoctorScheduleController.deleteDoctorScheduleFromDB
);

export const DoctorScheduleRoutes = router;
