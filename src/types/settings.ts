import type { Timestamp } from "firebase/firestore";

export type AppSettings = {
    id: string;
    partyNotice: string | null;
    paymentRecipientAccount: string | null;
    paymentRecipientName: string | null;
    defaultPaymentMessage: string | null;
    defaultPaymantVariableSymbol: string | null;
    updatedAt: Timestamp | null;
};