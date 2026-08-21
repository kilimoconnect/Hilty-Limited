import OpenAI from 'openai'
import { ADVISOR_JSON_SCHEMA, validateModelOutput } from './schema'
import { buildSystemPrompt } from './systemPrompt'
import { TOOL_DEFINITIONS } from './tools'
import { AiError, type AdvisorRequest, type AiProvider, type ProviderResult, type ToolExecutor } from './types'

type RespItem = { type: string; name?: string; arguments?: string; call_id?: string }
type Resp = {
  id: string
  output?: RespItem[]
  output_text?: string
  usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number }
}
// The SDK's param types are intentionally bypassed here (Responses API shape is stable at runtime).
type CreateFn = (params: Record<string, unknown>, opts?: { signal?: AbortSignal }) => Promise<Resp>

const MAX_TOOL_ITERATIONS = 6

export class OpenAiProvider implements AiProvider {
  readonly name = 'openai' as const
  readonly model: string
  private client: OpenAI

  constructor(model: string, apiKey = process.env.OPENAI_API_KEY) {
    if (!apiKey) throw new AiError('outage', 'OPENAI_API_KEY is not configured')
    this.model = model
    this.client = new OpenAI({ apiKey })
  }

  async generate(req: AdvisorRequest, executor: ToolExecutor, signal: AbortSignal, repairHint?: string): Promise<ProviderResult> {
    const create = this.client.responses.create.bind(this.client.responses) as unknown as CreateFn
    const tools = TOOL_DEFINITIONS.map((t) => ({ type: 'function', name: t.name, description: t.description, parameters: t.parameters, strict: true }))
    const text = { format: { type: 'json_schema', name: 'advisor_response', schema: ADVISOR_JSON_SCHEMA, strict: true } }

    const input: Record<string, unknown>[] = [
      { role: 'system', content: buildSystemPrompt(req.locale) },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ]
    if (repairHint) input.push({ role: 'system', content: repairHint })

    let resp = await create({ model: this.model, input, tools, text }, { signal })
    let usage = resp.usage

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const calls = (resp.output ?? []).filter((o) => o.type === 'function_call')
      if (calls.length === 0) break
      const outputs = []
      for (const call of calls) {
        let args: Record<string, unknown> = {}
        try {
          args = JSON.parse(call.arguments || '{}')
        } catch {
          args = {}
        }
        const result = await executor({ name: call.name || '', arguments: args })
        outputs.push({ type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(result) })
      }
      resp = await create({ model: this.model, previous_response_id: resp.id, input: outputs, tools, text }, { signal })
      usage = resp.usage ?? usage
    }

    const parsed = safeParse(resp.output_text)
    const validated = validateModelOutput(parsed)
    if (!validated.ok) {
      throw new AiError('invalid_schema', `invalid structured output: ${validated.errors.join(',')}`)
    }
    return {
      response: { ...validated.value, provider_used: 'openai' },
      usage: { inputTokens: usage?.input_tokens, outputTokens: usage?.output_tokens, totalTokens: usage?.total_tokens },
    }
  }
}

function safeParse(text?: string): unknown {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
