//* src/app/modules/Admin/admin.service.ts
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAllAdminsFromDB = async (params: any) => {
    // ------------------------------------ //
    //! Implementing Search Functionality
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
            OR: ["name", "email", "contactNumber"].map((field) => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    console.dir(andConditions, { depth: Infinity });

    const whereConditions: Prisma.AdminWhereInput = { AND: andConditions };

    const result = await prisma.admin.findMany({
        where: whereConditions,
    });
    return result;
};

export const AdminServices = {
    getAllAdminsFromDB,
};
