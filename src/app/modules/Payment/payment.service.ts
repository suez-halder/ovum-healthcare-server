//* src/app/modules/Payment/payment.service.ts

import axios from "axios";
import config from "../../../config";
import prisma from "../../../shared/prisma";
import { SSLService } from "../SSL/ssl.service";

// * --------------------- * //
//!  Payment Initialization
// * --------------------- * //

const initPayment = async (appointmentId: string) => {
    const paymentData = await prisma.payment.findFirstOrThrow({
        where: {
            appointmentId,
        },
        include: {
            appointment: {
                include: {
                    patient: true,
                },
            },
        },
    });

    const initPaymentData = {
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        name: paymentData.appointment.patient.name,
        email: paymentData.appointment.patient.email,
        address: paymentData.appointment.patient.address,
        phoneNumber: paymentData.appointment.patient.contactNumber,
    };

    const result = await SSLService.initPayment(initPaymentData);
    return {
        paymentUrl: result.GatewayPageURL,
    };
};

export const PaymentService = {
    initPayment,
};
