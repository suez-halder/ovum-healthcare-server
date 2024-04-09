//* src/app/modules/Schedule/schedule.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { ScheduleController } from "./schedule.controller";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    ScheduleController.createScheduleIntoDB
);

export const ScheduleRoutes = router;
