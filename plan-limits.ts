// ══════════════════════════════════════════════════════════════
// LisanIQ — Plan Limits Service
// Single source of truth for all plan enforcement logic.
// ══════════════════════════════════════════════════════════════

export type Plan = 'free' | 'pro' | 'enterprise'

export interface PlanLimits {
  maxDatasets: number   // -1 = unlimited
  maxReports:  number   // -1 = unlimited
  maxFileSizeMB: number
  maxRowsPerDataset: number
  canExportPDF: boolean
  canAccessAPI: boolean
}

// ── Plan definitions ────────────────────────────────────────
const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxDatasets:       3,
    maxReports:        5,
    maxFileSizeMB:     5,
    maxRowsPerDataset: 5_000,
    canExportPDF:      false,
    canAccessAPI:      false,
  },
  pro: {
    maxDatasets:       -1,
    maxReports:        -1,
    maxFileSizeMB:     25,
    maxRowsPerDataset: 500_000,
    canExportPDF:      true,
    canAccessAPI:      true,
  },
  enterprise: {
    maxDatasets:       -1,
    maxReports:        -1,
    maxFileSizeMB:     100,
    maxRowsPerDataset: -1,
    canExportPDF:      true,
    canAccessAPI:      true,
  },
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan]
}

export interface LimitCheckResult {
  allowed:  boolean
  reason:   string | null
  current:  number
  limit:    number
}

export function checkDatasetLimit(plan: Plan, currentCount: number): LimitCheckResult {
  const limits = getPlanLimits(plan)

  if (limits.maxDatasets === -1) {
    return { allowed: true, reason: null, current: currentCount, limit: -1 }
  }

  if (currentCount >= limits.maxDatasets) {
    return {
      allowed:  false,
      reason:   `Your ${plan} plan allows up to ${limits.maxDatasets} datasets. Upgrade to Pro for unlimited uploads.`,
      current:  currentCount,
      limit:    limits.maxDatasets,
    }
  }

  return { allowed: true, reason: null, current: currentCount, limit: limits.maxDatasets }
}

export function checkReportLimit(plan: Plan, currentCount: number): LimitCheckResult {
  const limits = getPlanLimits(plan)

  if (limits.maxReports === -1) {
    return { allowed: true, reason: null, current: currentCount, limit: -1 }
  }

  if (currentCount >= limits.maxReports) {
    return {
      allowed:  false,
      reason:   `Your ${plan} plan allows up to ${limits.maxReports} saved reports. Upgrade to Pro for unlimited reports.`,
      current:  currentCount,
      limit:    limits.maxReports,
    }
  }

  return { allowed: true, reason: null, current: currentCount, limit: limits.maxReports }
}

export function checkFileSizeLimit(plan: Plan, fileSizeBytes: number): LimitCheckResult {
  const limits = getPlanLimits(plan)
  const fileSizeMB = fileSizeBytes / (1024 * 1024)

  if (fileSizeMB > limits.maxFileSizeMB) {
    return {
      allowed:  false,
      reason:   `File size ${fileSizeMB.toFixed(1)}MB exceeds your ${plan} plan limit of ${limits.maxFileSizeMB}MB.`,
      current:  Math.round(fileSizeMB),
      limit:    limits.maxFileSizeMB,
    }
  }

  return { allowed: true, reason: null, current: Math.round(fileSizeMB), limit: limits.maxFileSizeMB }
}

export function checkRowLimit(plan: Plan, rowCount: number): LimitCheckResult {
  const limits = getPlanLimits(plan)

  if (limits.maxRowsPerDataset === -1) {
    return { allowed: true, reason: null, current: rowCount, limit: -1 }
  }

  if (rowCount > limits.maxRowsPerDataset) {
    return {
      allowed:  false,
      reason:   `Dataset has ${rowCount.toLocaleString()} rows, which exceeds your ${plan} plan limit of ${limits.maxRowsPerDataset.toLocaleString()} rows per dataset.`,
      current:  rowCount,
      limit:    limits.maxRowsPerDataset,
    }
  }

  return { allowed: true, reason: null, current: rowCount, limit: limits.maxRowsPerDataset }
}
