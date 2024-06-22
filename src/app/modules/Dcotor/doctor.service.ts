//* src/app/modules/Specialties/specialties.service.ts

import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { Request } from "express";
import httpStatus from "http-status";
import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { asyncForEach } from "../../../shared/utils";
import ApiError from "../../errors/ApiError";
import { TFile } from "../../interfaces/file.types";
import { doctorSearchableFields } from "./doctor.constant";
import { TDoctorUpdate, TSpecialties } from "./doctor.interface";

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
                : { averageRating: "desc" },
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
const updateDoctorIntoDB = async (
    id: string,
    payload: Partial<TDoctorUpdate>
): Promise<Doctor | null> => {
    const { specialties, ...doctorData } = payload;

    await prisma.$transaction(async (transactionClient) => {
        const doctorInfo = await transactionClient.doctor.update({
            where: {
                id,
            },
            data: doctorData,
        });

        if (!doctorInfo) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Unable to update Doctor"
            );
        }
        if (specialties && specialties.length > 0) {
            const deleteSpecialties = specialties.filter(
                (specialty) => specialty.specialtiesId && specialty.isDeleted
            );

            const newSpecialties = specialties.filter(
                (specialty) => specialty.specialtiesId && !specialty.isDeleted
            );

            await asyncForEach(
                deleteSpecialties,
                async (deleteDoctorSpeciality: TSpecialties) => {
                    await transactionClient.doctorSpecialties.deleteMany({
                        where: {
                            AND: [
                                {
                                    doctorId: id,
                                },
                                {
                                    specialtiesId:
                                        deleteDoctorSpeciality.specialtiesId,
                                },
                            ],
                        },
                    });
                }
            );
            await asyncForEach(
                newSpecialties,
                async (insertDoctorSpecialty: TSpecialties) => {
                    //@ needed for already added specialties
                    const existingSpecialties =
                        await prisma.doctorSpecialties.findFirst({
                            where: {
                                specialtiesId:
                                    insertDoctorSpecialty.specialtiesId,
                                doctorId: id,
                            },
                        });

                    if (!existingSpecialties) {
                        await transactionClient.doctorSpecialties.create({
                            data: {
                                doctorId: id,
                                specialtiesId:
                                    insertDoctorSpecialty.specialtiesId,
                            },
                        });
                    }
                }
            );
        }

        return doctorInfo;
    });

    const result = await prisma.doctor.findUniqueOrThrow({
        where: {
            id,
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
