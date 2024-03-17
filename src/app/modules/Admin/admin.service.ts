//* src/app/modules/Admin/admin.service.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";

const prisma = new PrismaClient();

const getAllAdminsFromDB = async (params: any) => {
    const { searchTerm, ...filterData } = params;
    // console.log(filterData);
    // ------------------------------------ //
    //! Implementing Searching Functionality
    // ------------------------------------ //
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

    // ------------------------------------------------------- //
    //! Implementing Filtering Functionality on specific field
    // ------------------------------------------------------- //
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
    });
    return result;
};

export const AdminServices = {
    getAllAdminsFromDB,
};
