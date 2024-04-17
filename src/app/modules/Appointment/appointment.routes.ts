//* src/app/modules/Appointment/appointment.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AppointmentController } from "./appointment.controller";
import { AppointmentValidation } from "./appointment.validation";

const router = express.Router();

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AppointmentController.getAllAppointmentsFromDB
);

router.get(
    "/my-appointment",
    auth(UserRole.PATIENT, UserRole.DOCTOR),
    AppointmentController.getMyAppointment
);

router.post(
    "/",
    auth(UserRole.PATIENT),
    validateRequest(AppointmentValidation.createAppointmentIntoDB),
    AppointmentController.createAppointmentIntoDB
);

router.patch(
    "/status/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
    AppointmentController.changeAppointmentStatus
);

export const AppointmentRoutes = router;
