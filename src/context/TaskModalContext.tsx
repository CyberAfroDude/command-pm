import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'
export type TaskBucket = 'now' | 'after_phase' | 'checklist' | 'someday'
export type TaskSource = 'agent' | 'cursor' | 'slack' | 'manual'

export interface AppTask {
  id: string
  projectName: string
  title: string
  priority: TaskPriority
  bucket: TaskBucket
  dueDate: string | null
  source: TaskSource
  assignedTo: 'Spence'
  status: 'open'
  createdAt: string
}

const INITIAL_TASKS: AppTask[] = [
  { id: 'sf-1', projectName: 'StatFlow', title: 'Prepare App Store launch checklist', priority: 'urgent', bucket: 'now', dueDate: '2026-04-28', source: 'agent', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-28T10:14:00.000Z' },
  { id: 'sf-2', projectName: 'StatFlow', title: 'Enable push notifications for v1.1', priority: 'high', bucket: 'checklist', dueDate: null, source: 'cursor', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-27T14:47:00.000Z' },
  { id: 'sf-3', projectName: 'StatFlow', title: 'Set up AdMob mediation', priority: 'normal', bucket: 'checklist', dueDate: null, source: 'cursor', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-27T11:02:00.000Z' },
  { id: 'sf-4', projectName: 'StatFlow', title: 'Verify app-ads.txt is live', priority: 'normal', bucket: 'checklist', dueDate: null, source: 'agent', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-26T09:30:00.000Z' },
  { id: 'sf-5', projectName: 'StatFlow', title: 'Write launch announcement for Beehiiv', priority: 'low', bucket: 'someday', dueDate: null, source: 'slack', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-26T08:40:00.000Z' },
  { id: 'cdp-1', projectName: 'CryptoDraftPicks', title: 'Decide: Solana config for token launch', priority: 'urgent', bucket: 'now', dueDate: '2026-04-29', source: 'agent', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-28T12:00:00.000Z' },
  { id: 'cdp-2', projectName: 'CryptoDraftPicks', title: 'Finalize rake percentage model', priority: 'high', bucket: 'now', dueDate: null, source: 'slack', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-27T15:12:00.000Z' },
  { id: 'cdp-3', projectName: 'CryptoDraftPicks', title: 'Review Bunny agent system prompt v2', priority: 'normal', bucket: 'after_phase', dueDate: null, source: 'cursor', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-27T09:52:00.000Z' },
  { id: 'doa-1', projectName: 'Dead or Alive', title: 'Send audio direction notes to Fred Brown II', priority: 'urgent', bucket: 'now', dueDate: '2026-04-29', source: 'agent', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-28T09:10:00.000Z' },
  { id: 'doa-2', projectName: 'Dead or Alive', title: 'Review Wayne Yu color grade pass', priority: 'high', bucket: 'now', dueDate: null, source: 'slack', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-27T13:25:00.000Z' },
  { id: 'doa-3', projectName: 'Dead or Alive', title: 'Confirm Eric Fernandez edit timeline', priority: 'normal', bucket: 'checklist', dueDate: null, source: 'agent', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-27T10:32:00.000Z' },
  { id: 'doa-4', projectName: 'Dead or Alive', title: 'Update Roger Margulies on post schedule', priority: 'normal', bucket: 'checklist', dueDate: null, source: 'slack', assignedTo: 'Spence', status: 'open', createdAt: '2026-04-26T16:05:00.000Z' },
]

interface TaskModalContextValue {
  isTaskModalOpen: boolean
  openTaskModal: () => void
  closeTaskModal: () => void
  tasks: AppTask[]
  addTask: (task: Omit<AppTask, 'id' | 'status' | 'createdAt' | 'assignedTo'>) => void
}

const TaskModalContext = createContext<TaskModalContextValue | null>(null)

export function TaskModalProvider({ children }: { children: ReactNode }) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [tasks, setTasks] = useState<AppTask[]>(INITIAL_TASKS)

  const value = useMemo<TaskModalContextValue>(
    () => ({
      isTaskModalOpen,
      openTaskModal: () => setIsTaskModalOpen(true),
      closeTaskModal: () => setIsTaskModalOpen(false),
      tasks,
      addTask: (task) =>
        setTasks((prev) => [
          {
            ...task,
            id: crypto.randomUUID(),
            status: 'open',
            assignedTo: 'Spence',
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]),
    }),
    [isTaskModalOpen, tasks],
  )

  return <TaskModalContext.Provider value={value}>{children}</TaskModalContext.Provider>
}

export function useTaskModal() {
  const context = useContext(TaskModalContext)
  if (!context) throw new Error('useTaskModal must be used within TaskModalProvider')
  return context
}
