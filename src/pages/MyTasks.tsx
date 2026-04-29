import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAllTasks } from '../hooks/useAllTasks'
import { useProjects } from '../hooks/useProjects'
import type { Project, Task } from '../lib/types'
import { PROJECT_TASKS } from '../lib/mockData'
import { Toast } from '../components/shared/Toast'
import './MyTasks.css'

interface TaskGroup {
  id: string
  name: string
  tasks: typeof PROJECT_TASKS.StatFlow
}

const baseGroups: TaskGroup[] = [
  { id: 'statflow', name: 'StatFlow', tasks: PROJECT_TASKS.StatFlow },
  { id: 'cryptodraftpicks', name: 'CryptoDraftPicks', tasks: PROJECT_TASKS.CryptoDraftPicks },
  { id: 'dead-or-alive', name: 'Dead or Alive', tasks: PROJECT_TASKS['Dead or Alive'] },
]

function priorityColor(priority: 'urgent' | 'high' | 'normal' | 'low'): string {
  if (priority === 'urgent') return '#ef4444'
  if (priority === 'high') return '#f59e0b'
  if (priority === 'normal') return '#3b82f6'
  return '#333333'
}

function sourceStyle(source: 'AGENT' | 'CURSOR' | 'SLACK'): CSSProperties {
  if (source === 'AGENT') return { background: 'rgba(34,197,94,0.08)', color: '#22c55e' }
  if (source === 'CURSOR') return { background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }
  return { background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }
}

export function MyTasks() {
  const { tasks } = useAllTasks()
  const { projects } = useProjects()
  const typedTasks: Task[] = tasks

  const [activeView, setActiveView] = useState('All Tasks')
  const [activePriority, setActivePriority] = useState('All')
  const [activeProject, setActiveProject] = useState('All Projects')
  const [activeBucket, setActiveBucket] = useState('Now')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    statflow: true,
    cryptodraftpicks: true,
    'dead-or-alive': true,
  })
  const [completingTaskIds, setCompletingTaskIds] = useState<Record<string, boolean>>({})
  const [hiddenTaskIds, setHiddenTaskIds] = useState<Record<string, boolean>>({})
  const [quickAddFor, setQuickAddFor] = useState<string | null>(null)
  const [quickAddText, setQuickAddText] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const openCount = useMemo(() => {
    return baseGroups.flatMap((group) => group.tasks).filter((task) => !hiddenTaskIds[task.id]).length
  }, [hiddenTaskIds])

  const projectNames = useMemo(() => projects.map((project: Project) => project.name), [projects])
  const hasLiveTasks = typedTasks.length > 0

  useEffect(() => {
    if (!toastMessage) return
    setToastVisible(true)
    const hide = window.setTimeout(() => setToastVisible(false), 2400)
    const clear = window.setTimeout(() => setToastMessage(null), 2800)
    return () => {
      window.clearTimeout(hide)
      window.clearTimeout(clear)
    }
  }, [toastMessage])

  const showToast = (message: string) => setToastMessage(message)

  const completeTask = (taskId: string) => {
    if (completingTaskIds[taskId] || hiddenTaskIds[taskId]) return
    setCompletingTaskIds((prev) => ({ ...prev, [taskId]: true }))
    window.setTimeout(() => {
      setHiddenTaskIds((prev) => ({ ...prev, [taskId]: true }))
      setCompletingTaskIds((prev) => ({ ...prev, [taskId]: false }))
      showToast('Task completed ✓')
    }, 280)
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--bg)' }}>
      <aside
        style={{
          width: '168px',
          minWidth: '168px',
          borderRight: '1px solid var(--border)',
          padding: '16px 0',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <div className="mytasks-filter-label">View</div>
          {['All Tasks', 'Assigned to Me', 'Agent Created', 'Due Today', 'Overdue'].map((option) => (
            <button
              key={option}
              type="button"
              className="mytasks-filter-option"
              onClick={() => setActiveView(option)}
              style={{
                color: activeView === option ? 'var(--text)' : option === 'Overdue' ? '#ef4444' : 'var(--muted)',
              }}
            >
              {option}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div className="mytasks-filter-label">Priority</div>
          {[
            { label: 'Urgent', color: '#ef4444' },
            { label: 'High', color: '#f59e0b' },
            { label: 'Normal', color: '#3b82f6' },
            { label: 'Low', color: '#333333' },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              className="mytasks-filter-option"
              onClick={() => setActivePriority(option.label)}
              style={{ color: activePriority === option.label ? 'var(--text)' : 'var(--muted)' }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '999px',
                  background: option.color,
                  display: 'inline-block',
                  marginRight: '7px',
                }}
              />
              {option.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div className="mytasks-filter-label">Project</div>
          {['All Projects', ...projectNames].map((option) => (
            <button
              key={option}
              type="button"
              className="mytasks-filter-option"
              onClick={() => setActiveProject(option)}
              style={{ color: activeProject === option ? 'var(--text)' : 'var(--muted)' }}
            >
              {option}
            </button>
          ))}
        </div>

        <div>
          <div className="mytasks-filter-label">Bucket</div>
          {['Now', 'After Phase', 'Checklist', 'Someday'].map((option) => (
            <button
              key={option}
              type="button"
              className="mytasks-filter-option"
              onClick={() => setActiveBucket(option)}
              style={{ color: activeBucket === option ? 'var(--text)' : 'var(--muted)' }}
            >
              {option}
            </button>
          ))}
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: 'var(--subtle)',
              textTransform: 'uppercase',
            }}
          >
            MY TASKS · {openCount} open{hasLiveTasks ? ' · live' : ''}
          </span>
          <button type="button" className="mytasks-add-button">
            + Add Task
          </button>
        </div>

        {baseGroups.map((group) => {
          const isOpen = openGroups[group.id] ?? true
          const visibleTasks = group.tasks.filter((task) => !hiddenTaskIds[task.id])

          return (
            <section key={group.id} style={{ marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setOpenGroups((prev) => ({ ...prev, [group.id]: !isOpen }))}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 0',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--faint)' }}>{isOpen ? '▼' : '▶'}</span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    letterSpacing: '0.12em',
                    color: 'var(--subtle)',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {group.name}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--faint)' }}>
                  {visibleTasks.length}
                </span>
                <span style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </button>

              {isOpen ? (
                <>
                  {visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`mytasks-row${completingTaskIds[task.id] ? ' is-completing' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        padding: '6px 4px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      <button type="button" className="mytasks-checkbox" onClick={() => completeTask(task.id)}>
                        ✓
                      </button>
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '999px',
                          background: priorityColor(task.priority),
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: '16px', color: 'var(--text)', flex: 1 }}>{task.title}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--faint)' }}>
                        {task.bucket}
                      </span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '11px',
                          color: task.overdue ? '#ef4444' : 'var(--faint)',
                        }}
                      >
                        {task.due}
                      </span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '10px',
                          borderRadius: '2px',
                          padding: '1px 4px',
                          ...sourceStyle(task.source),
                        }}
                      >
                        {task.source}
                      </span>
                      <span className="mytasks-row-menu">···</span>
                    </div>
                  ))}

                  {quickAddFor === group.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 4px' }}>
                      <span className="mytasks-checkbox-faded" />
                      <input
                        autoFocus
                        value={quickAddText}
                        onChange={(event) => setQuickAddText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            setQuickAddFor(null)
                            setQuickAddText('')
                            showToast('Task added')
                          } else if (event.key === 'Escape') {
                            setQuickAddFor(null)
                            setQuickAddText('')
                          }
                        }}
                        className="mytasks-input"
                        placeholder="Task title... (Enter to save, Esc to cancel)"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="mytasks-quick-add"
                      onClick={() => {
                        setQuickAddFor(group.id)
                        setQuickAddText('')
                      }}
                    >
                      + Add task to {group.name}
                    </button>
                  )}
                </>
              ) : null}
            </section>
          )
        })}

        <button
          type="button"
          onClick={() => showToast('Completed tasks — coming in full build')}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: 'var(--faint)',
            padding: '10px 4px',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
          }}
          className="mytasks-completed-toggle"
        >
          ▶ Completed this week (12)
        </button>
      </main>

      {toastMessage ? <Toast message={toastMessage} visible={toastVisible} /> : null}
    </div>
  )
}
