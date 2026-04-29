import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTaskModal } from '../context/TaskModalContext'
import { Toast } from '../components/shared/Toast'
import { BackButton } from '../components/shared/BackButton'

const projectMeta: Record<string, { category: string; company: string; status: string; phases: string[]; current: string }> = {
  StatFlow: {
    category: 'Apps',
    company: 'Beehiv Labs',
    status: 'active',
    phases: ['Discovery', 'Build', 'App Store Review', 'Launch', 'Post-Launch'],
    current: 'App Store Review',
  },
  CryptoDraftPicks: {
    category: 'Platforms',
    company: 'Draft Labs',
    status: 'blocked',
    phases: ['Concept', 'Design', 'Development', 'Beta', 'Launch'],
    current: 'Development',
  },
  'Dead or Alive': {
    category: 'Film',
    company: 'DoA Pictures',
    status: 'review',
    phases: ['Pre-Production', 'Production', 'Post-Production', 'Festival', 'Distribution'],
    current: 'Post-Production',
  },
  CrewSheetz: {
    category: 'Apps',
    company: 'Crew Ops',
    status: 'active',
    phases: ['Concept', 'MVP Build', 'Beta', 'Launch', 'Growth'],
    current: 'MVP Build',
  },
  'Christian App Empire': {
    category: 'Apps',
    company: 'CAE',
    status: 'active',
    phases: ['Active Portfolio', 'Optimization', 'Expansion', 'Scale'],
    current: 'Active Portfolio',
  },
  'To Fame From Love': {
    category: 'Film',
    company: 'Love Frame',
    status: 'review',
    phases: ['Development', 'Pre-Production', 'Production', 'Post', 'Distribution'],
    current: 'Development',
  },
}

function normalizeProjectName(routeName?: string): string {
  if (!routeName) return 'StatFlow'
  const cleaned = decodeURIComponent(routeName).toLowerCase()
  return Object.keys(projectMeta).find((name) => name.toLowerCase() === cleaned) ?? 'StatFlow'
}

export function ProjectPage() {
  const { name } = useParams()
  const projectName = decodeURIComponent(name || '')
  const [activeTab, setActiveTab] = useState('Open')
  const normalizedName = normalizeProjectName(projectName)
  const meta = projectMeta[normalizedName]
  const { tasks, updateTask, deleteTask, openTaskModal } = useTaskModal()
  const projectTasks = tasks.filter((task) => task.projectName === normalizedName)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<{ title: string; priority: 'urgent' | 'high' | 'normal' | 'low'; bucket: 'now' | 'after_phase' | 'checklist' | 'someday' } | null>(null)
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState<string | null>(null)
  const [deletingTaskIds, setDeletingTaskIds] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const currentIndex = useMemo(() => meta.phases.indexOf(meta.current), [meta.current, meta.phases])

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

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg)' }}>
      <BackButton />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 500, color: 'var(--text)' }}>{normalizedName}</div>
          <div
            style={{
              marginTop: '4px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: 'var(--faint)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {meta.category} · {meta.company}
          </div>
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '2px',
            textTransform: 'uppercase',
            background:
              meta.status === 'active'
                ? 'rgba(34,197,94,0.08)'
                : meta.status === 'blocked'
                  ? 'rgba(239,68,68,0.08)'
                  : 'rgba(245,158,11,0.08)',
            color: meta.status === 'active' ? '#22c55e' : meta.status === 'blocked' ? '#ef4444' : '#f59e0b',
            border:
              meta.status === 'active'
                ? '1px solid rgba(34,197,94,0.3)'
                : meta.status === 'blocked'
                  ? '1px solid rgba(239,68,68,0.2)'
                  : '1px solid rgba(245,158,11,0.2)',
          }}
        >
          {meta.status}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '10px 14px',
        }}
      >
        {meta.phases.map((phase, idx) => (
          <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                padding: '4px 9px',
                borderRadius: '3px',
                border: '1px solid var(--border)',
                opacity: idx < currentIndex ? 0.4 : 1,
                color: phase === meta.current ? '#22c55e' : 'var(--muted)',
                background: phase === meta.current ? 'rgba(34,197,94,0.07)' : 'transparent',
              }}
            >
              {phase}
            </span>
            {idx < meta.phases.length - 1 ? (
              <span style={{ color: 'var(--faint)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>→</span>
            ) : null}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '12px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
            {['Open', 'In Progress', 'Complete', 'Snoozed', 'Handoff'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #22c55e' : '2px solid transparent',
                  color: activeTab === tab ? 'var(--text)' : 'var(--muted)',
                  background: 'transparent',
                  padding: '6px 10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          {projectTasks.map((task) => (
            <div
              key={task.id}
              className={`dashboard-panel-task task-row${deletingTaskIds[task.id] ? ' is-completing' : ''}`}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span
                style={{
                  width: '15px',
                  height: '15px',
                  border: '1px solid var(--border2)',
                  borderRadius: '3px',
                  opacity: 0.35,
                }}
              />
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '999px',
                  background: task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f59e0b' : task.priority === 'normal' ? '#3b82f6' : '#333333',
                }}
              />
              {editingTaskId === task.id && editDraft ? (
                <>
                  <input
                    value={editDraft.title}
                    onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, title: event.target.value } : prev))}
                    style={{ flex: 1, border: 'none', borderBottom: '1px solid #3b82f6', background: 'transparent', color: 'var(--text)', fontSize: '16px', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {(['urgent', 'high', 'normal', 'low'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setEditDraft((prev) => (prev ? { ...prev, priority: level } : prev))}
                        style={{ width: '10px', height: '10px', borderRadius: '999px', border: editDraft.priority === level ? '1px solid #fff' : 'none', background: level === 'urgent' ? '#ef4444' : level === 'high' ? '#f59e0b' : level === 'normal' ? '#3b82f6' : '#333333', cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                  <select
                    value={editDraft.bucket}
                    onChange={(event) => setEditDraft((prev) => (prev ? { ...prev, bucket: event.target.value as typeof editDraft.bucket } : prev))}
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '3px' }}
                  >
                    <option value="now">NOW</option>
                    <option value="after_phase">AFTER PHASE</option>
                    <option value="checklist">CHECKLIST</option>
                    <option value="someday">SOMEDAY</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      updateTask(task.id, {
                        title: editDraft.title.trim() || 'Untitled task',
                        priority: editDraft.priority,
                        bucket: editDraft.bucket,
                      })
                      setEditingTaskId(null)
                      setEditDraft(null)
                      setToastMessage('Task updated')
                    }}
                    style={{ border: 'none', background: 'transparent', color: '#22c55e', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✓ Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTaskId(null)
                      setEditDraft(null)
                    }}
                    style={{ border: 'none', background: 'transparent', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ✗ Cancel
                  </button>
                </>
              ) : deleteConfirmTaskId === task.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Delete this task?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingTaskIds((prev) => ({ ...prev, [task.id]: true }))
                      window.setTimeout(() => {
                        deleteTask(task.id)
                        setDeletingTaskIds((prev) => ({ ...prev, [task.id]: false }))
                        setDeleteConfirmTaskId(null)
                        setToastMessage('Task deleted')
                      }, 280)
                    }}
                    style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmTaskId(null)}
                    style={{ border: 'none', background: 'transparent', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '15px', color: 'var(--text)', flex: 1 }}>{task.title}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--faint)' }}>
                    {task.bucket.replace('_', ' ').toUpperCase()}
                  </span>
                </>
              )}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  borderRadius: '2px',
                  padding: '1px 4px',
                  background: task.source === 'agent' ? 'rgba(34,197,94,0.08)' : task.source === 'cursor' ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)',
                  color: task.source === 'agent' ? '#22c55e' : task.source === 'cursor' ? '#3b82f6' : '#f59e0b',
                }}
              >
                {task.source.toUpperCase()}
              </span>
              <div className="task-row-action-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmTaskId(null)
                    setEditingTaskId(task.id)
                    setEditDraft({ title: task.title, priority: task.priority, bucket: task.bucket })
                  }}
                  style={{ border: 'none', background: 'transparent', color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', cursor: 'pointer' }}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTaskId(null)
                    setEditDraft(null)
                    setDeleteConfirmTaskId(task.id)
                  }}
                  style={{ border: 'none', background: 'transparent', color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', cursor: 'pointer' }}
                >
                  🗑 Del
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={openTaskModal} style={{ marginTop: '8px', border: 'none', background: 'transparent', color: 'var(--muted)', fontSize: '14px', cursor: 'pointer' }}>
            + Add task
          </button>
        </div>
        <aside style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: 'var(--faint)',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            ACTIVITY LOG
          </div>
          {(normalizedName === 'StatFlow'
            ? ['2:14pm Apr 26 — Agent logged 3 tasks from Cursor log', '1:47pm Apr 26 — Task completed: Submit to App Store']
            : normalizedName === 'CryptoDraftPicks'
              ? ['11:02am Apr 26 — Agent flagged: blocked on Solana config', '9:22am Apr 26 — Model update requested']
              : ['9:30am Apr 26 — Agent logged 2 handoff items', '8:40am Apr 26 — Audio notes follow-up sent']
          ).map((line) => (
            <div key={line} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--faint)', marginBottom: '4px' }}>
                {line.split(' — ')[0]}
              </div>
              <div style={{ fontSize: '15px', color: 'var(--muted)' }}>{line.split(' — ')[1]}</div>
            </div>
          ))}
        </aside>
      </div>
      {toastMessage ? <Toast message={toastMessage} visible={toastVisible} /> : null}
    </div>
  )
}
