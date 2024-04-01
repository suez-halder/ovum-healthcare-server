//* src/app/modules/Specialties/specialties.routes.ts

import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import { specialtiesController } from "./specialties.controller";
import { specialtiesValidation } from "./specialties.validation";

const router = express.Router();

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

export const SpecialtiesRoutes = router;
