//* src/app/modules/Specialties/specialties.service.ts

import { Specialties } from "@prisma/client";
import { Request } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import prisma from "../../../shared/prisma";
import { TFile } from "../../interfaces/file.types";

// * -------------------------- * //
//!  Create Specialty
// * -------------------------- * //

const createSpecialtyIntoDB = async (req: Request) => {
    const file = req.file as TFile;
    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.icon = uploadToCloudinary?.secure_url;
    }

    const result = await prisma.specialties.create({
        data: req.body,
    });

    return result;
};

// * -------------------------- * //
//!  Get All Specialties
// * -------------------------- * //
const getAllSpecialtyFromDB = async (): Promise<Specialties[]> => {
    return await prisma.specialties.findMany();
};

// * -------------------------- * //
//!  Delete Specialty
// * -------------------------- * //

const deleteSpecialtyFromDB = async (id: string): Promise<Specialties> => {
    const result = await prisma.specialties.delete({
        where: {
            id,
        },
    });
    return result;
};

export const specialtiesService = {
    createSpecialtyIntoDB,
    getAllSpecialtyFromDB,
    deleteSpecialtyFromDB,
};
