//* prisma/seed.ts

import { UserRole } from "@prisma/client";
import config from "../src/config";
import prisma from "../src/shared/prisma";
import bcrypt from "bcrypt";

const seedSuperAdmin = async () => {
    try {
        const isExistSuperAdmin = await prisma.user.findFirst({
            where: {
                role: UserRole.SUPER_ADMIN,
            },
        });

        if (isExistSuperAdmin) {
            console.log("Super Admin already exists!");
            return;
        }

        const hashedPassword = await bcrypt.hash(
            config.super_admin.super_admin_password as string,
            Number(config.salt_rounds)
        );

        const superAdminData = await prisma.user.create({
            data: {
                email: config.super_admin.super_admin_email as string,
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                admin: {
                    create: {
                        name: "Super Admin",
                        contactNumber: "0001777895421",
                    },
                },
            },
        });

        console.log("Super Admin created successfully!", superAdminData);
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
};

seedSuperAdmin();
