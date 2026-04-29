import { useEffect, useState } from 'react'
import { Toast } from '../components/shared/Toast'
import { BackButton } from '../components/shared/BackButton'

interface HandoffRow {
  id: string
  project: string
  task: string
  to: string
  status: 'NEEDS YOU' | 'SENT' | 'CONFIRMED'
  canResolve: boolean
}

const initialRows: HandoffRow[] = [
  {
    id: 'h-1',
    project: 'Dead or Alive',
    task: 'Send audio direction notes to Fred Brown II',
    to: 'Spence ←',
    status: 'NEEDS YOU',
    canResolve: true,
  },
  {
    id: 'h-2',
    project: 'CryptoDraftPicks',
    task: 'Solana config decision',
    to: 'Spence ←',
    status: 'NEEDS YOU',
    canResolve: true,
  },
  {
    id: 'h-3',
    project: 'Dead or Alive',
    task: 'Color grade review',
    to: 'Wayne Yu',
    status: 'SENT',
    canResolve: false,
  },
  {
    id: 'h-4',
    project: 'Dead or Alive',
    task: 'Edit pass 2',
    to: 'Eric Fernandez',
    status: 'CONFIRMED',
    canResolve: false,
  },
]

function badgeStyle(status: HandoffRow['status']) {
  if (status === 'NEEDS YOU') {
    return { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
  }
  if (status === 'SENT') {
    return { background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }
  }
  return { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }
}

export function HandoffsPage() {
  const [rows, setRows] = useState(initialRows)
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

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg)' }}>
      <BackButton />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--subtle)',
          }}
        >
          ALL HANDOFFS
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--faint)' }}>
          2 need your attention
        </span>
      </div>

      <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 110px 100px 90px',
            padding: '8px 16px',
            borderBottom: '1px solid var(--border)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: 'var(--faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          <span>Project</span>
          <span>Task</span>
          <span>To</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {rows.map((row, idx) => (
          <div
            key={row.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 110px 100px 90px',
              padding: '10px 16px',
              borderBottom: idx === rows.length - 1 ? 'none' : '1px solid var(--border)',
              alignItems: 'center',
            }}
            className="dashboard-hover-row"
          >
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{row.project}</span>
            <span style={{ fontSize: '15px', color: 'var(--text)' }}>{row.task}</span>
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{row.to}</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '2px',
                justifySelf: 'start',
                ...badgeStyle(row.status),
              }}
            >
              {row.status}
            </span>
            {row.canResolve ? (
              <button
                type="button"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#3b82f6',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  cursor: 'pointer',
                  justifySelf: 'start',
                }}
                onClick={() => {
                  setRows((prev) =>
                    prev.map((item) => (item.id === row.id ? { ...item, status: 'CONFIRMED', canResolve: false } : item)),
                  )
                  setToastMessage('Marked as resolved')
                }}
              >
                Resolve →
              </button>
            ) : (
              <span style={{ color: 'var(--faint)' }}>—</span>
            )}
          </div>
        ))}
      </section>
      {toastMessage ? <Toast message={toastMessage} visible={toastVisible} /> : null}
    </div>
  )
}
