//* src/app/modules/Meta/meta.service.ts

import { PaymentStatus, UserRole } from "@prisma/client";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { TAuthUser } from "../../interfaces/common";

// ------------------------------ //
//! Fetch Meta Data for All Roles
// ------------------------------ //

const fetchDashboardMetaData = async (user: TAuthUser) => {
    let metaData;
    switch (user.role) {
        case UserRole.SUPER_ADMIN:
            metaData = getSuperAdminMetaData();
            break;
        case UserRole.ADMIN:
            metaData = getAdminMetaData();
            break;
        case UserRole.DOCTOR:
            metaData = getDoctorMetaData(user);
            break;
        case UserRole.PATIENT:
            metaData = getPatientMetaData(user);
            break;

        default:
            throw new ApiError(httpStatus.FORBIDDEN, "Invalid User!");
    }

    return metaData;
};

//! Generate Dashboard Data for All Roles

const getSuperAdminMetaData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const adminCount = await prisma.admin.count();
    const paymentCount = await prisma.payment.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID,
        },
    });

    const barChartData = await getBarChartData();
    const pieChartData = await getPieChartData();

    return {
        appointmentCount,
        patientCount,
        doctorCount,
        adminCount,
        paymentCount,
        totalRevenue,
        barChartData,
        pieChartData,
    };
};

const getAdminMetaData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const paymentCount = await prisma.payment.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID,
        },
    });
    const barChartData = await getBarChartData();
    const pieChartData = await getPieChartData();

    return {
        appointmentCount,
        patientCount,
        doctorCount,
        paymentCount,
        totalRevenue,
        barChartData,
        pieChartData,
    };
};

const getDoctorMetaData = async (user: TAuthUser) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const appointmentCount = await prisma.appointment.count({
        where: {
            doctorId: doctorData.id,
        },
    });
    const patientCount = await prisma.appointment.groupBy({
        by: ["patientId"],
        _count: {
            id: true,
        },
    });

    const reviewCount = await prisma.review.count({
        where: {
            doctorId: doctorData.id,
        },
    });

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            appointment: {
                doctorId: doctorData.id,
            },

            status: PaymentStatus.PAID,
        },
    });

    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
        where: {
            doctorId: doctorData.id,
        },
    });

    const formattedAppointmentStatusDistribution =
        appointmentStatusDistribution.map(({ status, _count }) => ({
            status,
            count: Number(_count.id),
        }));

    return {
        appointmentCount,
        patientCount: patientCount.length,
        reviewCount,
        totalRevenue,
        formattedAppointmentStatusDistribution,
    };
};

const getPatientMetaData = async (user: TAuthUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
        },
    });

    const appointmentCount = await prisma.appointment.count({
        where: {
            patientId: patientData.id,
        },
    });
    const prescriptionCount = await prisma.prescription.count({
        where: {
            patientId: patientData.id,
        },
    });

    const reviewCount = await prisma.review.count({
        where: {
            patientId: patientData.id,
        },
    });

    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
        where: {
            patientId: patientData.id,
        },
    });

    const formattedAppointmentStatusDistribution =
        appointmentStatusDistribution.map(({ status, _count }) => ({
            status,
            count: Number(_count.id),
        }));

    // console.log(formattedAppointmentStatusDistribution);
    return {
        appointmentCount,
        prescriptionCount,
        reviewCount,
        formattedAppointmentStatusDistribution,
    };
};

//! Bar chart data
const getBarChartData = async () => {
    const appointmentCountByMonth: { month: Date; count: bigint }[] =
        await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    CAST(COUNT(*) AS INTEGER) AS count
    FROM "appointments"
    GROUP BY month
    ORDER BY month ASC
    `;

    return appointmentCountByMonth;
};

//! Pie chart data
const getPieChartData = async () => {
    const appointmentStatusDistribution = await prisma.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
    });

    const formattedAppointmentStatusDistribution =
        appointmentStatusDistribution.map(({ status, _count }) => ({
            status,
            count: Number(_count.id),
        }));

    return formattedAppointmentStatusDistribution;
};

export const MetaService = {
    fetchDashboardMetaData,
};