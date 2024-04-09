//* src/app/modules/Schedule/schedule.routes.ts

import express from "express";
import { ScheduleController } from "./schedule.controller";

const router = express.Router();

router.post("/", ScheduleController.createScheduleIntoDB);

export const ScheduleRoutes = router;
