//* src/app/modules/Admin/admin.validation.ts

import { z } from "zod";

const updateAdminIntoDB = z.object({
    body: z.object({
        name: z.string().optional(),
        contactNumber: z.string().optional(),
    }),
});

export const adminValidationSchema = {
    updateAdminIntoDB,
};
