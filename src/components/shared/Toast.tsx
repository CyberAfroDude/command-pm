import './Toast.css'

interface ToastProps {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: ToastProps) {
  return (
    <div className={`shared-toast${visible ? ' is-visible' : ''}`}>
      <span className="shared-toast-dot" />
      <span className="shared-toast-text">{message}</span>
    </div>
  )
}
