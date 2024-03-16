import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const createAdmin = async (payload: any) => {
    const userData = {
        email: payload.admin.email,
        password: payload.password,
        role: UserRole.ADMIN,
    };

    //! Using transaction as user table and admin table will create simultaneously
    const result = await prisma.$transaction(async (transactionClient) => {
        await transactionClient.user.create({
            data: userData,
        });

        const createdAdminData = await transactionClient.admin.create({
            data: payload.admin,
        });

        return createdAdminData;
    });

    return result;
};

export const userService = {
    createAdmin,
};
