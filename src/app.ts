//* src/app.ts

import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./shared/notFound";
import cookieParser from "cookie-parser";
import { AppointmentService } from "./app/modules/Appointment/appointment.service";
import cron from "node-cron";

const app: Application = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

//parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// we have to use cookie parser to get refresh token cookies
app.use(cookieParser());

// * ---------------------------------------------------------------- * //
//!  Cancel Unpaid Appointments after specified minutes using node-cron
// * ---------------------------------------------------------------- * //

cron.schedule("* * * * *", () => {
    try {
        AppointmentService.cancelUnpaidAppointments();
    } catch (err) {
        console.error(err);
    }
});

app.get("/", (req: Request, res: Response) => {
    res.send({
        Message: "Ovum Healthcare server is running!",
    });
});

// route setup
app.use("/api/v1", router);

// error handler
app.use(globalErrorHandler);

// notFound routes
app.use(notFound);

export default app;
