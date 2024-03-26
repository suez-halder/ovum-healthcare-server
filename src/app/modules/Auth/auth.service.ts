//* src/app/modules/Auth/auth.service.ts
import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";
import config from "../../../config";

const loginUser = async (payload: { email: string; password: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE,
        },
    });

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
            drole: userData.role,
        },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    return {
        accessToken,
        needPasswordChange: userData.needPasswordChange,
    };
};

export const AuthServices = {
    loginUser,
    refreshToken,
};
