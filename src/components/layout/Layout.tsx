import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '210px 1fr',
        minHeight: '100vh',
      }}
    >
      <Sidebar />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
