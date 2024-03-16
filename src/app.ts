import express, { Application, Request, Response } from "express";
import cors from "cors";
import { userRoutes } from "./app/modules/User/user.routes";

const app: Application = express();

app.use(cors());

//parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.send({
        Message: "Ovum Healthcare server is running!",
    });
});

app.use("/api/v1/user", userRoutes);

export default app;
