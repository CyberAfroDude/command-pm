import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { HandoffsPage } from './pages/HandoffsPage'
import { MyTasks } from './pages/MyTasks'
import { ProjectPage } from './pages/ProjectPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<MyTasks />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/handoffs" element={<HandoffsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
