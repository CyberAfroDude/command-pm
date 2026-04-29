import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Project } from '../lib/types'

export function useProjects(): { projects: Project[]; loading: boolean } {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    if (!supabase) {
      setLoading(false)
      return
    }
    const client = supabase

    const fetchProjects = async () => {
      const { data, error } = await client
        .from('projects')
        .select('*')
        .order('priority', { ascending: true })

      if (error) {
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      if (isMounted) {
        setProjects(data ?? [])
        setLoading(false)
      }
    }

    void fetchProjects()

    const channel = client
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          void fetchProjects()
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      void client.removeChannel(channel)
    }
  }, [])

  return { projects, loading }
}
