import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../lib/types'

export function useAllTasks(): { tasks: Task[]; loading: boolean } {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    if (!supabase) {
      setLoading(false)
      return
    }
    const client = supabase

    const fetchTasks = async () => {
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .is('parent_id', null)
        .order('project_id', { ascending: true })
        .order('priority', { ascending: true })
        .order('sort_order', { ascending: true })

      if (error) {
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      if (isMounted) {
        setTasks(data ?? [])
        setLoading(false)
      }
    }

    void fetchTasks()

    const channel = client
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        void fetchTasks()
      })
      .subscribe()

    return () => {
      isMounted = false
      void client.removeChannel(channel)
    }
  }, [])

  return { tasks, loading }
}
