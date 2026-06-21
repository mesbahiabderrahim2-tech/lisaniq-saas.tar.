// ══════════════════════════════════════════════════════════════
// LisanIQ — Input Validation Schemas (Zod)
// All API input is validated through these schemas before
// touching the database. Never trust user-supplied data.
// ══════════════════════════════════════════════════════════════

import { z } from 'zod'

// ── Projects ────────────────────────────────────────────────

export const CreateProjectSchema = z.object({
  name:        z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional(),
  color:       z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex code').default('#3d6fe8'),
})

export const UpdateProjectSchema = z.object({
  name:        z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  color:       z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>

// ── Reports ─────────────────────────────────────────────────

export const CreateReportSchema = z.object({
  dataset_id:  z.string().uuid('Invalid dataset ID'),
  project_id:  z.string().uuid('Invalid project ID'),
  name:        z.string().trim().min(1, 'Report name is required').max(200),
  notes:       z.string().trim().max(2000).optional(),
})

export const UpdateReportSchema = z.object({
  name:       z.string().trim().min(1).max(200).optional(),
  notes:      z.string().trim().max(2000).optional().nullable(),
  is_starred: z.boolean().optional(),
})

export type CreateReportInput = z.infer<typeof CreateReportSchema>
export type UpdateReportInput = z.infer<typeof UpdateReportSchema>

// ── Datasets ────────────────────────────────────────────────

export const UpdateDatasetSchema = z.object({
  name: z.string().trim().min(1).max(150),
})

export type UpdateDatasetInput = z.infer<typeof UpdateDatasetSchema>

// ── Auth ────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
  email:     z.string().email('Enter a valid email address'),
  password:  z.string()
               .min(8,  'Password must be at least 8 characters')
               .max(72, 'Password must be 72 characters or fewer')
               .regex(/[A-Z]/,    'Password must contain at least one uppercase letter')
               .regex(/[0-9]/,    'Password must contain at least one number')
               .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  full_name: z.string().trim().min(1, 'Full name is required').max(100),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export const ResetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

// ── Billing ─────────────────────────────────────────────────

export const CreateCheckoutSchema = z.object({
  price_id: z.string().min(1, 'Price ID is required'),
})

export type CreateCheckoutInput = z.infer<typeof CreateCheckoutSchema>

// ── Helpers ─────────────────────────────────────────────────

/**
 * Validates a Zod schema against unknown input.
 * Returns either the parsed value or an error string.
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input:  unknown
): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(input)

  if (!result.success) {
    const first = result.error.errors[0]
    const field = first.path.join('.')
    const msg   = field ? `${field}: ${first.message}` : first.message
    return { data: null, error: msg }
  }

  return { data: result.data, error: null }
}
