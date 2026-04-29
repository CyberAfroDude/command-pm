import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface CommandBarContextValue {
  isOpen: boolean
  openCommandBar: () => void
  closeCommandBar: () => void
}

const CommandBarContext = createContext<CommandBarContextValue | null>(null)

export function CommandBarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const value = useMemo(
    () => ({
      isOpen,
      openCommandBar: () => setIsOpen(true),
      closeCommandBar: () => setIsOpen(false),
    }),
    [isOpen],
  )
  return <CommandBarContext.Provider value={value}>{children}</CommandBarContext.Provider>
}

export function useCommandBar() {
  const context = useContext(CommandBarContext)
  if (!context) throw new Error('useCommandBar must be used within CommandBarProvider')
  return context
}
