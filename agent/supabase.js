import dotenv from 'dotenv'
dotenv.config()

import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

export const supabase = createClient(url || '', serviceKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function getProjectIdByName(projectName) {
  const { data, error } = await supabase.from('projects').select('id').eq('name', projectName).maybeSingle()
  if (error) throw error
  return data?.id ?? null
}

export async function getProjects() {
  const { data, error } = await supabase.from('projects').select('*').order('priority', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getTasksByProject(projectName) {
  const projectId = await getProjectIdByName(projectName)
  if (!projectId) return []

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'open')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({ ...row, projectName }))
}

export async function createTask({
  projectName,
  title,
  priority = 'normal',
  bucket = 'now',
  source = 'agent',
  sourceNote = null,
  assignedTo = 'Spence',
}) {
  const projectId = await getProjectIdByName(projectName)
  if (!projectId) throw new Error(`Project not found: ${projectName}`)

  const insert = {
    project_id: projectId,
    parent_id: null,
    title,
    description: null,
    status: 'open',
    source,
    source_note: sourceNote,
    priority,
    bucket,
    due_date: null,
    assigned_to: assignedTo,
    sort_order: null,
    completed_at: null,
    snoozed_until: null,
  }

  const { data, error } = await supabase.from('tasks').insert(insert).select('*').single()
  if (error) throw error
  return data
}

export async function updateTaskStatus(taskId, status) {
  const now = new Date().toISOString()
  const patch = { status, updated_at: now }
  if (status === 'complete' || status === 'completed') {
    patch.status = 'complete'
    patch.completed_at = now
  }

  const { data, error } = await supabase.from('tasks').update(patch).eq('id', taskId).select('*').single()
  if (error) throw error
  return data
}

export async function updateProjectStatus(projectName, updates) {
  const now = new Date().toISOString()
  const allowed = {}
  if (updates.status !== undefined) allowed.status = updates.status
  if (updates.phase !== undefined) allowed.phase = updates.phase
  if (updates.progress !== undefined) allowed.progress = updates.progress
  if (updates.notes !== undefined) allowed.notes = updates.notes
  allowed.updated_at = now

  const { data, error } = await supabase.from('projects').update(allowed).eq('name', projectName).select('*').single()
  if (error) throw error
  return data
}

export async function createActivityLog({ projectName, entry, source = 'agent' }) {
  const projectId = await getProjectIdByName(projectName)
  if (!projectId) throw new Error(`Project not found for activity: ${projectName}`)

  const { data, error } = await supabase
    .from('activity_log')
    .insert({ project_id: projectId, entry, source })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function createHandoff({ projectName, title, toPerson, notes }) {
  const projectId = await getProjectIdByName(projectName)
  if (!projectId) throw new Error(`Project not found for handoff: ${projectName}`)

  const { data, error } = await supabase
    .from('handoffs')
    .insert({
      project_id: projectId,
      title,
      to_person: toPerson,
      notes: notes ?? null,
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }

export async function getOpenTasksAllProjects() {
  const { data, error } = await supabase.from('tasks').select('*, projects(name)').eq('status', 'open')

  if (error) throw error

  const rows = (data ?? []).map((row) => ({
    ...row,
    projectName: row.projects?.name ?? null,
  }))

  rows.sort((a, b) => {
    const pa = priorityOrder[String(a.priority).toLowerCase()] ?? 2
    const pb = priorityOrder[String(b.priority).toLowerCase()] ?? 2
    if (pa !== pb) return pa - pb
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  return rows
}
