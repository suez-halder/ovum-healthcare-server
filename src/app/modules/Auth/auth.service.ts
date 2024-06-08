//* src/app/modules/Auth/auth.service.ts
import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { Secret } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";
import config from "../../../config";
import emailSender from "./emailSender";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

// -------- //
//! Login
// -------- //

const loginUser = async (payload: { email: string; password: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE,
        },
    });

    console.log(userData);

    const isPasswordCorrect: boolean = await bcrypt.compare(
        payload.password,
        userData.password
    );

    if (!isPasswordCorrect) {
        throw new Error("Password incorrect");
    }

    // * ---------------- * //
    //!  Access Token !//
    // * ---------------- * //

    const accessToken = jwtHelpers.generateToken(
        {
            email: userData.email,
            role: userData.role,
        },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    // * ----------------------------- * //
    //!  Set Refresh Token into Cookie
    // * ----------------------------- * //

    const refreshToken = jwtHelpers.generateToken(
        {
            email: userData.email,
            role: userData.role,
        },
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string
    );

    return {
        accessToken,
        refreshToken,
        needPasswordChange: userData.needPasswordChange,
    };
};

// -------------------------------------------- //
//! Generating access token from refresh token
// -------------------------------------------- //

const refreshToken = async (token: string) => {
    let decodedData;
    try {
        decodedData = jwtHelpers.verifyToken(
            token,
            config.jwt.refresh_token_secret as Secret
        );
        // console.log(decodedData);
    } catch (err) {
        throw new Error("You are not authorized!");
    }

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData?.email,
            status: UserStatus.ACTIVE,
        },
    });

    const accessToken = jwtHelpers.generateToken(
        {
            email: userData.email,
            role: userData.role,
        },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    return {
        accessToken,
        needPasswordChange: userData.needPasswordChange,
    };
};

// ------------------ //
//! Change Password
// ------------------ //

const changePassword = async (user: any, payload: any) => {
    // console.log(user);

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const isPasswordCorrect: boolean = await bcrypt.compare(
        payload.oldPassword,
        userData.password
    );

    if (!isPasswordCorrect) {
        throw new Error("Password incorrect");
    }

    const hashedPassword: string = bcrypt.hashSync(
        payload.newPassword,
        Number(config.salt_rounds) as number
    );

    await prisma.user.update({
        where: {
            email: userData.email,
            status: UserStatus.ACTIVE,
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false,
        },
    });

    return {
        status: httpStatus.OK,
        message: "Password changed successfully!",
    };
};

// ------------------ //
//! Forgot Password
// ------------------ //

const forgotPassword = async (email: string) => {
    // const userData = await prisma.user.findUniqueOrThrow({
    //     where: {
    //         email: payload.email,
    //         status: UserStatus.ACTIVE,
    //     },
    // });

    // const resetPassToken = jwtHelpers.generateToken(
    //     { email: userData.email, role: userData.role },
    //     config.jwt.reset_pass_token_secret as Secret,
    //     config.jwt.reset_pass_token_expires_in as string
    // );

    const isUserExist = await prisma.user.findUnique({
        where: {
            email: email,
            status: UserStatus.ACTIVE,
        },
    });

    if (!isUserExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User does not exist!");
    }

    const resetPassToken = await jwtHelpers.createPasswordResetToken({
        id: isUserExist.id,
    });

    // console.log(resetPassToken);

    // ? FORMAT:  http://localhost:5173/reset-pass?email=suezupwork@gmail.com&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN1ZXp1cHdvcmtAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzExNDM0MzE0LCJleHAiOjE3MTE0MzQ5MTR9.2TLzIDoMSleXX88_26DLU6e__J17TMcxUSeuvz3U-MM

    // const resetPassLink =
    //     config.reset_pass_link +
    //     `?userId=${isUserExist.id}&token=${resetPassToken}`;

    const resetPassLink: string =
        config.reset_pass_link +
        `?id=${isUserExist.id}&token=${resetPassToken}`;

    // ----------------------------- //
    //! Sending password reset email
    // ----------------------------- //

    // await emailSender(
    //     userData.email,
    //     `
    //         <div>Suezupwork123@gmail.com
    //             <p>Dear User,</p>
    //             <p>Your password reset link:
    //                 <a href=${resetPassLink}>
    //                     <button>
    //                         Reset Password
    //                     </button>
    //                 </a>
    //             </p>
    //         </div>

    //     `
    // );

    await emailSender(
        email,
        `
    <div>
      <p>Dear ${isUserExist.role},</p>
      <p>Your password reset link: <a href=${resetPassLink}><button>RESET PASSWORD<button/></a></p>
      <p>Thank you</p>
    </div>
`
    );

    // console.log(resetPassLink);
};

// ------------------ //
//! Reset Password
// ------------------ //

const resetPassword = async (
    payload: { id: string; newPassword: string },
    token: string
) => {
    const isUserExist = await prisma.user.findUniqueOrThrow({
        where: {
            id: payload.id,
            status: UserStatus.ACTIVE,
        },
    });

    if (!isUserExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
    }

    const isValidToken = jwtHelpers.verifyToken(
        token,
        config.jwt.reset_pass_token_secret as string
    );

    if (!isValidToken) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
    }

    // hash password
    const password = await bcrypt.hash(
        payload.newPassword,
        Number(config.salt_rounds) as number
    );

    // update into database
    await prisma.user.update({
        where: {
            id: payload.id,
        },
        data: {
            password,
        },
    });
};

export const AuthServices = {
    loginUser,
    refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
};
