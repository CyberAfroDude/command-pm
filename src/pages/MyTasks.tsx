import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Toast } from '../components/shared/Toast'
import { useTaskModal } from '../context/TaskModalContext'
import { useProjectModal } from '../context/ProjectModalContext'
import './MyTasks.css'

type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'
type TaskBucket = 'now' | 'after_phase' | 'checklist' | 'someday'
type TaskSource = 'agent' | 'cursor' | 'slack' | 'manual'

interface TaskItem {
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

interface CompletedTask extends TaskItem {
  completedAt: string
}

const BUCKET_LABEL: Record<TaskBucket, string> = {
  now: 'NOW',
  after_phase: 'AFTER PHASE',
  checklist: 'CHECKLIST',
  someday: 'SOMEDAY',
}

function priorityColor(priority: TaskPriority): string {
  if (priority === 'urgent') return '#ef4444'
  if (priority === 'high') return '#f59e0b'
  if (priority === 'normal') return '#3b82f6'
  return '#333333'
}

function sourceStyle(source: TaskSource): CSSProperties {
  if (source === 'agent') return { background: 'rgba(34,197,94,0.08)', color: '#22c55e' }
  if (source === 'cursor') return { background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }
  return { background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }
}

export function MyTasks() {
  const { tasks, addTask, openTaskModal } = useTaskModal()
  const { projects } = useProjectModal()

  const [activeView, setActiveView] = useState<'All Tasks' | 'Assigned to Me' | 'Agent Created' | 'Due Today' | 'Overdue'>('All Tasks')
  const [activePriority, setActivePriority] = useState<TaskPriority | null>(null)
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const [activeBucket, setActiveBucket] = useState<TaskBucket | null>(null)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    StatFlow: true,
    CryptoDraftPicks: true,
    'Dead or Alive': true,
  })
  const [completingTaskIds, setCompletingTaskIds] = useState<Record<string, boolean>>({})
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([])
  const [showCompleted, setShowCompleted] = useState(false)
  const [quickAddFor, setQuickAddFor] = useState<string | null>(null)
  const [quickAddText, setQuickAddText] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const openTasks = useMemo(
    () => tasks.filter((task) => !completedTasks.some((completed) => completed.id === task.id)),
    [completedTasks, tasks],
  )

  const today = new Date().toISOString().slice(0, 10)

  const filteredTasks = useMemo(() => {
    let next = openTasks
    if (activeView === 'Assigned to Me') next = next.filter((task) => task.assignedTo === 'Spence')
    if (activeView === 'Agent Created') next = next.filter((task) => task.source === 'agent')
    if (activeView === 'Due Today') next = next.filter((task) => task.dueDate === today)
    if (activeView === 'Overdue') next = next.filter((task) => !!task.dueDate && task.dueDate < today)
    if (activePriority) next = next.filter((task) => task.priority === activePriority)
    if (activeProject) next = next.filter((task) => task.projectName === activeProject)
    if (activeBucket) next = next.filter((task) => task.bucket === activeBucket)
    return next
  }, [activeBucket, activePriority, activeProject, activeView, openTasks, today])

  const openCount = filteredTasks.length
  const hasLiveTasks = tasks.length > 0

  const groupedTasks = useMemo(() => {
    const map = new Map<string, TaskItem[]>()
    for (const task of filteredTasks) {
      const list = map.get(task.projectName) ?? []
      list.push(task)
      map.set(task.projectName, list)
    }
    return [...map.entries()].map(([name, groupTasks]) => ({ id: name, name, tasks: groupTasks }))
  }, [filteredTasks])

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

  const completeTask = (task: TaskItem) => {
    if (completingTaskIds[task.id] || completedTasks.some((item) => item.id === task.id)) return
    setCompletingTaskIds((prev) => ({ ...prev, [task.id]: true }))
    window.setTimeout(() => {
      setCompletedTasks((prev) => [{ ...task, completedAt: new Date().toLocaleTimeString() }, ...prev])
      setCompletingTaskIds((prev) => ({ ...prev, [task.id]: false }))
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
              onClick={() =>
                setActiveView((prev) =>
                  prev === option ? 'All Tasks' : (option as 'All Tasks' | 'Assigned to Me' | 'Agent Created' | 'Due Today' | 'Overdue'),
                )
              }
              style={{
                color: activeView === option ? '#e8e8e8' : option === 'Overdue' ? '#ef4444' : 'var(--muted)',
                borderLeft: activeView === option ? '2px solid #22c55e' : '2px solid transparent',
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
              onClick={() => setActivePriority((prev) => (prev === option.label.toLowerCase() ? null : (option.label.toLowerCase() as TaskPriority)))}
              style={{
                color: activePriority === option.label.toLowerCase() ? '#e8e8e8' : 'var(--muted)',
                borderLeft: activePriority === option.label.toLowerCase() ? '2px solid #22c55e' : '2px solid transparent',
              }}
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
          {['All Projects', ...projects.map((project) => project.name)].map((option) => (
            <button
              key={option}
              type="button"
              className="mytasks-filter-option"
              onClick={() => setActiveProject((prev) => (prev === option || option === 'All Projects' ? null : option))}
              style={{
                color: (activeProject ?? 'All Projects') === option ? '#e8e8e8' : 'var(--muted)',
                borderLeft: (activeProject ?? 'All Projects') === option ? '2px solid #22c55e' : '2px solid transparent',
              }}
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
              onClick={() =>
                setActiveBucket((prev) => {
                  const value =
                    option === 'Now' ? 'now' : option === 'After Phase' ? 'after_phase' : option === 'Checklist' ? 'checklist' : 'someday'
                  return prev === value ? null : value
                })
              }
              style={{
                color:
                  activeBucket ===
                  (option === 'Now' ? 'now' : option === 'After Phase' ? 'after_phase' : option === 'Checklist' ? 'checklist' : 'someday')
                    ? '#e8e8e8'
                    : 'var(--muted)',
                borderLeft:
                  activeBucket ===
                  (option === 'Now' ? 'now' : option === 'After Phase' ? 'after_phase' : option === 'Checklist' ? 'checklist' : 'someday')
                    ? '2px solid #22c55e'
                    : '2px solid transparent',
              }}
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
          <button type="button" className="mytasks-add-button" onClick={openTaskModal}>
            + Add Task
          </button>
        </div>

        {groupedTasks.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '28px 0',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '15px',
              color: 'var(--faint)',
            }}
          >
            No tasks match this filter
          </div>
        ) : null}

        {groupedTasks.map((group) => {
          const isOpen = openGroups[group.id] ?? true
          const visibleTasks = group.tasks

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
                      <button type="button" className="mytasks-checkbox" onClick={() => completeTask(task)}>
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
                        {BUCKET_LABEL[task.bucket]}
                      </span>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '11px',
                          color: task.dueDate && task.dueDate < today ? '#ef4444' : 'var(--faint)',
                        }}
                      >
                        {task.dueDate ? task.dueDate : '—'}
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
                        {task.source.toUpperCase()}
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
                            addTask({
                              projectName: group.name,
                              title: quickAddText.trim(),
                              priority: 'normal',
                              bucket: 'now',
                              dueDate: null,
                              source: 'manual',
                            })
                            showToast(`Task added to ${group.name}`)
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
          onClick={() => setShowCompleted((prev) => !prev)}
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
          {showCompleted ? '▼ Hide completed' : '▶ Show completed'} ({completedTasks.length})
        </button>
        {showCompleted ? (
          <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)' }}>
            {completedTasks.map((task) => (
              <div key={task.id} className="mytasks-row" style={{ padding: '8px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: `${priorityColor(task.priority)}66` }} />
                <span style={{ fontSize: '15px', color: 'var(--muted)', textDecoration: 'line-through', flex: 1 }}>{task.title}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--faint)' }}>{task.completedAt}</span>
                <button
                  type="button"
                  className="mytasks-row-menu"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                  onClick={() => {
                    setCompletedTasks((prev) => prev.filter((item) => item.id !== task.id))
                    showToast('Task restored')
                  }}
                >
                  ↩
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </main>

      {toastMessage ? <Toast message={toastMessage} visible={toastVisible} /> : null}
    </div>
  )
}
