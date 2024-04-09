//* src/app/modules/Patient/patient.service.ts

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

// * -------------------------------------------------- * //
//! update patient (patientHealthData, medicalReport)
// * -------------------------------------------------- * //

const updatePatientIntoDB = async (
    id: string,
    payload: TPatientUpdate
): Promise<Patient | null> => {
    const { patientHealthData, medicalReport, ...patientData } = payload;

    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            id,
        },
    });

    await prisma.$transaction(async (tx) => {
        //* update patient data
        await tx.patient.update({
            where: {
                id,
            },
            data: patientData,
            include: {
                patientHealthData: true,
                medicalReport: true,
            },
        });

        // console.log(patientHealthData);

        //* create or update patient health data
        if (patientHealthData) {
            const healthData = await tx.patientHealthData.upsert({
                where: {
                    patientId: patientInfo.id,
                },
                update: patientHealthData,
                create: { ...patientHealthData, patientId: patientInfo.id },
            });

            console.log(healthData);
        }

        if (medicalReport) {
            // patientId unique na, tai upsert kora jabena
            await tx.medicalReport.create({
                data: {
                    ...medicalReport,
                    patientId: patientInfo.id,
                },
            });
        }
    });

    const result = await prisma.patient.findUnique({
        where: {
            id: patientInfo.id,
        },
        include: {
            patientHealthData: true,
            medicalReport: true,
        },
    });

    return result;
};

const deletePatientFromDB = async (id: string) => {
    //* step-1: je foreign field e @relation nai, setake aage delete korte hobe, example: patientHealthData, medicalReport
    //* step-2: schema delete korte hobe
    //* step-3: tarpor @relation lekha jeta thakbe seta delete korte hobe. example: user

    const result = await prisma.$transaction(async (tx) => {
        // step-1: delete medical report
        await tx.medicalReport.deleteMany({
            where: {
                patientId: id,
            },
        });

        // step-1: delete patient health data
        await tx.patientHealthData.delete({
            where: {
                patientId: id,
            },
        });

        // step-2: delete patient schema
        const deletedPatient = await tx.patient.delete({
            where: {
                id,
            },
        });

        // step-2: delete user
        await tx.user.delete({
            where: {
                email: deletedPatient.email,
            },
        });

        return deletedPatient;
    });

    return result;
};

const softDeletePatient = async (id: string) => {
    return await prisma.$transaction(async (tx) => {
        const deletedPatient = await tx.patient.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        await tx.user.update({
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
