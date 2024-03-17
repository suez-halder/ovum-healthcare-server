//* src/app/modules/Admin/admin.service.ts
import { Prisma, PrismaClient } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";

const prisma = new PrismaClient();

const getAllAdminsFromDB = async (params: any, options: any) => {
    const { searchTerm, ...filterData } = params;
    const { limit, page } = options;
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
        // ------------------------- //
        //! Implementing Pagination
        // ------------------------- //
        /*  data = 1, 2, 3, 4, 5, 6, 7, 8
            page = 2
            limit = 2

            skip = 2
            -- FORMULA = (page - 1) * limit --
        */

        skip: (Number(page) - 1) * limit,
        take: Number(limit),
    });
    return result;
};

export const AdminServices = {
    getAllAdminsFromDB,
};
