import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { TaskModalProvider } from './context/TaskModalContext.tsx'
import { ProjectModalProvider } from './context/ProjectModalContext.tsx'
import { CommandBarProvider } from './context/CommandBarContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ProjectModalProvider>
        <TaskModalProvider>
          <CommandBarProvider>
            <App />
          </CommandBarProvider>
        </TaskModalProvider>
      </ProjectModalProvider>
    </ThemeProvider>
  </StrictMode>,
)
