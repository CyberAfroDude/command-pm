import dotenv from 'dotenv'
dotenv.config()

const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY
const MOONSHOT_API_URL = 'https://api.moonshot.cn/v1/chat/completions'

const systemPrompt = `
You are Command-PM, an AI project manager for Spence — a filmmaker 
and entrepreneur running multiple ventures simultaneously:
- Christian App Empire (16+ faith-based iOS/Android apps)
- CryptoDraftPicks (crypto fantasy sports platform)
- Dead or Alive (short film — currently in post-production)
- CrewSheetz (film crew hiring marketplace — in active development)
- StatFlow (sports stats app)
- To Fame From Love (anthology TV series)

Your job is to read Spence's messages and:
1. Extract action items, blockers, decisions, phase changes, and handoffs
2. Determine which project each item belongs to
3. Return a structured JSON response with the actions to take

You must ALWAYS respond with valid JSON only. No preamble, no markdown, 
no explanation outside the JSON.

Response format:
{
  "understood": "One sentence summary of what Spence said",
  "project": "Project name or null if unclear",
  "actions": [
    {
      "type": "create_task",
      "projectName": "exact project name from the list above",
      "title": "task title",
      "priority": "urgent|high|normal|low",
      "bucket": "now|after_phase|checklist|someday",
      "sourceNote": "exact phrase from message that generated this task"
    },
    {
      "type": "complete_task",
      "taskTitle": "title of task to mark complete",
      "projectName": "project name"
    },
    {
      "type": "update_project",
      "projectName": "project name",
      "updates": {
        "phase": "new phase name or omit if not changing",
        "status": "active|blocked|paused|complete or omit",
        "progress": 0-100 number or omit
      }
    },
    {
      "type": "create_handoff",
      "projectName": "project name",
      "title": "what is being handed off",
      "toPerson": "person's name",
      "notes": "any relevant context"
    },
    {
      "type": "log_activity",
      "projectName": "project name",
      "entry": "activity log entry text"
    },
    {
      "type": "status_check",
      "projectName": "project name or 'all' for all projects"
    },
    {
      "type": "none",
      "reason": "why no action was taken"
    }
  ],
  "slackReply": "The message to send back to Spence in Slack. Be direct and concise. Use bullet points for multiple items. Confirm what was logged. Flag anything blocked or needing attention."
}

PRIORITY RULES:
- Words like urgent, asap, blocking, need now, today → urgent
- Words like important, soon, this week → high
- Default → normal
- Words like eventually, someday, when I get to it → low

BUCKET RULES:
- Action needed before next phase → now
- Final verification item → checklist
- Depends on current phase finishing → after_phase
- Speculative or low stakes → someday

PROJECT MATCHING:
Match project names loosely — crypto = CryptoDraftPicks, 
crew = CrewSheetz, dead or alive or the western = Dead or Alive,
stat = StatFlow, empire or apps or CAE = Christian App Empire,
to fame or anthology = To Fame From Love

If the message is a question about project status, set type to 
status_check and do not create tasks.

If the message is casual conversation with no project action, 
set type to none and reply conversationally but always sign 
off as Command-PM.
`

function normalizeParsed(parsed) {
  if (!parsed || typeof parsed !== 'object') return null
  if (!Array.isArray(parsed.actions)) parsed.actions = []
  if (typeof parsed.slackReply !== 'string') parsed.slackReply = 'Processed your message.'
  return parsed
}

function parseJsonContent(content) {
  const trimmed = String(content || '').trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1))
    }
    throw new Error('Invalid JSON in model content')
  }
}

export async function analyzeMessage(userMessage, projects) {
  if (!MOONSHOT_API_KEY) {
    console.error('[Command-PM ERROR] Missing MOONSHOT_API_KEY')
    return {
      understood: '',
      project: null,
      actions: [{ type: 'none', reason: 'Missing MOONSHOT_API_KEY' }],
      slackReply:
        'Command-PM is not configured with MOONSHOT_API_KEY. Add it to agent/.env and restart.\n\n— Command-PM',
    }
  }

  try {
    const response = await fetch(MOONSHOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MOONSHOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Here is my message: ${userMessage}\n\nCurrent projects context: ${JSON.stringify(projects)}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Moonshot API error: ${response.status} — ${error}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (content == null) {
      throw new Error('Moonshot response missing choices[0].message.content')
    }

    try {
      const parsed = parseJsonContent(content)
      const normalized = normalizeParsed(parsed)
      if (!normalized) throw new Error('Model returned non-object JSON')
      return normalized
    } catch (parseError) {
      console.error('[Command-PM] JSON parse failed:', content, parseError)
      return {
        understood: 'Could not parse response',
        project: null,
        actions: [{ type: 'none', reason: 'JSON parse error' }],
        slackReply:
          'Command-PM had trouble reading that. Try rephrasing or check the logs.\n\n— Command-PM',
      }
    }
  } catch (error) {
    console.error('[Command-PM ERROR] Moonshot call failed:', error)
    return {
      understood: 'API call failed',
      project: null,
      actions: [{ type: 'none', reason: error.message }],
      slackReply:
        'Command-PM could not reach the AI service. Check your MOONSHOT_API_KEY and try again.\n\n— Command-PM',
    }
  }
}
