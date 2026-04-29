import { useLocation } from 'react-router-dom'
import './Header.css'
import { useTheme } from '../../context/ThemeContext'
import { useCommandBar } from '../../context/CommandBarContext'
import { useTaskModal } from '../../context/TaskModalContext'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard'
  if (pathname === '/tasks') return 'My Tasks'
  if (pathname.startsWith('/project')) return 'Project'
  if (pathname === '/handoffs') return 'Handoffs'
  if (pathname === '/settings') return 'Settings'
  return 'Dashboard'
}

function getTodayLabel(): string {
  const date = new Date()
  const weekday = WEEKDAYS[date.getDay()]
  const month = MONTHS[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  return `${weekday} ${month} ${day}, ${year}`
}

export function Header() {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { openCommandBar } = useCommandBar()
  const { openTaskModal } = useTaskModal()
  const title = getPageTitle(pathname)
  const dateLabel = getTodayLabel()

  return (
    <header
      style={{
        width: '100%',
        height: '48px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)' }}>{title}</div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="header-status-dot" />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: 'var(--subtle)',
              letterSpacing: '0.06em',
            }}
          >
            CLAW PM · online
          </span>
        </div>

        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'var(--subtle)',
          }}
        >
          {dateLabel}
        </span>

        <button
          type="button"
          onClick={toggleTheme}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'var(--subtle)',
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: '3px',
            padding: '2px 7px',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button
          type="button"
          onClick={openTaskModal}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'var(--subtle)',
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: '3px',
            padding: '2px 7px',
            cursor: 'pointer',
          }}
        >
          + Task
        </button>

        <button
          type="button"
          onClick={openCommandBar}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'var(--subtle)',
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: '3px',
            padding: '2px 7px',
            cursor: 'pointer',
          }}
        >
          ⌘K
        </button>
      </div>
    </header>
  )
}
