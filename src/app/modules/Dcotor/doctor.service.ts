//* src/app/modules/Specialties/specialties.service.ts

import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { Request } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { TFile } from "../../interfaces/file.types";
import { doctorSearchableFields } from "./doctor.constant";

// * --------------------- * //
//!  Get ALl Doctors
// * --------------------- * //

const getAllDoctorsFromDB = async (filters: any, options: any) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;

    const andConditions: Prisma.DoctorWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    // doctor > doctorSpecialties > specialties > title
    if (specialties && specialties.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialties: {
                        title: {
                            contains: specialties,
                            mode: "insensitive",
                        },
                    },
                },
            },
        });
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData as any)[key],
            },
        }));
        andConditions.push(...filterConditions);
    }

    andConditions.push({
        isDeleted: false,
    });

    const whereConditions: Prisma.DoctorWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : { createdAt: "desc" },
        include: {
            doctorSpecialties: {
                include: {
                    specialties: true,
                },
            },
        },
    });

    const total = await prisma.doctor.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

// * --------------------- * //
//!  Get Single Doctor
// * --------------------- * //

const getDoctorByIdFromDB = async (id: string): Promise<Doctor | null> => {
    const result = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
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

// * --------------------- * //
//!  Delete Doctor
// * --------------------- * //

const deleteDoctorFromDB = async (id: string): Promise<Doctor> => {
    return await prisma.$transaction(async (transactionClient) => {
        const deleteDoctor = await transactionClient.doctor.delete({
            where: {
                id,
            },
        });

        await transactionClient.user.delete({
            where: {
                email: deleteDoctor.email,
            },
        });

        return deleteDoctor;
    });
};

// * --------------------- * //
//!  Soft Delete Doctor
// * --------------------- * //

const softDeleteDoctorFromDB = async (id: string): Promise<Doctor> => {
    return await prisma.$transaction(async (transactionClient) => {
        const deleteDoctor = await transactionClient.doctor.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: deleteDoctor.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return deleteDoctor;
    });
};

export const DoctorService = {
    getAllDoctorsFromDB,
    getDoctorByIdFromDB,
    updateDoctorIntoDB,
    deleteDoctorFromDB,
    softDeleteDoctorFromDB,
};
