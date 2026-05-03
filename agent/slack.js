const priorityEmoji = {
  urgent: '🔴',
  high: '🟡',
  normal: '🔵',
  low: '⚪',
}

function bucketTag(bucket) {
  if (!bucket) return ''
  return ` · _${bucket}_`
}

export function formatStatusReply(tasks, projectName) {
  const label = projectName || 'Project'
  const header = `*Command-PM — ${label} Status*`

  if (!tasks || tasks.length === 0) {
    return `${header}\n✅ No open tasks for ${label}`
  }

  const lines = tasks.map((t) => {
    const p = String(t.priority || 'normal').toLowerCase()
    const emoji = priorityEmoji[p] || priorityEmoji.normal
    return `${emoji} ${t.title}${bucketTag(t.bucket)}`
  })

  return `${header}\n${lines.join('\n')}`
}

export function formatDailyDigest(allTasks, projects) {
  const now = new Date()
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const projectByName = new Map((projects || []).map((p) => [p.name, p]))

  const urgentOrHighByProject = new Map()
  for (const t of allTasks || []) {
    const pr = String(t.priority || '').toLowerCase()
    if (pr !== 'urgent' && pr !== 'high') continue
    const name = t.projectName || 'Unknown'
    if (!urgentOrHighByProject.has(name)) urgentOrHighByProject.set(name, [])
    urgentOrHighByProject.get(name).push(t)
  }

  let body = `*CLAW PM — Daily Digest 🌅*\n*${dayStr}*\n`

  if (urgentOrHighByProject.size === 0) {
    body += '\n_No urgent or high-priority open tasks across projects._\n'
  } else {
    for (const [projName, tasks] of urgentOrHighByProject) {
      const proj = projectByName.get(projName)
      const status = proj?.status ? ` — ${proj.status}` : ''
      body += `\n*${projName}*${status}\n`
      const top = tasks.slice(0, 3)
      for (const t of top) {
        const pr = String(t.priority || 'normal').toLowerCase()
        const emoji = priorityEmoji[pr] || priorityEmoji.normal
        body += `${emoji} ${t.title}${bucketTag(t.bucket)}\n`
      }
    }
  }

  body += '\n_View your dashboard to see everything in one place._'
  return body
}
