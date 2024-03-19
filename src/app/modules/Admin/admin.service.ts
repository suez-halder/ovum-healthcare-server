//* src/app/modules/Admin/admin.service.ts
import { Admin, Prisma, PrismaClient, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { adminSearchableFields } from "./admin.constant";

// * -------------------------- * //
//! Get All Admins
// * -------------------------- * //

const getAllAdminsFromDB = async (params: any, options: any) => {
    const { searchTerm, ...filterData } = params;
    const { page, limit, skip } = paginationHelper.calculatePagination(options);
    // console.log(filterData);

    // -------------------------- //
    //! Search Functionality
    // -------------------------- //
    const andConditions: Prisma.AdminWhereInput[] = [];

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
            OR: adminSearchableFields.map((field) => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    // -------------------------------------------- //
    //! Filter Functionality on specific field
    // -------------------------------------------- //
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }

    // console.dir(andConditions, { depth: Infinity });

    const whereConditions: Prisma.AdminWhereInput = { AND: andConditions };

    const result = await prisma.admin.findMany({
        where: whereConditions,

        // -------------- //
        //! Pagination
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
        //! Sorting
        // ---------- //
        orderBy:
            options.sortBy && options.sortOrder
                ? {
                      [options.sortBy]: options.sortOrder,
                  }
                : {
                      createdAt: "desc",
                  },
    });

    const total = await prisma.admin.count({
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
//! Get Single Admin by ID
// * -------------------------- * //

const getAdminByIdFromDB = async (id: string): Promise<Admin | null> => {
    const result = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false,
        },
    });

    return result;
};

// * -------------------------- * //
//! UPDATE Admin by ID
// * -------------------------- * //

//* foreign key update korte parbona -> email

const updateAdminIntoDB = async (
    id: string,
    data: Partial<Admin>
): Promise<Admin | null> => {
    const isAdminExist = await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    const result = await prisma.admin.update({
        where: {
            id,
        },
        data,
    });

    return result;
};

// * -------------------------- * //
//! DELETE Admin by ID
// * -------------------------- * //

const deleteAdminFromDB = async (id: string): Promise<Admin | null> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
        },
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeleteData = await transactionClient.admin.delete({
            where: {
                id,
            },
        });

        await transactionClient.user.delete({
            where: {
                email: adminDeleteData.email,
            },
        });

        return adminDeleteData;
    });

    return result;
};

// * -------------------------- * //
//! Soft DELETE
// * -------------------------- * //

const softDeleteAdminFromDB = async (id: string): Promise<Admin | null> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false,
        },
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeleteData = await transactionClient.admin.update({
            where: {
                id,
            },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: adminDeleteData.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return adminDeleteData;
    });

    return result;
};

export const AdminServices = {
    getAllAdminsFromDB,
    getAdminByIdFromDB,
    updateAdminIntoDB,
    deleteAdminFromDB,
    softDeleteAdminFromDB,
};
