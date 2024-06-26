//* src/app/modules/SSL/ssl.interface.ts

export type TPaymentData = {
    amount: number;
    transactionId: string;
    name: string;
    email: string;
    address: string | null;
    phoneNumber: string | null;
};
