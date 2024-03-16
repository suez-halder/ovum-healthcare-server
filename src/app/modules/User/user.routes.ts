import express from "express";
import { userService } from "./user.service";

const router = express.Router();

router.get("/", userService.createAdmin);

export const userRoutes = router;
