import { supabase } from '../lib/supabase'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add its URL and publishable key to .env.')
  }
}

export async function checkAdminRole() {
  requireSupabase()
  const { data, error } = await supabase.rpc('is_current_user_admin')
  if (error) throw error
  return data === true
}

export async function loadAdminOverview() {
  requireSupabase()
  const [summaryResult, activityResult] = await Promise.all([
    supabase.rpc('get_admin_summary'),
    supabase.rpc('get_admin_recent_activity', { p_limit: 25 }),
  ])

  if (summaryResult.error) throw summaryResult.error
  if (activityResult.error) throw activityResult.error

  return {
    summary: summaryResult.data?.[0] ?? null,
    activity: activityResult.data ?? [],
  }
}

export async function loadMyRecentActivity(limit = 10) {
  requireSupabase()
  const { data, error } = await supabase.rpc('get_my_recent_activity', {
    p_limit: limit,
  })
  if (error) throw error
  return data ?? []
}
