import { GoogleGenAI } from '@google/genai'
import { geminiResponseSchema, validateModelOutput } from './schema'
import { buildSystemPrompt } from './systemPrompt'
import { TOOL_DEFINITIONS } from './tools'
import { AiError, type AdvisorRequest, type AiProvider, type ProviderResult, type ToolExecutor } from './types'

type GenResp = {
  text?: string
  functionCalls?: { name?: string; args?: Record<string, unknown> }[]
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
}
type GenerateFn = (params: Record<string, unknown>) => Promise<GenResp>

const MAX_TOOL_ITERATIONS = 6

export class GeminiProvider implements AiProvider {
  readonly name = 'gemini' as const
  readonly model: string
  private ai: GoogleGenAI

  constructor(model: string, apiKey = process.env.GEMINI_API_KEY) {
    if (!apiKey) throw new AiError('outage', 'GEMINI_API_KEY is not configured')
    this.model = model
    this.ai = new GoogleGenAI({ apiKey })
  }

  async generate(req: AdvisorRequest, executor: ToolExecutor, signal: AbortSignal, repairHint?: string): Promise<ProviderResult> {
    const generate = this.ai.models.generateContent.bind(this.ai.models) as unknown as GenerateFn
    const functionDeclarations = TOOL_DEFINITIONS.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters }))
    const config: Record<string, unknown> = {
      systemInstruction: buildSystemPrompt(req.locale) + (repairHint ? `\n${repairHint}` : ''),
      tools: [{ functionDeclarations }],
      responseMimeType: 'application/json',
      responseSchema: geminiResponseSchema(),
      abortSignal: signal,
    }

    const contents: Record<string, unknown>[] = req.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    let resp = await generate({ model: this.model, contents, config })
    let usage = resp.usageMetadata

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const calls = resp.functionCalls ?? []
      if (calls.length === 0) break
      contents.push({ role: 'model', parts: calls.map((c) => ({ functionCall: { name: c.name, args: c.args ?? {} } })) })
      const responseParts = []
      for (const call of calls) {
        const result = await executor({ name: call.name || '', arguments: call.args ?? {} })
        responseParts.push({ functionResponse: { name: call.name, response: result } })
      }
      contents.push({ role: 'user', parts: responseParts })
      resp = await generate({ model: this.model, contents, config })
      usage = resp.usageMetadata ?? usage
    }

    let parsed: unknown = null
    try {
      parsed = resp.text ? JSON.parse(resp.text) : null
    } catch {
      parsed = null
    }
    const validated = validateModelOutput(parsed)
    if (!validated.ok) throw new AiError('invalid_schema', `invalid structured output: ${validated.errors.join(',')}`)

    return {
      response: { ...validated.value, provider_used: 'gemini' },
      usage: { inputTokens: usage?.promptTokenCount, outputTokens: usage?.candidatesTokenCount, totalTokens: usage?.totalTokenCount },
    }
  }
}
