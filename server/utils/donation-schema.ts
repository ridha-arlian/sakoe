import { z } from 'zod'
import {
  MAX_AMOUNT,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  MIN_AMOUNT,
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
  donorName: textSchema(MAX_NAME_LENGTH),
  message: textSchema(MAX_MESSAGE_LENGTH),
  isAnonymous: z.boolean().default(false),
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
