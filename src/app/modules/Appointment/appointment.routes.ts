//* src/app/modules/Appointment/appointment.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { AppointmentController } from "./appointment.controller";

const router = express.Router();

router.get(
    "/my-appointment",
    auth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentController.getMyAppointment
);

router.post(
    "/",
    auth(UserRole.PATIENT),
    AppointmentController.createAppointmentIntoDB
);

export const AppointmentRoutes = router;
