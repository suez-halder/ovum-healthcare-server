//* src/app/modules/Admin/admin.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAllAdminsFromDB = async (params: any) => {
    console.log({ params });
    const result = await prisma.admin.findMany({
        // ------------------------------------ //
        //! Implementing Search Functionality
        // ------------------------------------ //
        where: {
            OR: [
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
        },
    });
    return result;
};

export const AdminServices = {
    getAllAdminsFromDB,
};
