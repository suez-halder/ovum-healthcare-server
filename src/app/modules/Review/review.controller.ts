//* src/app/modules/Prescription/prescription.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { TAuthUser } from "../../interfaces/common";
import { reviewFilterableFields } from "./review.constant";
import { ReviewService } from "./review.service";

// * -------------------------- * //
//!  Create Review
// * -------------------------- * //

const createReviewIntoDB = catchAsync(async (req, res) => {
    const user = req.user as TAuthUser;
    const result = await ReviewService.createReviewIntoDB(req.body, user);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Review created successfully!",
        data: result,
    });
});

// * -------------------------- * //
//!  Get All Reviews
// * -------------------------- * //
const getAllReviewsFromDB = catchAsync(async (req, res) => {
    const filters = pick(req.query, reviewFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await ReviewService.getAllReviewsFromDB(filters, options);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All Reviews fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});

export const ReviewController = {
    createReviewIntoDB,
    getAllReviewsFromDB,
};
