//* src/helpers/fileUploader.ts

import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import config from "../config";
import { TCloudinaryResponse, TFile } from "../app/interfaces/file.types";

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
});

//! upload file to local using multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

//! upload file to cloudinary
const uploadToCloudinary = async (
    file: TFile
): Promise<TCloudinaryResponse | undefined> => {
    console.log({ file });

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            file.path,
            // { public_id: file.originalname },
            (error: Error, result: TCloudinaryResponse) => {
                fs.unlinkSync(file.path); // ? upload hoye jawar pore local theke delete kore dibe
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

export const fileUploader = {
    upload,
    uploadToCloudinary,
};
