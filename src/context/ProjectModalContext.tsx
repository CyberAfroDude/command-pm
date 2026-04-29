import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface AppProject {
  id: string
  name: string
  category: string
  phase: string
  priority: number
  status: 'active' | 'blocked' | 'review'
  progress: number
  notes: string
}

const INITIAL_PROJECTS: AppProject[] = [
  { id: 'p-1', name: 'StatFlow', category: 'Apps', phase: 'App Store Review', priority: 1, status: 'active', progress: 74, notes: '' },
  { id: 'p-2', name: 'CryptoDraftPicks', category: 'Platforms', phase: 'Development', priority: 2, status: 'blocked', progress: 43, notes: '' },
  { id: 'p-3', name: 'Dead or Alive', category: 'Film', phase: 'Post-Production', priority: 3, status: 'review', progress: 61, notes: '' },
  { id: 'p-4', name: 'CrewSheetz', category: 'Apps', phase: 'MVP Build', priority: 4, status: 'active', progress: 38, notes: '' },
  { id: 'p-5', name: 'Christian App Empire', category: 'Apps', phase: 'Active Portfolio', priority: 5, status: 'active', progress: 88, notes: '' },
  { id: 'p-6', name: 'To Fame From Love', category: 'Film', phase: 'Development', priority: 3, status: 'review', progress: 29, notes: '' },
]

interface ProjectModalContextValue {
  isProjectModalOpen: boolean
  openProjectModal: () => void
  closeProjectModal: () => void
  projects: AppProject[]
  addProject: (project: Omit<AppProject, 'id' | 'status' | 'progress'>) => void
}

const ProjectModalContext = createContext<ProjectModalContextValue | null>(null)

export function ProjectModalProvider({ children }: { children: ReactNode }) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [projects, setProjects] = useState<AppProject[]>(INITIAL_PROJECTS)

  const value = useMemo<ProjectModalContextValue>(
    () => ({
      isProjectModalOpen,
      openProjectModal: () => setIsProjectModalOpen(true),
      closeProjectModal: () => setIsProjectModalOpen(false),
      projects,
      addProject: (project) =>
        setProjects((prev) => [
          {
            ...project,
            id: crypto.randomUUID(),
            status: 'active',
            progress: 8,
          },
          ...prev,
        ]),
    }),
    [isProjectModalOpen, projects],
  )

  return <ProjectModalContext.Provider value={value}>{children}</ProjectModalContext.Provider>
}

export function useProjectModal() {
  const context = useContext(ProjectModalContext)
  if (!context) throw new Error('useProjectModal must be used within ProjectModalProvider')
  return context
}
