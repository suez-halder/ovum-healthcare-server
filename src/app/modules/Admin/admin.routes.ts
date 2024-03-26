//* src/app/modules/Admin/admin.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AdminControllers } from "./admin.controller";
import { adminValidationSchema } from "./admin.validations";

const router = express.Router();

router.get(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminControllers.getAllAdminsFromDB
);

router.get(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminControllers.getAdminByIdFromDB
);

router.patch(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    validateRequest(adminValidationSchema.updateAdminIntoDB),
    AdminControllers.updateAdminIntoDB
);

router.delete(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminControllers.deleteAdminFromDB
);

router.delete(
    "/soft/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    AdminControllers.softDeleteAdminFromDB
);

export const AdminRoutes = router;
