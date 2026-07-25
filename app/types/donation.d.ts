export {};

declare global {
  type TxStatus = "paid" | "pending" | "failed" | "expired" | "cancelled";

  interface DonationStatus {
    orderId: string;
    transactionStatus: TxStatus;
    paymentType: string;
    amount: number;
    transactionTime: string;
  }

  interface StatusViewConfig {
    icon: string;
    iconClass: string;
    title: string;
    message: string;
    primaryLabel: string;
    primaryTo: string;
  }
}