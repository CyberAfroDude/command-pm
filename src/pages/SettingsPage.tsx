import { BackButton } from '../components/shared/BackButton'

export function SettingsPage() {
  return (
    <div style={{ padding: '20px', background: 'var(--bg)', minHeight: '100%' }}>
      <BackButton />
      <div style={{ color: 'var(--text)', fontSize: '20px', fontWeight: 500 }}>Settings</div>
    </div>
  )
}
