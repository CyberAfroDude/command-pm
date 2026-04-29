import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { AddProjectModal } from './components/shared/AddProjectModal'
import { AddTaskModal } from './components/shared/AddTaskModal'
import { CommandBar } from './components/layout/CommandBar'
import { Dashboard } from './pages/Dashboard'
import { HandoffsPage } from './pages/HandoffsPage'
import { MyTasks } from './pages/MyTasks'
import { ProjectPage } from './pages/ProjectPage'
import { SettingsPage } from './pages/SettingsPage'
import { useEffect } from 'react'
import { useCommandBar } from './context/CommandBarContext'

function App() {
  const { openCommandBar } = useCommandBar()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openCommandBar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openCommandBar])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<MyTasks />} />
          <Route path="/project/:name" element={<ProjectPage />} />
          <Route path="/handoffs" element={<HandoffsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <AddTaskModal />
      <AddProjectModal />
      <CommandBar />
    </BrowserRouter>
  )
}

export default App
