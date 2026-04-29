import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ActivityLog } from '../lib/types'

export function useActivityLog(
  project_id?: string,
): { log: ActivityLog[]; loading: boolean } {
  const [log, setLog] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchLog = async () => {
      let query = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (project_id) {
        query = query.eq('project_id', project_id)
      }

      const { data, error } = await query

      if (error) {
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      if (isMounted) {
        setLog(data ?? [])
        setLoading(false)
      }
    }

    void fetchLog()

    const channel = supabase
      .channel(`activity-log-realtime-${project_id ?? 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_log' },
        () => {
          void fetchLog()
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      void supabase.removeChannel(channel)
    }
  }, [project_id])

  return { log, loading }
}
