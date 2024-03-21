//* src/app.ts

import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./shared/notFound";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(cors());

//parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// we have to use cookie parser to get refresh token cookies
app.use(cookieParser());

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
