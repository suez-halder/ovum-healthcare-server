//* src/app/modules/User/user.service.ts

import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import config from "../../../config";
import { fileUploader } from "../../../helpers/fileUploader";
import prisma from "../../../shared/prisma";

const createAdmin = async (req: any) => {
    // console.log("File: ", req.file);
    // console.log("Data: ", req.body.data);

    const file = req.file;

    // console.log(req.body);

    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
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

export const userService = {
    createAdmin,
};
