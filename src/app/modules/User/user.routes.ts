//* src/app/modules/User/user.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { userController } from "./user.controller";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    userController.createAdmin
);

export const UserRoutes = router;
