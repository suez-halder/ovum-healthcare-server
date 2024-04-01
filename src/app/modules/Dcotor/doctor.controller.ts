//* src/app/modules/Specialties/specialties.controller.ts

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DoctorService } from "./doctor.service";

// * --------------------- * //
//!  Update Doctor Profile
// * --------------------- * //

const updateDoctorIntoDB = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await DoctorService.updateDoctorIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Doctor data updated successfully!",
        data: result,
    });
});

export const DoctorController = {
    // getAllDoctorsFromDB,
    // getDoctorByIdFromDB,
    updateDoctorIntoDB,
    // deleteDoctorFromDB,
    // softDeleteDoctorFromDB,
};
