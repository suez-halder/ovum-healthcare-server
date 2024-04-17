//* src/config/index.ts

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    salt_rounds: process.env.SALT_ROUNDS,
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        expires_in: process.env.EXPIRES_IN,
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
        reset_pass_token_secret: process.env.RESET_PASS_TOKEN_SECRET,
        reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
    },
    reset_pass_link: process.env.RESET_PASS_LINK,
    emailSender: {
        email: process.env.EMAIL,
        app_pass: process.env.APP_PASS,
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    ssl: {
        store_id: process.env.STORE_ID,
        store_passwd: process.env.STORE_PASSWD,
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
        fail_url: process.env.FAIL_URL,
        ssl_payment_api: process.env.SSL_PAYMENT_API,
        ssl_validation_api: process.env.SSL_PAYMENT_API,
    },
    super_admin: {
        super_admin_email: process.env.SUPER_ADMIN_EMAIL,
        super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
    },
};
