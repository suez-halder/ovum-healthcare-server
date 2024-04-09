import { Patient, Prisma, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { TPaginationOptions } from "../../interfaces/pagination.types";
import { patientSearchableFields } from "./patient.constant";
import { TPatientFilterRequest, TPatientUpdate } from "./patient.interface";

const getAllPatientsFromDB = async (
    filters: TPatientFilterRequest,
    options: TPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            OR: patientSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: (filterData as any)[key],
                    },
                };
            }),
        });
    }
    andConditions.push({
        isDeleted: false,
    });

    const whereConditions: Prisma.PatientWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.patient.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                      createdAt: "desc",
                  },
        include: {
            medicalReport: true,
            patientHealthData: true,
        },
    });
    const total = await prisma.patient.count({
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

const getPatientByIdFromDB = async (id: string): Promise<Patient | null> => {
    const result = await prisma.patient.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            medicalReport: true,
            patientHealthData: true,
        },
    });
    return result;
};

const updatePatientIntoDB = async () => {
    console.log("Patient Data Updated");
};

const deletePatientFromDB = async (id: string): Promise<Patient | null> => {
    const result = await prisma.$transaction(async (tx) => {
        // delete medical report
        await tx.medicalReport.deleteMany({
            where: {
                patientId: id,
            },
        });

        // delete patient health data
        await tx.patientHealthData.delete({
            where: {
                patientId: id,
            },
        });

        const deletedPatient = await tx.patient.delete({
            where: {
                id,
            },
        });

        await tx.user.delete({
            where: {
                email: deletedPatient.email,
            },
        });

        return deletedPatient;
    });

    return result;
};

const softDeletePatient = async (id: string): Promise<Patient | null> => {
    return await prisma.$transaction(async (transactionClient) => {
        const deletedPatient = await transactionClient.patient.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: deletedPatient.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return deletedPatient;
    });
};

export const PatientService = {
    getAllPatientsFromDB,
    getPatientByIdFromDB,
    updatePatientIntoDB,
    deletePatientFromDB,
    softDeletePatient,
};
