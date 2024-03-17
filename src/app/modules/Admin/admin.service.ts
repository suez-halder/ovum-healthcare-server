//* src/app/modules/Admin/admin.service.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAllAdminsFromDB = async () => {
    const result = await prisma.admin.findMany();
    return result;
};

export const AdminServices = {
    getAllAdminsFromDB,
};
