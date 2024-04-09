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

const updatePatientIntoDB = async (id: string, payload: any) => {
    const { patientHealthData, medicalReport, ...patientData } = payload;

    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const result = await prisma.$transaction(async (tx) => {
        //* update patient data
        const updatedPatient = await tx.patient.update({
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
    });

    // return result;
};

const deletePatientFromDB = async (id: string) => {
    console.log("Patient deleted");
};

const softDeletePatient = async (id: string) => {
    console.log("Patient soft deleted");
};

export const PatientService = {
    getAllPatientsFromDB,
    getPatientByIdFromDB,
    updatePatientIntoDB,
    deletePatientFromDB,
    softDeletePatient,
};
