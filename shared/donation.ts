export const MIN_AMOUNT = 10_000;

export const MAX_AMOUNT = 50_000_000;

export const MAX_NAME_LENGTH = 50;

export const MAX_MESSAGE_LENGTH = 200;

export const MAX_EMAIL_LENGTH = 254;

export const TAKO_PAYMENT_METHODS = ["qris", "gopay", "dana", "paypal"] as const;

export type TakoPaymentMethod = (typeof TAKO_PAYMENT_METHODS)[number];

export function isTakoPaymentMethod(value: unknown): value is TakoPaymentMethod {
  return typeof value === "string" && (TAKO_PAYMENT_METHODS as readonly string[]).includes(value);
}

export const DEFAULT_PAYMENT_METHOD: TakoPaymentMethod = "qris";

export const PAYMENT_METHOD_LABELS: Record<TakoPaymentMethod, string> = {
  qris: "QRIS",
  gopay: "GoPay",
  dana: "DANA",
  paypal: "PayPal",
};

export const AMOUNT_PRESETS = [
  { label: "Rp 10k", value: 10_000 },
  { label: "Rp 25k", value: 25_000 },
  { label: "Rp 50k", value: 50_000 },
  { label: "Rp 100k", value: 100_000 },
];
