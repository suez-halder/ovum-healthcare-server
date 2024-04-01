//* src/app/modules/User/user.service.ts

import {
    Admin,
    Doctor,
    Patient,
    Prisma,
    UserRole,
    UserStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { Request } from "express";
import config from "../../../config";
import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { TFile } from "../../interfaces/file.types";
import { TPaginationOptions } from "../../interfaces/pagination.types";
import { userSearchableFields } from "./user.constant";

// * -------------------------- * //
//! Create Admin
// * -------------------------- * //

const createAdmin = async (req: Request): Promise<Admin> => {
    // console.log("File: ", req.file);
    // console.log("Data: ", req.body.data);

    const file = req.file as TFile;

    // console.log(req.fbody);

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        // console.log(uploadToCloudinary);
        req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
        // console.log(req.body);
    }

    const hashedPassword: string = bcrypt.hashSync(
        req.body.password,
        Number(config.salt_rounds)
    );

    const userData = {
        email: req.body.admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
    };

    //! Using transaction as user table and admin table will create simultaneously
    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData,
        });

        const createdAdminData = await transactionClient.admin.create({
            data: req.body.admin,
        });

        return createdAdminData;
    });

    return result;
};

// * -------------------------- * //
//!  Create Doctor
// * -------------------------- * //

const createDoctor = async (req: Request): Promise<Doctor> => {
    // console.log("File: ", req.file);
    // console.log("Data: ", req.body.data);

    const file = req.file as TFile;

    // console.log(req.body);

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        // console.log(uploadToCloudinary);
        req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
        // console.log(req.body);
    }

    const hashedPassword: string = bcrypt.hashSync(
        req.body.password,
        Number(config.salt_rounds)
    );

    const userData = {
        email: req.body.doctor.email,
        password: hashedPassword,
        role: UserRole.DOCTOR,
    };

    //! Using transaction as user table and admin table will create simultaneously
    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData,
        });

        const createDoctorData = await transactionClient.doctor.create({
            data: req.body.doctor,
        });

        return createDoctorData;
    });

    return result;
};
// * -------------------------- * //
//!  Create Patient
// * -------------------------- * //

const createPatient = async (req: Request): Promise<Patient> => {
    // console.log("File: ", req.file);
    // console.log("Data: ", req.body.data);

    const file = req.file as TFile;

    // console.log(req.body);

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        // console.log(uploadToCloudinary);
        req.body.patient.profilePhoto = uploadToCloudinary?.secure_url;
        // console.log(req.body);
    }

    const hashedPassword: string = bcrypt.hashSync(
        req.body.password,
        Number(config.salt_rounds)
    );

    const userData = {
        email: req.body.patient.email,
        password: hashedPassword,
        role: UserRole.PATIENT,
    };

    //! Using transaction as user table and admin table will create simultaneously
    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData,
        });

        const createPatientData = await transactionClient.patient.create({
            data: req.body.patient,
        });

        return createPatientData;
    });

    return result;
};

// * -------------------------------- * //
//! Get All Users with Filtering/Searching
// * -------------------------------- * //

const getAllUsersFromDB = async (params: any, options: TPaginationOptions) => {
    console.log(params);
    const { searchTerm, ...filterData } = params;
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    // console.log(filterData);

    // -------------------------- //
    //? Search Functionality
    // -------------------------- //
    const andConditions: Prisma.UserWhereInput[] = [];

    /*  Format:
            [
                {
                    name: {
                        contains: params.searchTerm,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: params.searchTerm,
                        mode: "insensitive",
                    },
                },
            ],
     */

    if (params.searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map((field) => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    // -------------------------------------------- //
    //? Filter Functionality on specific field
    // -------------------------------------------- //
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key],
                },
            })),
        });
    }

    // console.dir(andConditions, { depth: Infinity });

    const whereConditions: Prisma.UserWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.user.findMany({
        where: whereConditions,

        // -------------- //
        //? Pagination
        // -------------- //
        /*  data = 1, 2, 3, 4, 5, 6, 7, 8
            page = 2
            limit = 2

            skip = 2
            -- FORMULA = (page - 1) * limit --
        */

        // skip: (Number(page) - 1) * limit,
        // take: Number(limit),

        skip,
        take: limit,

        // ---------- //
        //? Sorting
        // ---------- //
        orderBy:
            options.sortBy && options.sortOrder
                ? {
                      [options.sortBy]: options.sortOrder,
                  }
                : {
                      createdAt: "desc",
                  },
        // ! password dekhte chaina response e
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            // select use korle include deya jaabena, tokhn eivabe deya jaay
            admin: true,
            doctor: true,
            patient: true,
        },
        // include: {
        //     admin: true,
        //     doctor: true,
        //     patient: true,
        // }
    });

    const total = await prisma.user.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
};

// * -------------------------- * //
//!  Change Profile Status
// * -------------------------- * //

const changeProfileStatus = async (id: string, status: UserRole) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id,
            status: UserStatus.ACTIVE,
        },
    });

    const updateUserStatus = await prisma.user.update({
        where: {
            id,
        },
        data: status,
    });

    return updateUserStatus;
};

// * --------------------- * //
//!  Get My Profile
// * --------------------- * //

const getMyProfile = async (user: any) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            needPasswordChange: true,
            role: true,
            status: true,
        },
    });

    let profileInfo;

    if (userInfo.role === UserRole.SUPER_ADMIN) {
        profileInfo = await prisma.admin.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    } else if (userInfo.role === UserRole.ADMIN) {
        profileInfo = await prisma.admin.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    } else if (userInfo.role === UserRole.DOCTOR) {
        profileInfo = await prisma.doctor.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    } else if (userInfo.role === UserRole.PATIENT) {
        profileInfo = await prisma.patient.findUnique({
            where: {
                email: userInfo.email,
            },
        });
    }

    return { ...userInfo, ...profileInfo };
};

// * --------------------- * //
//!  Update My Profile
// * --------------------- * //

const updateMyProfile = async (user: any, payload: any) => {
    //? check-1: if user exists
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE,
        },
    });

    //? check-2: which role
    let profileInfo;

    if (userInfo.role === UserRole.SUPER_ADMIN) {
        profileInfo = await prisma.admin.update({
            where: {
                email: userInfo.email,
            },
            data: payload,
        });
    } else if (userInfo.role === UserRole.ADMIN) {
        profileInfo = await prisma.admin.update({
            where: {
                email: userInfo.email,
            },
            data: payload,
        });
    } else if (userInfo.role === UserRole.DOCTOR) {
        profileInfo = await prisma.doctor.update({
            where: {
                email: userInfo.email,
            },
            data: payload,
        });
    } else if (userInfo.role === UserRole.PATIENT) {
        profileInfo = await prisma.patient.update({
            where: {
                email: userInfo.email,
            },
            data: payload,
        });
    }

    return { ...profileInfo };
};

export const userService = {
    createAdmin,
    createDoctor,
    createPatient,
    getAllUsersFromDB,
    changeProfileStatus,
    getMyProfile,
    updateMyProfile,
};
