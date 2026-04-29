export interface Project {
  id: string
  name: string
  category: string | null
  status: string | null
  phase: string | null
  priority: number | null
  owner: string | null
  progress: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  parent_id: string | null
  title: string
  description: string | null
  status: string | null
  source: string | null
  source_note: string | null
  priority: string | null
  bucket: string | null
  due_date: string | null
  assigned_to: string | null
  sort_order: number | null
  completed_at: string | null
  snoozed_until: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  project_id: string
  entry: string
  source: string | null
  created_at: string
}

export interface Handoff {
  id: string
  project_id: string
  title: string
  to_person: string | null
  notes: string | null
  status: string | null
  created_at: string
}
