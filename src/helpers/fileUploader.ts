//* src/helpers/fileUploader.ts

import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: "daqbfrotf",
    api_key: "471275653895265",
    api_secret: "211PdzVrnTwVa43n8YowJOHscL4",
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
const uploadToCloudinary = async (file: any) => {
    console.log({ file });

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            file.path,
            { public_id: file.originalname },
            (error, result) => {
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
