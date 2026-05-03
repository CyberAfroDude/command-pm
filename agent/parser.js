function findTaskByTitle(tasks, taskTitle) {
  const needle = String(taskTitle || '').trim().toLowerCase()
  if (!needle) return null
  return (
    tasks.find((t) => String(t.title || '').toLowerCase() === needle) ||
    tasks.find((t) => String(t.title || '').toLowerCase().includes(needle)) ||
    null
  )
}

export async function executeActions(actions, supabase) {
  const results = []

  if (!Array.isArray(actions)) {
    return results
  }

  for (const action of actions) {
    const type = action?.type
    console.log('[Command-PM]', type, action)

    try {
      switch (type) {
        case 'create_task': {
          const task = await supabase.createTask({
            projectName: action.projectName,
            title: action.title,
            priority: action.priority,
            bucket: action.bucket,
            source: 'agent',
            sourceNote: action.sourceNote ?? null,
            assignedTo: action.assignedTo ?? 'Spence',
          })
          await supabase.createActivityLog({
            projectName: action.projectName,
            entry: `Task created: ${action.title}`,
            source: 'agent',
          })
          results.push({ type, success: true, data: { task } })
          break
        }

        case 'complete_task': {
          const tasks = await supabase.getTasksByProject(action.projectName)
          const match = findTaskByTitle(tasks, action.taskTitle)
          if (!match) {
            throw new Error(`No open task matching "${action.taskTitle}" in ${action.projectName}`)
          }
          const updated = await supabase.updateTaskStatus(match.id, 'complete')
          results.push({ type, success: true, data: { task: updated } })
          break
        }

        case 'update_project': {
          const project = await supabase.updateProjectStatus(action.projectName, action.updates || {})
          await supabase.createActivityLog({
            projectName: action.projectName,
            entry: `Project updated: ${JSON.stringify(action.updates || {})}`,
            source: 'agent',
          })
          results.push({ type, success: true, data: { project } })
          break
        }

        case 'create_handoff': {
          const handoff = await supabase.createHandoff({
            projectName: action.projectName,
            title: action.title,
            toPerson: action.toPerson,
            notes: action.notes ?? null,
          })
          await supabase.createActivityLog({
            projectName: action.projectName,
            entry: `Handoff created: ${action.title} → ${action.toPerson}`,
            source: 'agent',
          })
          results.push({ type, success: true, data: { handoff } })
          break
        }

        case 'log_activity': {
          const log = await supabase.createActivityLog({
            projectName: action.projectName,
            entry: action.entry,
            source: 'agent',
          })
          results.push({ type, success: true, data: { log } })
          break
        }

        case 'status_check': {
          const pn = String(action.projectName || '').toLowerCase()
          if (pn === 'all') {
            const tasks = await supabase.getOpenTasksAllProjects()
            results.push({
              type,
              success: true,
              tasks,
              projectName: 'All projects',
            })
          } else {
            const tasks = await supabase.getTasksByProject(action.projectName)
            results.push({
              type,
              success: true,
              tasks,
              projectName: action.projectName,
            })
          }
          break
        }

        case 'none': {
          results.push({ type, success: true, data: null })
          break
        }

        default: {
          results.push({ type: type || 'unknown', success: false, error: `Unknown action type: ${type}` })
        }
      }
    } catch (err) {
      console.error('[Command-PM] action error:', type, err)
      results.push({ type: type || 'unknown', success: false, error: err.message || String(err) })
    }
  }

  return results
}
