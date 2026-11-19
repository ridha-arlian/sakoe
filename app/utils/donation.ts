export const TARGET_GOAL = 10_000_000;

export const STATUS_VIEW_CONFIG: Record<TxStatus, StatusViewConfig> = {
  paid: {
    iconClass: "text-primary bg-primary/10",
    title: "Payment Successful",
    message: "Thank you for your support!",
    primaryLabel: "Back to Home",
    primaryTo: "/",
  },
  pending: {
    iconClass: "text-muted-foreground bg-muted",
    title: "Awaiting Payment",
    message: "Complete your payment before time runs out.",
    primaryLabel: "Check Again",
    primaryTo: "",
  },
  failed: {
    iconClass: "text-destructive bg-destructive/10",
    title: "Payment Declined",
    message: "The transaction was declined by the payment provider.",
    primaryLabel: "Try Again",
    primaryTo: "/",
  },
  expired: {
    iconClass: "text-muted-foreground bg-muted",
    title: "Payment Expired",
    message: "The transaction has expired. Please create a new donation.",
    primaryLabel: "Create New Donation",
    primaryTo: "/",
  },
  cancelled: {
    iconClass: "text-muted-foreground bg-muted",
    title: "Payment Cancelled",
    message: "You cancelled this transaction.",
    primaryLabel: "Change donation",
    primaryTo: "/",
  },
  refunded: {
    iconClass: "text-muted-foreground bg-muted",
    title: "Payment Refunded",
    message: "This donation was returned to the sender.",
    primaryLabel: "Back to Home",
    primaryTo: "/",
  },
};
