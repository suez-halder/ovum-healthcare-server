//* src/app/modules/Meta/meta.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { TAuthUser } from "../../interfaces/common";
import { MetaService } from "./meta.service";

const fetchDashboardMetaData = catchAsync(async (req, res) => {
    const user = req.user as TAuthUser;
    const result = await MetaService.fetchDashboardMetaData(user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Meta Data fetched successfully!",
        data: result,
    });
});

export const MetaController = {
    fetchDashboardMetaData,
};
