//* src/app/modules/Review/review.service.ts

import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { TAuthUser } from "../../interfaces/common";
import { TPaginationOptions } from "../../interfaces/pagination.types";

// * -------------------------- * //
//!  Create Review
// * -------------------------- * //

const createReviewIntoDB = async (payload: any, user: TAuthUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
        },
    });

    if (!(patientData.id === appointmentData.patientId)) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "This is not your appointment"
        );
    }

    return await prisma.$transaction(async (tx) => {
        const result = await tx.review.create({
            data: {
                appointmentId: appointmentData.id,
                doctorId: appointmentData.doctorId,
                patientId: appointmentData.patientId,
                rating: payload.rating,
                comment: payload.comment,
            },
        });

        // get average rating from review table
        const averageRating = await tx.review.aggregate({
            _avg: {
                rating: true,
            },
        });

        // update averageRating in Doctor table
        await tx.doctor.update({
            where: {
                id: appointmentData.doctorId,
            },
            data: {
                averageRating: averageRating._avg.rating as number,
            },
        });
        return result;
    });
};

// * -------------------------- * //
//!  Get All Reviews
// * -------------------------- * //

const getAllReviewsFromDB = async (
    filters: any,
    options: TPaginationOptions
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { patientEmail, doctorEmail } = filters;
    const andConditions = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail,
            },
        });
    }

    if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail,
            },
        });
    }

    const whereConditions: Prisma.ReviewWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.review.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                      createdAt: "desc",
                  },
        include: {
            doctor: true,
            patient: true,
            //appointment: true,
        },
    });
    const total = await prisma.review.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

export const ReviewService = {
    createReviewIntoDB,
    getAllReviewsFromDB,
};
