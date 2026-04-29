import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useTheme } from '../../context/ThemeContext'

export default function Layout() {
  const { theme } = useTheme()
  return (
    <div
      className={`app-root ${theme}`}
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Header />
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}
