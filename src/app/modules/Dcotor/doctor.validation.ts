//* src/app/modules/Specialties/specialties.validation.ts

import { z } from "zod";

const createValidationSchema = z.object({
    title: z.string({
        required_error: "Title is required!",
    }),
});

export const specialtiesValidation = {
    createValidationSchema,
};
