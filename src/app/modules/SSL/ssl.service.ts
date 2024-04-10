//* src/app/modules/SSL/ssl.service.ts

import axios from "axios";
import config from "../../../config";

const initPayment = async (paymentData: any) => {
    const data = {
        //* add store ID and password
        store_id: config.ssl.store_id,
        store_passwd: config.ssl.store_passwd,
        total_amount: paymentData.amount,
        currency: "BDT",
        tran_id: paymentData.transactionId, // use unique tran_id for each api call
        success_url: config.ssl.success_url,
        fail_url: config.ssl.fail_url,
        cancel_url: config.ssl.cancel_url,
        ipn_url: "http://localhost:3030/ipn",
        shipping_method: "N/A",
        product_name: "Appointment",
        product_category: "Service",
        product_profile: "general",
        cus_name: paymentData.name,
        cus_email: paymentData.email,
        cus_add1: paymentData.address,
        cus_add2: "N/A",
        cus_city: "N/A",
        cus_state: "N/A",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: paymentData.contactNumber,
        cus_fax: "01711111111",
        ship_name: paymentData.name,
        ship_add1: "N/A",
        ship_add2: "N/A",
        ship_city: "N/A",
        ship_state: "N/A",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
    };

    //? yarn add @types/sslcommerz-lts -D will show error. That's why we have to use axios

    const response = await axios({
        method: "POST",
        url: config.ssl.ssl_payment_api,
        data: data,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
};

export const SSLService = {
    initPayment,
};
