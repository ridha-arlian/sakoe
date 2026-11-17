import { AMOUNT_PRESETS, MIN_AMOUNT } from "~~/shared/donation";

export { AMOUNT_PRESETS, MIN_AMOUNT };

export const TARGET_GOAL = 10_000_000;

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  qris: "QRIS",
  gopay: "GoPay",
  dana: "DANA",
  paypal: "PayPal",
};

export const STATUS_VIEW_CONFIG: Record<TxStatus, StatusViewConfig> = {
  paid: {
    icon: "M4.5 12.75l6 6 9-13.5",
    iconClass: "text-primary bg-primary/10",
    title: "Payment Successful",
    message: "Thank you for your support!",
    primaryLabel: "Back to Home",
    primaryTo: "/",
  },
  pending: {
    icon: "M12 6v6l4 2",
    iconClass: "text-muted-foreground bg-muted",
    title: "Awaiting Payment",
    message: "Complete your payment before time runs out.",
    primaryLabel: "Check Again",
    primaryTo: "",
  },
  failed: {
    icon: "M6 18L18 6M6 6l12 12",
    iconClass: "text-destructive bg-destructive/10",
    title: "Payment Declined",
    message: "The transaction was declined by the payment provider.",
    primaryLabel: "Try Again",
    primaryTo: "/",
  },
  expired: {
    icon: "M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    iconClass: "text-muted-foreground bg-muted",
    title: "Payment Expired",
    message: "The transaction has expired. Please create a new donation.",
    primaryLabel: "Create New Donation",
    primaryTo: "/",
  },
  cancelled: {
    icon: "M6 18L18 6M6 6l12 12",
    iconClass: "text-muted-foreground bg-muted",
    title: "Payment Cancelled",
    message: "You cancelled this transaction.",
    primaryLabel: "Back to Home",
    primaryTo: "/",
  },
  refunded: {
    icon: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
    iconClass: "text-muted-foreground bg-muted",
    title: "Payment Refunded",
    message: "This donation was returned to the sender.",
    primaryLabel: "Back to Home",
    primaryTo: "/",
  },
};
