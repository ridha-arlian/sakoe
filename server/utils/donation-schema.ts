import { z } from 'zod'
import {
  DEFAULT_PAYMENT_METHOD,
  MAX_AMOUNT,
  MAX_EMAIL_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  MIN_AMOUNT,
  TAKO_PAYMENT_METHODS,
} from '~~/shared/donation'

const amountSchema = z
  .union([
    z.number(),
    z.string().regex(/^\d+$/).transform(Number),
  ])
  .pipe(z.number().int().min(MIN_AMOUNT).max(MAX_AMOUNT))

const textSchema = (max: number) =>
  z
    .preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
      z.string().trim().max(max).nullable().optional(),
    )
    .transform((value) => value ?? null)

export const donationInputSchema = z.object({
  amount: amountSchema,
  email: z.string().trim().email().max(MAX_EMAIL_LENGTH),
  paymentMethod: z.enum(TAKO_PAYMENT_METHODS).default(DEFAULT_PAYMENT_METHOD),
  donorName: textSchema(MAX_NAME_LENGTH),
  message: textSchema(MAX_MESSAGE_LENGTH),
  isAnonymous: z.boolean().default(false),
  previousOrderId: z.string().trim().regex(/^sakoe-[0-9a-f]{12}$/).optional(),
})

export type DonationInput = z.output<typeof donationInputSchema>

export type DonationInputParseResult =
  | { ok: true; value: DonationInput }
  | { ok: false; errors: Record<string, string[]> }

function collectErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : 'form'
    ;(errors[key] ??= []).push(issue.message)
  }

  return errors
}

export function parseDonationInput(input: unknown): DonationInputParseResult {
  const result = donationInputSchema.safeParse(input)

  if (!result.success) {
    return { ok: false, errors: collectErrors(result.error) }
  }

  return { ok: true, value: result.data }
}
