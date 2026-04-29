import { useNavigate } from 'react-router-dom'

export function BackButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      style={{
        border: 'none',
        background: 'transparent',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        color: 'var(--muted)',
        cursor: 'pointer',
        marginBottom: '12px',
        padding: 0,
      }}
      className="back-button"
    >
      ← Back
    </button>
  )
}
