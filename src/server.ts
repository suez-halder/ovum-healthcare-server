//* src/server.ts

import { Server } from "http";
import app from "./app";
import config from "./config";

async function main() {
    const server: Server = app.listen(config.port, () => {
        console.log("Server is running on port", config.port);
    });

    const exitHandler = () => {
        if (server) {
            server.close(() => {
                console.info("Server closed!");
            });
        }
        process.exit(1);
    };

    //? server jodi crush korte ney, tokhn uncaughtException er maddhome server off kore dite hoy
    process.on("uncaughtException", (error) => {
        console.log(error);
        exitHandler();
    });

    //? Try-Catch jokhn kono error dhorte parena tokhn unhandledRejection hoy
    process.on("unhandledRejection", (error) => {
        console.log(error);
        exitHandler();
    });
}

main();
