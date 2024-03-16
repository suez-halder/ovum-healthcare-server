//* src/app/modules/User/user.service.ts

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const createAdmin = async (payload: any) => {
    const hashedPassword: string = bcrypt.hashSync(payload.password, 12);

    const userData = {
        email: payload.admin.email,
        password: hashedPassword,
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
