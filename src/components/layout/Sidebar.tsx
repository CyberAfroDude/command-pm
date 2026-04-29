import { useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useProjects } from '../../hooks/useProjects'
import type { Project } from '../../lib/types'
import './Sidebar.css'
import { useProjectModal } from '../../context/ProjectModalContext'

type ProjectGroupKey = 'film' | 'apps' | 'platforms'

const GROUP_META: Record<ProjectGroupKey, { label: string; emoji: string }> = {
  film: { label: 'Film', emoji: '🎬' },
  apps: { label: 'Apps', emoji: '📱' },
  platforms: { label: 'Platforms', emoji: '🔗' },
}

const PROJECT_TASK_COUNTS: Record<string, number> = {
  StatFlow: 5,
  CryptoDraftPicks: 3,
  'Dead or Alive': 4,
  CrewSheetz: 7,
  'Christian App Empire': 9,
  'To Fame From Love': 3,
}

function getGroupKey(category: Project['category']): ProjectGroupKey | null {
  const value = category?.trim().toLowerCase()
  if (value === 'film') return 'film'
  if (value === 'apps') return 'apps'
  if (value === 'platforms') return 'platforms'
  return null
}

function getStatusColor(status: Project['status']): string {
  if (status === 'active') return '#22c55e'
  if (status === 'blocked') return '#ef4444'
  return '#f59e0b'
}

export function Sidebar() {
  const navigate = useNavigate()
  const { projects } = useProjects()
  const { projects: localProjects, openProjectModal } = useProjectModal()

  const groupedProjects = useMemo(() => {
    const mergedProjects =
      localProjects.length > 0
        ? localProjects.map((project) => ({
            id: project.id,
            name: project.name,
            category: project.category,
            status: project.status,
            phase: project.phase,
            priority: project.priority,
            owner: null,
            progress: project.progress,
            notes: project.notes,
            created_at: '',
            updated_at: '',
          }))
        : projects

    const grouped: Record<ProjectGroupKey, Project[]> = {
      film: [],
      apps: [],
      platforms: [],
    }

    for (const project of mergedProjects) {
      const key = getGroupKey(project.category)
      if (key) grouped[key].push(project)
    }

    return grouped
  }, [localProjects, projects])

  return (
    <aside
      style={{
        width: '210px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border)' }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: 'var(--text)',
            textTransform: 'uppercase',
          }}
        >
          COMMAND
        </div>
        <div
          style={{
            marginTop: '4px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: 'var(--faint)',
          }}
        >
          PM · v2.0
        </div>
      </div>

      <nav style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
        {[
          { to: '/', label: 'Dashboard' },
          { to: '/tasks', label: 'My Tasks', badge: 14 },
          { to: '/project/StatFlow', label: 'Projects' },
          { to: '/handoffs', label: 'Handoffs', badge: 2 },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'sidebar-nav-item is-active' : 'sidebar-nav-item')}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              fontSize: '16px',
              color: isActive ? 'var(--text)' : 'var(--muted)',
              background: isActive ? 'var(--surface2)' : 'transparent',
              textDecoration: 'none',
            })}
          >
            <span>{item.label}</span>
            {item.badge !== undefined ? (
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--faint)',
                }}
              >
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {(Object.keys(GROUP_META) as ProjectGroupKey[]).map((groupKey) => {
          const groupProjects = groupedProjects[groupKey]
          if (groupProjects.length === 0) return null

          const meta = GROUP_META[groupKey]
          return (
            <section key={groupKey}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  color: 'var(--faint)',
                  padding: '10px 14px 4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                }}
              >
                {meta.emoji} {meta.label}
              </div>
              {groupProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/project/${encodeURIComponent(project.name)}`)}
                  className="sidebar-project-item"
                  style={{
                    width: '100%',
                    padding: '5px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '999px',
                      background: getStatusColor(project.status),
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="sidebar-project-name"
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1,
                    }}
                  >
                    {project.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '11px',
                      color: 'var(--faint)',
                      flexShrink: 0,
                    }}
                  >
                    {PROJECT_TASK_COUNTS[project.name] ?? 0}
                  </span>
                </button>
              ))}
            </section>
          )
        })}
      </div>

      <div
        className="sidebar-add-project"
        onClick={openProjectModal}
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          color: 'var(--faint)',
        }}
      >
        + add project
      </div>
    </aside>
  )
}
