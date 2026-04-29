import { useEffect, useMemo, useState } from 'react'
import { Toast } from './Toast'
import { useTaskModal } from '../../context/TaskModalContext'
import { useProjectModal } from '../../context/ProjectModalContext'

const projectOptions = [
  'StatFlow',
  'CryptoDraftPicks',
  'Dead or Alive',
  'CrewSheetz',
  'Christian App Empire',
  'To Fame From Love',
]

export function AddTaskModal() {
  const { isTaskModalOpen, closeTaskModal, addTask } = useTaskModal()
  const { projects } = useProjectModal()
  const [title, setTitle] = useState('')
  const [projectName, setProjectName] = useState(projectOptions[0])
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal' | 'low'>('normal')
  const [bucket, setBucket] = useState<'now' | 'after_phase' | 'checklist' | 'someday'>('now')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const dynamicProjectOptions = useMemo(
    () => [...new Set([...projectOptions, ...projects.map((project) => project.name)])],
    [projects],
  )

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

  if (!isTaskModalOpen) return toastMessage ? <Toast message={toastMessage} visible={toastVisible} /> : null

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.45)', zIndex: 300 }} onClick={closeTaskModal} />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '480px',
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: '8px',
          padding: '24px',
          zIndex: 301,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '22px', fontWeight: 500, color: 'var(--text)' }}>New Task</div>
          <button onClick={closeTaskModal} style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px' }}>
            ✕
          </button>
        </div>

        <input
          autoFocus
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            setError('')
          }}
          placeholder="Task title..."
          style={{
            width: '100%',
            border: 'none',
            borderBottom: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text)',
            fontSize: '22px',
            paddingBottom: '8px',
            marginBottom: '14px',
            outline: 'none',
          }}
        />

        <div style={{ display: 'grid', gap: '12px' }}>
          <select value={projectName} onChange={(event) => setProjectName(event.target.value)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', color: 'var(--text)' }}>
            {dynamicProjectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'urgent', label: 'Urgent', color: '#ef4444' },
              { key: 'high', label: 'High', color: '#f59e0b' },
              { key: 'normal', label: 'Normal', color: '#3b82f6' },
              { key: 'low', label: 'Low', color: '#333333' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPriority(item.key as typeof priority)}
                style={{
                  border: `1px solid ${priority === item.key ? item.color : 'var(--border)'}`,
                  background: priority === item.key ? `${item.color}22` : 'var(--surface2)',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '999px', background: item.color, marginRight: '6px' }} />
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'now', label: 'Now' },
              { key: 'after_phase', label: 'After Phase' },
              { key: 'checklist', label: 'Checklist' },
              { key: 'someday', label: 'Someday' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setBucket(item.key as typeof bucket)}
                style={{
                  border: `1px solid ${bucket === item.key ? '#3b82f6' : 'var(--border)'}`,
                  background: bucket === item.key ? '#3b82f622' : 'var(--surface2)',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', color: 'var(--text)' }} />

          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--faint)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '3px', width: 'fit-content' }}>
            MANUAL
          </span>
        </div>
        {error ? <div style={{ marginTop: '8px', color: '#ef4444', fontSize: '14px' }}>{error}</div> : null}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
          <button onClick={closeTaskModal} style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: '15px' }}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (!title.trim()) {
                setError('Title required')
                return
              }
              addTask({ projectName, title: title.trim(), priority, bucket, dueDate: dueDate || null, source: 'manual' })
              setToastMessage(`Task added to ${projectName}`)
              setTitle('')
              setDueDate('')
              closeTaskModal()
            }}
            style={{ border: 'none', background: '#22c55e', color: '#000', fontWeight: 600, borderRadius: '4px', padding: '8px 18px', cursor: 'pointer' }}
          >
            Save Task
          </button>
        </div>
      </div>
      {toastMessage ? <Toast message={toastMessage} visible={toastVisible} /> : null}
    </>
  )
}
