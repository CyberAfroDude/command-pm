import dotenv from 'dotenv'
dotenv.config()

import { App, LogLevel } from '@slack/bolt'
import cron from 'node-cron'
import { analyzeMessage } from './claude.js'
import { executeActions } from './parser.js'
import * as supabase from './supabase.js'
import { formatStatusReply, formatDailyDigest } from './slack.js'

const requiredEnvVars = [
  'SLACK_BOT_TOKEN',
  'SLACK_APP_TOKEN',
  'SLACK_SIGNING_SECRET',
  'MOONSHOT_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SLACK_CHANNEL_ID',
]

const missingVars = requiredEnvVars.filter((v) => !process.env[v])
if (missingVars.length > 0) {
  console.error('[Command-PM ERROR] Missing environment variables:')
  missingVars.forEach((v) => console.error('  ✗ ' + v))
  console.error('Add these to your agent/.env file and restart.')
  process.exit(1)
}

console.log('[Command-PM] Environment variables loaded ✓')

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.WARN
})

app.message(async ({ message, say, client }) => {
  if (message.bot_id) return
  const text = typeof message.text === 'string' ? message.text.trim() : ''
  if (!text) return

  const channel = message.channel
  const ts = message.ts

  try {
    await client.reactions.add({ channel, timestamp: ts, name: 'eyes' })
  } catch (e) {
    console.warn('Could not add eyes reaction:', e.message)
  }

  try {
    const projects = await supabase.getProjects()
    const result = await analyzeMessage(text, projects)

    let execResults = []
    if (result.actions?.length) {
      execResults = await executeActions(result.actions, supabase)
    }

    let slackBody = result.slackReply || ''
    for (const r of execResults) {
      if (r.type === 'status_check' && r.success && Array.isArray(r.tasks)) {
        slackBody += `\n\n${formatStatusReply(r.tasks, r.projectName)}`
      }
    }

    const fullReply = `*Command-PM*\n${slackBody}\n\n_Dashboard updated in real time_`
    await say({ text: fullReply, mrkdwn: true, thread_ts: message.thread_ts })

    try {
      await client.reactions.remove({ channel, timestamp: ts, name: 'eyes' })
    } catch (_) {}
    try {
      await client.reactions.add({ channel, timestamp: ts, name: 'white_check_mark' })
    } catch (e) {
      console.warn('Could not add check reaction:', e.message)
    }
  } catch (err) {
    console.error('[Command-PM ERROR]', err)
    try {
      await client.reactions.remove({ channel, timestamp: ts, name: 'eyes' })
    } catch (_) {}
    try {
      await client.reactions.add({ channel, timestamp: ts, name: 'x' })
    } catch (e) {
      console.warn('Could not add x reaction:', e.message)
    }
    await say({
      text: '*Command-PM* hit an error processing that. Try again or check the logs.',
      mrkdwn: true,
      thread_ts: message.thread_ts,
    })
  }
})

cron.schedule('0 6 * * *', async () => {
  console.log('[Command-PM] Sending daily digest...')
  try {
    const allTasks = await supabase.getOpenTasksAllProjects()
    const projects = await supabase.getProjects()
    const digest = formatDailyDigest(allTasks, projects)
    await app.client.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      text: digest,
    })
  } catch (e) {
    console.error('[Command-PM ERROR] Daily digest failed:', e)
  }
})

;(async () => {
  await app.start()
  console.log('[Command-PM] Online and listening ⚡')
})()
