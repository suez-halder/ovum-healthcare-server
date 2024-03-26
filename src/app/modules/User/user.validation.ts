//* src/app/modules/User/user.validation.ts

import { Gender } from "@prisma/client";
import { z } from "zod";

// * -------------------------- * //
//! Create Admin Validation
// * -------------------------- * //

const createAdmin = z.object({
    password: z.string({
        required_error: "Password is required",
    }),
    admin: z.object({
        name: z.string({
            required_error: "Name is required",
        }),
        email: z.string({
            required_error: "Email is required",
        }),
        contactNumber: z.string({
            required_error: "Contact number is required",
        }),
    }),
});

// * -------------------------- * //
//! Create Doctor Validation
// * -------------------------- * //

const createDoctor = z.object({
    password: z.string({
        required_error: "Password is required",
    }),
    doctor: z.object({
        name: z.string({
            required_error: "Name is required",
        }),
        email: z.string({
            required_error: "Email is required",
        }),
        profilePhoto: z.string().optional(),
        contactNumber: z.string({
            required_error: "Contact number is required",
        }),
        address: z.string().optional(),
        registrationNumber: z.string({
            required_error: "Registration number is required",
        }),
        experience: z.number().int().default(0),
        gender: z.enum([Gender.MALE, Gender.FEMALE]),
        appointmentFee: z.number().int(),
        qualification: z.string({
            required_error: "Qualification is required",
        }),
        currentWorkingPlace: z.string({
            required_error: "Current working place is required",
        }),
        designation: z.string({
            required_error: "Designation is required",
        }),
        isDeleted: z.boolean().default(false),
    }),
});
// * -------------------------- * //
//! Create Patient Validation
// * -------------------------- * //

const createPatient = z.object({
    password: z.string({
        required_error: "Password is required",
    }),
    patient: z.object({
        name: z.string({
            required_error: "Name is required",
        }),
        email: z.string({
            required_error: "Email is required",
        }),
        profilePhoto: z.string().optional(),
        contactNumber: z.string({
            required_error: "Contact number is required",
        }),
        address: z.string().optional(),
        isDeleted: z.boolean().default(false),
    }),
});

export const userValidation = {
    createAdmin,
    createDoctor,
    createPatient,
};
