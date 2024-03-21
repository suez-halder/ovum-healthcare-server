//* src/app/modules/Auth/auth.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";

// -------- //
//! Login
// -------- //

const loginUser = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUser(req.body);

    const { refreshToken } = result;

    res.cookie("refreshToken", refreshToken, {
        secure: false,
        httpOnly: true,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully!",
        data: {
            accessToken: result.accessToken,
            needsPasswordChange: result.needPasswordChange,
        },
    });
});

// -------------------------------------------- //
//! Generating access token from refresh token
// -------------------------------------------- //

const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;
    // console.log(refreshToken);
    const result = await AuthServices.refreshToken(refreshToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully!",
        data: result,
        // data: {
        //     accessToken: result.accessToken,
        //     needsPasswordChange: result.needPasswordChange,
        // },
    });
});

export const AuthControllers = {
    loginUser,
    refreshToken,
};
