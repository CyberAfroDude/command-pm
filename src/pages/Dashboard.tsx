import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivityLog } from '../hooks/useActivityLog'
import { useAllTasks } from '../hooks/useAllTasks'
import { useProjects } from '../hooks/useProjects'
import type { ActivityLog, Project, Task } from '../lib/types'
import './Dashboard.css'

const projectMeta: Record<string, { tasks: number; ago: string }> = {
  StatFlow: { tasks: 5, ago: '2h ago' },
  CryptoDraftPicks: { tasks: 3, ago: '4h ago' },
  'Dead or Alive': { tasks: 4, ago: '1h ago' },
  CrewSheetz: { tasks: 7, ago: '6h ago' },
  'Christian App Empire': { tasks: 9, ago: '3h ago' },
  'To Fame From Love': { tasks: 3, ago: '5h ago' },
}

const fallbackActivity: Array<{ time: string; source: string; entry: string }> = [
  { time: '2:14p', source: 'agent', entry: 'Logged 3 tasks from Cursor log → StatFlow' },
  { time: '1:47p', source: 'agent', entry: 'Task completed: Submit to App Store → StatFlow' },
  { time: '11:02a', source: 'cursor', entry: 'Flagged: CryptoDraftPicks blocked' },
  { time: '9:30a', source: 'slack', entry: 'Logged 2 handoff items → Dead or Alive' },
]

const handoffRows = [
  { project: 'Dead or Alive', task: 'Audio notes', status: 'NEEDS YOU' },
  { project: 'CryptoDraftPicks', task: 'Solana config', status: 'NEEDS YOU' },
  { project: 'Dead or Alive', task: 'Color grade', status: 'Wayne Yu' },
  { project: 'Dead or Alive', task: 'Edit pass 2', status: 'Eric F.' },
]

function statusBadgeStyle(status: string | null): CSSProperties {
  if (status === 'active') {
    return {
      background: 'rgba(34,197,94,0.08)',
      color: '#22c55e',
      border: '1px solid rgba(34,197,94,0.18)',
    }
  }
  if (status === 'blocked') {
    return {
      background: 'rgba(239,68,68,0.08)',
      color: '#ef4444',
      border: '1px solid rgba(239,68,68,0.18)',
    }
  }
  return {
    background: 'rgba(245,158,11,0.08)',
    color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.18)',
  }
}

function progressColor(status: string | null): string {
  if (status === 'active') return '#22c55e'
  if (status === 'blocked') return '#ef4444'
  if (status === 'review') return '#f59e0b'
  return '#3b82f6'
}

function formatLogTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  const hour12 = h % 12 || 12
  const suffix = h >= 12 ? 'p' : 'a'
  return `${hour12}:${m}${suffix}`
}

function activitySourceStyle(source: string): CSSProperties {
  const normalized = source.toLowerCase()
  if (normalized === 'agent') return { background: 'rgba(34,197,94,0.08)', color: '#22c55e' }
  if (normalized === 'cursor') return { background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }
  return { background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }
}

export function Dashboard() {
  const navigate = useNavigate()
  const { projects } = useProjects()
  const { tasks } = useAllTasks()
  const { log, loading: logLoading } = useActivityLog()

  const taskCountsByProject = useMemo(() => {
    return tasks.reduce<Record<string, number>>((acc, task: Task) => {
      acc[task.project_id] = (acc[task.project_id] ?? 0) + 1
      return acc
    }, {})
  }, [tasks])

  const activityRows = useMemo(() => {
    if (log.length === 0) return fallbackActivity
    return log.map((item: ActivityLog) => ({
      time: formatLogTime(item.created_at),
      source: item.source ?? 'agent',
      entry: item.entry,
    }))
  }, [log])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        background: '#0a0a0a',
        minHeight: '100%',
        fontFamily: "'Geist', sans-serif",
      }}
    >
      <section style={{ background: '#111111', border: '1px solid #222222', borderRadius: '5px', overflow: 'hidden' }}>
        <div
          style={{
            padding: '8px 14px',
            borderBottom: '1px solid #222222',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '8px',
              letterSpacing: '0.18em',
              color: '#555555',
              textTransform: 'uppercase',
            }}
          >
            TODAY&apos;S FOCUS
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: '#333333' }}>
            Agent · 6:00am daily refresh
          </span>
        </div>

        {[
          {
            num: '①',
            project: 'StatFlow',
            task: 'App Store review clears Monday — prep launch checklist now',
            tag: 'URGENT',
            tagStyle: { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)' },
          },
          {
            num: '②',
            project: 'CryptoDraftPicks',
            task: 'Solana config blocked — decision needed from you',
            tag: 'BLOCKED',
            tagStyle: { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)' },
          },
          {
            num: '③',
            project: 'Dead or Alive',
            task: 'Fred Brown II waiting on your audio direction notes',
            tag: 'HANDOFF',
            tagStyle: { background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.18)' },
          },
        ].map((row, index) => (
          <div
            key={row.num}
            className="dashboard-hover-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '9px 14px',
              borderBottom: index === 2 ? 'none' : '1px solid #222222',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#333333', width: '12px' }}>
              {row.num}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#e8e8e8', width: '150px', flexShrink: 0 }}>
              {row.project}
            </span>
            <span style={{ fontSize: '12px', color: '#999999', flex: 1 }}>{row.task}</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '8px',
                padding: '2px 6px',
                borderRadius: '2px',
                ...row.tagStyle,
              }}
            >
              {row.tag}
            </span>
          </div>
        ))}
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '8px',
              color: '#555555',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            PORTFOLIO
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: '#333333' }}>
            6 active · 1 blocked · 31 open tasks
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {projects.map((project: Project) => {
            const meta = projectMeta[project.name]
            const taskCount = meta?.tasks ?? taskCountsByProject[project.id] ?? 0
            const age = meta?.ago ?? '1h ago'
            const isBlocked = project.status === 'blocked'
            const progress = Math.max(0, Math.min(100, project.progress ?? 0))

            return (
              <article
                key={project.id}
                className="dashboard-project-card"
                onClick={() => navigate(`/project/${project.id}`)}
                style={{
                  background: '#111111',
                  border: isBlocked ? '1px solid rgba(239,68,68,0.2)' : '1px solid #222222',
                  borderRadius: '5px',
                  padding: '14px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 500, color: '#e8e8e8' }}>{project.name}</div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '8px',
                        color: '#333333',
                        textTransform: 'uppercase',
                        marginTop: '3px',
                      }}
                    >
                      {project.category ?? 'uncategorized'}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '7px',
                      padding: '2px 5px',
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                      ...statusBadgeStyle(project.status),
                    }}
                  >
                    {project.status ?? 'review'}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#999999', marginBottom: '8px' }}>{project.phase ?? 'No phase set'}</div>

                <div style={{ height: '2px', background: '#242424', borderRadius: '1px', marginBottom: '9px' }}>
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      borderRadius: '1px',
                      background: progressColor(project.status),
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10.5px', color: '#555555' }}>{taskCount} open tasks</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: '#333333' }}>{age}</span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '5px', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 14px',
              borderBottom: '1px solid #222222',
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '8px',
                color: '#555555',
                textTransform: 'uppercase',
              }}
            >
              AGENT ACTIVITY
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: '#333333' }}>Live</span>
          </div>

          {logLoading ? (
            <div style={{ padding: '10px 14px', fontSize: '11px', color: '#555555' }}>Loading activity...</div>
          ) : null}

          {activityRows.map((item, idx) => (
            <div
              key={`${item.time}-${idx}`}
              className="dashboard-hover-row"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '7px 14px',
                borderBottom: idx === activityRows.length - 1 ? 'none' : '1px solid #222222',
              }}
            >
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: '#333333', width: '34px', flexShrink: 0 }}
              >
                {item.time}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '7px',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  textTransform: 'uppercase',
                  ...activitySourceStyle(item.source),
                }}
              >
                {item.source}
              </span>
              <span style={{ fontSize: '11.5px', color: '#999999', flex: 1, lineHeight: 1.4 }}>{item.entry}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#111111', border: '1px solid #222222', borderRadius: '5px', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 14px',
              borderBottom: '1px solid #222222',
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '8px',
                color: '#555555',
                textTransform: 'uppercase',
              }}
            >
              HANDOFF QUEUE
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8px', color: '#333333' }}>2 need you</span>
          </div>

          {handoffRows.map((item, idx) => {
            const needsYou = item.status === 'NEEDS YOU'
            return (
              <div
                key={`${item.project}-${item.task}-${idx}`}
                className="dashboard-hover-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderBottom: idx === handoffRows.length - 1 ? 'none' : '1px solid #222222',
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '9px',
                    color: '#333333',
                    width: '95px',
                    flexShrink: 0,
                  }}
                >
                  {item.project}
                </span>
                <span style={{ fontSize: '12px', color: '#e8e8e8', flex: 1 }}>{item.task}</span>
                {needsYou ? (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '7px',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.18)',
                      color: '#ef4444',
                    }}
                  >
                    NEEDS YOU
                  </span>
                ) : (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: '#333333' }}>
                    {item.status}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
