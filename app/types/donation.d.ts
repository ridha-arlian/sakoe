export {};

declare global {
  type TxStatus = "paid" | "pending" | "failed" | "expired" | "cancelled" | "refunded";

  interface DonationStatus {
    orderId: string;
    transactionStatus: TxStatus;
    paymentType: string;
    amount: number;
    transactionTime: string;
    paymentUrl: string | null;
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
