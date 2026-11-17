export {};

declare global {
  type TxStatus = "paid" | "pending" | "failed" | "expired" | "cancelled" | "refunded";

  interface DonationStatus {
    orderId: string;
    transactionStatus: TxStatus;
    paymentType: string | null;
    amount: number;
    paymentUrl: string | null;
  }

  interface StatusViewConfig {
    iconClass: string;
    title: string;
    message: string;
    primaryLabel: string;
    primaryTo: string;
  }
}
