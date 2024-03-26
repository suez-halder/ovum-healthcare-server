// * src/app/middlewares/auth.ts

import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import ApiError from "../errors/ApiError";

/**
 * req er moddhe user naame ekta property dhukacchi. 
 * eivabe dile prottekar req er moddhe user dite hoito
 * eijnw interface er moddhe index.d.ts file create kore 'user' add kore disi req er moddhe
    
    interface CustomRequest extends Request {
        user: JwtPayload;
    }
 */

const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;

            if (!token) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    "You are not authorized!"
                );
            }

            const verifiedUser = jwtHelpers.verifyToken(
                token,
                config.jwt.jwt_secret as Secret
            );

            // console.log(verifiedUser);
            req.user = verifiedUser; //* request header e user er info pathay dite hobe, jeno onno jaygay use korte pari userInfo

            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden");
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

export default auth;
