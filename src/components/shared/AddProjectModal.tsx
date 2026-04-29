import { useEffect, useState } from 'react'
import { useProjectModal } from '../../context/ProjectModalContext'
import { Toast } from './Toast'

export function AddProjectModal() {
  const { isProjectModalOpen, closeProjectModal, addProject } = useProjectModal()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('App')
  const [company, setCompany] = useState('')
  const [phase, setPhase] = useState('')
  const [priority, setPriority] = useState(3)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

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

  if (!isProjectModalOpen) return toastMessage ? <Toast message={toastMessage} visible={toastVisible} /> : null

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.45)', zIndex: 300 }} onClick={closeProjectModal} />
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
          <div style={{ fontSize: '22px', fontWeight: 500, color: 'var(--text)' }}>New Project</div>
          <button onClick={closeProjectModal} style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '20px' }}>
            ✕
          </button>
        </div>

        <input
          autoFocus
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError('')
          }}
          placeholder="Project name..."
          style={{ width: '100%', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontSize: '22px', paddingBottom: '8px', marginBottom: '14px', outline: 'none' }}
        />
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['App', 'Film', 'Platform', 'Service'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
                style={{
                  border: `1px solid ${category === option ? '#3b82f6' : 'var(--border)'}`,
                  background: category === option ? '#3b82f622' : 'var(--surface2)',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <input value={phase} onChange={(event) => setPhase(event.target.value)} placeholder="Current phase e.g. Development" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', color: 'var(--text)' }} />
          <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company e.g. DoA Pictures" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', color: 'var(--text)' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPriority(num)}
                style={{
                  border: `1px solid ${priority === num ? '#22c55e' : 'var(--border)'}`,
                  background: priority === num ? '#22c55e22' : 'var(--surface2)',
                  borderRadius: '999px',
                  padding: '6px 10px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                {num}
              </button>
            ))}
          </div>
          <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Any notes..." style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', color: 'var(--text)', resize: 'vertical' }} />
        </div>
        {error ? <div style={{ marginTop: '8px', color: '#ef4444', fontSize: '14px' }}>{error}</div> : null}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
          <button onClick={closeProjectModal} style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: '15px' }}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim()) {
                setError('Project name required')
                return
              }
              addProject({
                name: name.trim(),
                category,
                company: company.trim() || 'Independent',
                phase: phase.trim() || 'Development',
                priority,
                notes,
              })
              setToastMessage(`Project added: ${name.trim()}`)
              closeProjectModal()
              setName('')
              setCompany('')
              setPhase('')
              setNotes('')
            }}
            style={{ border: 'none', background: '#22c55e', color: '#000', fontWeight: 600, borderRadius: '4px', padding: '8px 18px', cursor: 'pointer' }}
          >
            Save Project
          </button>
        </div>
      </div>
      {toastMessage ? <Toast message={toastMessage} visible={toastVisible} /> : null}
    </>
  )
}
