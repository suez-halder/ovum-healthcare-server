//* src/app/modules/Specialties/specialties.service.ts

import { Request } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import prisma from "../../../shared/prisma";
import { TFile } from "../../interfaces/file.types";

// * --------------------- * //
//!  Update Doctor Profile
// * --------------------- * //
const updateDoctorIntoDB = async (id: string, payload: any) => {
    const { specialties, ...doctorData } = payload;

    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
        where: {
            id,
        },
    });

    //? We have to use transaction as while updating doctor data we need to create doctorSpecialties

    await prisma.$transaction(async (transactionClient) => {
        //! update doctor profile only
        await transactionClient.doctor.update({
            where: {
                id,
            },
            data: doctorData,
            include: {
                doctorSpecialties: true,
            },
        });

        //! specialty er moddhe specialtiesId data thakle add/delete korte hobe
        if (specialties && specialties.length > 0) {
            //* delete doctorSpecialties of the specified doctor
            const deleteSpecialtiesId = specialties.filter(
                (specialty: { specialtiesId: string; isDeleted: boolean }) =>
                    specialty.isDeleted
            );

            for (const specialtyId of deleteSpecialtiesId) {
                // delete dileo hoito, kintu ts array mone kore deikha deleteMany use korte hoitese
                await transactionClient.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: doctorInfo.id,
                        specialtiesId: specialtyId.specialtiesId,
                    },
                });
            }

            //* create doctorSpecialties of the specified doctor
            const createSpecialtiesId = specialties.filter(
                (specialty: { specialtiesId: string; isDeleted: boolean }) =>
                    !specialty.isDeleted
            );

            for (const specialtyId of createSpecialtiesId) {
                await transactionClient.doctorSpecialties.create({
                    data: {
                        doctorId: doctorInfo.id,
                        specialtiesId: specialtyId.specialtiesId,
                    },
                });
            }
        }
    });

    const result = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: doctorInfo.id,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
        },
    });

    return result;
};

export const DoctorService = {
    // getAllDoctorsFromDB,
    // getDoctorByIdFromDB,
    updateDoctorIntoDB,
    // deleteDoctorFromDB,
    // softDeleteDoctorFromDB,
};
