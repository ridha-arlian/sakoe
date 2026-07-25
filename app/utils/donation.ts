export const MIN_AMOUNT = 10000;

export const TARGET_GOAL = 10000000;

export const AMOUNT_PRESETS = [
  { label: "Rp 10k", value: 10000 },
  { label: "Rp 25k", value: 25000 },
  { label: "Rp 50k", value: 50000 },
  { label: "Rp 100k", value: 100000 },
];

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  gopay: "GoPay",
  qris: "QRIS",
  bank_transfer: "Bank Transfer",
  shopeepay: "ShopeePay",
  credit_card: "Credit Card",
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
    iconClass: "text-amber-500 bg-amber-500/10",
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
};