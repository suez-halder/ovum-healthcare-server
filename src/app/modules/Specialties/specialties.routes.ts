//* src/app/modules/Specialties/specialties.routes.ts

import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import { specialtiesController } from "./specialties.controller";
import { specialtiesValidation } from "./specialties.validation";

const router = express.Router();
router.get("/", specialtiesController.getAllSpecialtyFromDB);

router.post(
    "/",
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = specialtiesValidation.createValidationSchema.parse(
            JSON.parse(req.body.data)
        );
        return specialtiesController.createSpecialtyIntoDB(req, res, next);
    }
);

router.delete(
    "/:id",
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    specialtiesController.deleteSpecialtyFromDB
);

export const SpecialtiesRoutes = router;
