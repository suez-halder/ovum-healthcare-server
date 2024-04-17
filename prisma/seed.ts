//* prisma/seed.ts

import { UserRole } from "@prisma/client";
import prisma from "../src/shared/prisma";

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

        const superAdminData = await prisma.user.create({
            data: {
                email: "super@admin.com",
                password: "superAdmin123",
                role: UserRole.SUPER_ADMIN,
                admin: {
                    create: {
                        name: "Suez Halder",
                        // email: "super@admin.com", // as already given
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
