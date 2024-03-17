//* src/app/modules/Admin/admin.routes.ts

import express from "express";
import { AdminControllers } from "./admin.controller";

const router = express.Router();

router.get("/", AdminControllers.getAllAdminsFromDB);

export const AdminRoutes = router;
