// ══════════════════════════════════════════════════════════════
// LisanIQ — Activity Log Service
// All user actions are recorded here. Uses the admin client
// (service role) so logs are never blocked by RLS.
// ══════════════════════════════════════════════════════════════

import { createAdminClient } from '@/lib/supabase/admin'
import type { ActivityAction } from '@/types'

interface LogActivityParams {
  userId:       string
  action:       ActivityAction
  resourceType: 'project' | 'dataset' | 'report'
  resourceId:   string
  metadata?:    Record<string, unknown>
  ipAddress?:   string
}

/**
 * Writes a single activity log entry.
 * Failures are swallowed — logging must never block the primary operation.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const admin = createAdminClient()

    const { error } = await admin.from('activity_logs').insert({
      user_id:       params.userId,
      action:        params.action,
      resource_type: params.resourceType,
      resource_id:   params.resourceId,
      metadata:      params.metadata ?? {},
      ip_address:    params.ipAddress ?? null,
    })

    if (error) {
      // Log to server console but never throw — audit failure ≠ operation failure
      console.error('[activity-log] insert failed:', error.message)
    }
  } catch (err) {
    console.error('[activity-log] unexpected error:', err)
  }
}

/**
 * Reads the N most recent activity log entries for a user.
 * Uses anon client because RLS enforces ownership.
 */
export async function getRecentActivity(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createClient> extends Promise<infer T> ? T : never,
  userId: string,
  limit = 20
) {
  const { data, error } = await (await supabase)
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data
}
