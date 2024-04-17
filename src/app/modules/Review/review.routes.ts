//* src/app/modules/Prescription/prescription.routes.ts

import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { ReviewController } from "./review.controller";

const router = express.Router();

router.get("/", ReviewController.getAllReviewsFromDB);

router.post("/", auth(UserRole.PATIENT), ReviewController.createReviewIntoDB);

export const ReviewRoutes = router;
