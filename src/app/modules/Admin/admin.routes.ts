//* src/app/modules/Admin/admin.routes.ts

import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { AdminControllers } from "./admin.controller";
import { adminValidationSchema } from "./admin.validations";

const router = express.Router();

router.get("/", AdminControllers.getAllAdminsFromDB);
router.get("/:id", AdminControllers.getAdminByIdFromDB);
router.patch(
    "/:id",
    validateRequest(adminValidationSchema.updateAdminIntoDB),
    AdminControllers.updateAdminIntoDB
);
router.delete("/:id", AdminControllers.deleteAdminFromDB);
router.delete("/soft/:id", AdminControllers.softDeleteAdminFromDB);

export const AdminRoutes = router;
