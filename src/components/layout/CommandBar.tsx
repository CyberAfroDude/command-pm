import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCommandBar } from '../../context/CommandBarContext'
import { useTaskModal } from '../../context/TaskModalContext'
import { useProjectModal } from '../../context/ProjectModalContext'

interface CommandOption {
  id: string
  icon: string
  label: string
  section: 'QUICK ACTIONS' | 'PROJECTS'
  action: () => void
}

export function CommandBar() {
  const navigate = useNavigate()
  const { isOpen, closeCommandBar } = useCommandBar()
  const { openTaskModal } = useTaskModal()
  const { openProjectModal, projects } = useProjectModal()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const options = useMemo<CommandOption[]>(
    () => [
      { id: 'new-task', icon: '+', label: 'New Task', section: 'QUICK ACTIONS', action: () => openTaskModal() },
      { id: 'new-project', icon: '+', label: 'New Project', section: 'QUICK ACTIONS', action: () => openProjectModal() },
      { id: 'go-tasks', icon: '✓', label: 'Go to My Tasks', section: 'QUICK ACTIONS', action: () => navigate('/tasks') },
      { id: 'go-dashboard', icon: '◉', label: 'Go to Dashboard', section: 'QUICK ACTIONS', action: () => navigate('/') },
      ...projects.map((project) => ({
        id: `project-${project.id}`,
        icon: '•',
        label: project.name,
        section: 'PROJECTS' as const,
        action: () => navigate(`/project/${encodeURIComponent(project.name)}`),
      })),
    ],
    [navigate, openProjectModal, openTaskModal, projects],
  )

  const filtered = useMemo(
    () => options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  )

  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setActiveIndex(0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCommandBar()
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((idx) => (filtered.length ? (idx + 1) % filtered.length : 0))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((idx) => (filtered.length ? (idx - 1 + filtered.length) % filtered.length : 0))
      }
      if (event.key === 'Enter' && filtered[activeIndex]) {
        filtered[activeIndex].action()
        closeCommandBar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, closeCommandBar, filtered, isOpen])

  if (!isOpen) return null

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300 }} onClick={closeCommandBar} />
      <div
        style={{
          position: 'fixed',
          top: '20vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '520px',
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: '7px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          zIndex: 301,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--faint)' }}>⌘</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search or type a command..."
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '16px', color: 'var(--text)' }}
          />
        </div>
        {(['QUICK ACTIONS', 'PROJECTS'] as const).map((section) => {
          const sectionOptions = filtered.filter((option) => option.section === section)
          if (sectionOptions.length === 0) return null
          return (
            <div key={section}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--faint)', textTransform: 'uppercase', padding: '6px 14px 2px' }}>
                {section}
              </div>
              {sectionOptions.map((option) => {
                const optionIndex = filtered.findIndex((entry) => entry.id === option.id)
                const active = optionIndex === activeIndex
                return (
                  <button
                    key={option.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(optionIndex)}
                    onClick={() => {
                      option.action()
                      closeCommandBar()
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 16px',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: active ? 'var(--surface2)' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '14px', color: 'var(--faint)' }}>{option.icon}</span>
                    <span style={{ fontSize: '14px', color: active ? 'var(--text)' : 'var(--muted)' }}>{option.label}</span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </>
  )
}
