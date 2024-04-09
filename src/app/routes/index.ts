//* src/app/routes/index.ts

import express from "express";
import { AdminRoutes } from "../modules/Admin/admin.routes";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { DoctorRoutes } from "../modules/Dcotor/doctor.routes";
import { PatientRoutes } from "../modules/Patient/patient.routes";
import { SpecialtiesRoutes } from "../modules/Specialties/specialties.routes";
import { UserRoutes } from "../modules/User/user.routes";

const router = express.Router();

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes,
    },
    {
        path: "/admin",
        route: AdminRoutes,
    },
    {
        path: "/auth",
        route: AuthRoutes,
    },
    {
        path: "/specialties",
        route: SpecialtiesRoutes,
    },
    {
        path: "/doctor",
        route: DoctorRoutes,
    },
    {
        path: "/patient",
        route: PatientRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
