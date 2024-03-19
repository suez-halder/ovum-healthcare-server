//* src/app/modules/Admin/admin.routes.ts

import express from "express";
import { AdminControllers } from "./admin.controller";

const router = express.Router();

router.get("/", AdminControllers.getAllAdminsFromDB);
router.get("/:id", AdminControllers.getAdminByIdFromDB);
router.patch("/:id", AdminControllers.updateAdminIntoDB);
router.delete("/:id", AdminControllers.deleteAdminFromDB);
router.delete("/soft/:id", AdminControllers.softDeleteAdminFromDB);

export const AdminRoutes = router;
