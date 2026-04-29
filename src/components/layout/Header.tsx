import { useLocation } from 'react-router-dom'
import './Header.css'

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
  const title = getPageTitle(pathname)
  const dateLabel = getTodayLabel()

  return (
    <header
      style={{
        width: '100%',
        height: '48px',
        background: '#0a0a0a',
        borderBottom: '1px solid #222222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#e8e8e8' }}>{title}</div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="header-status-dot" />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
              color: '#555555',
              letterSpacing: '0.06em',
            }}
          >
            CLAW PM · online
          </span>
        </div>

        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            color: '#555555',
          }}
        >
          {dateLabel}
        </span>

        <button
          type="button"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            color: '#555555',
            background: '#161616',
            border: '1px solid #2e2e2e',
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
