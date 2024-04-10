//* src/app/modules/Schedule/schedule.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { ScheduleController } from "./schedule.controller";

const router = express.Router();

router.get(
    "/",
    auth(UserRole.DOCTOR),
    ScheduleController.getAllSchedulesFromDB
);

router.get(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
    ScheduleController.getScheduleByIdFromDB
);

router.post(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    ScheduleController.createScheduleIntoDB
);

router.delete(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    ScheduleController.deleteScheduleFromDB
);

export const ScheduleRoutes = router;
