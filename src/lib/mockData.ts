export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low'
export type TaskSource = 'AGENT' | 'CURSOR' | 'SLACK'

export interface MockTask {
  id: string
  title: string
  priority: TaskPriority
  bucket: string
  due: string
  overdue?: boolean
  source: TaskSource
}

export const PROJECT_TASKS: Record<string, MockTask[]> = {
  StatFlow: [
    { id: 'sf-1', title: 'Prepare App Store launch checklist', priority: 'urgent', bucket: 'NOW', due: 'Apr 28', overdue: true, source: 'AGENT' },
    { id: 'sf-2', title: 'Enable push notifications for v1.1', priority: 'high', bucket: 'CHECKLIST', due: '—', source: 'CURSOR' },
    { id: 'sf-3', title: 'Set up AdMob mediation', priority: 'normal', bucket: 'CHECKLIST', due: '—', source: 'CURSOR' },
    { id: 'sf-4', title: 'Verify app-ads.txt is live', priority: 'normal', bucket: 'CHECKLIST', due: '—', source: 'AGENT' },
    { id: 'sf-5', title: 'Write launch announcement for Beehiiv', priority: 'low', bucket: 'SOMEDAY', due: '—', source: 'SLACK' },
  ],
  CryptoDraftPicks: [
    { id: 'cdp-1', title: 'Decide: Solana config for token launch', priority: 'urgent', bucket: 'NOW', due: 'Today', overdue: true, source: 'AGENT' },
    { id: 'cdp-2', title: 'Finalize rake percentage model', priority: 'high', bucket: 'NOW', due: '—', source: 'SLACK' },
    { id: 'cdp-3', title: 'Review Bunny agent system prompt v2', priority: 'normal', bucket: 'AFTER PHASE', due: '—', source: 'CURSOR' },
  ],
  'Dead or Alive': [
    { id: 'doa-1', title: 'Send audio direction notes to Fred Brown II', priority: 'urgent', bucket: 'NOW', due: 'Today', overdue: true, source: 'AGENT' },
    { id: 'doa-2', title: 'Review Wayne Yu color grade pass', priority: 'high', bucket: 'NOW', due: '—', source: 'SLACK' },
    { id: 'doa-3', title: 'Confirm Eric Fernandez edit timeline', priority: 'normal', bucket: 'CHECKLIST', due: '—', source: 'AGENT' },
    { id: 'doa-4', title: 'Update Roger Margulies on post schedule', priority: 'normal', bucket: 'CHECKLIST', due: '—', source: 'SLACK' },
  ],
}
