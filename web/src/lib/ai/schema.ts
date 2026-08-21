import type { AdvisorResponse } from './types'

export type ModelOutput = Omit<AdvisorResponse, 'provider_used'>

const LANGS = ['en', 'sw'] as const
const READINESS = ['not_ready', 'needs_consent', 'ready'] as const
const ACTIONS = ['ask_more', 'use_calculator', 'request_quote', 'book_visit', 'find_branch', 'whatsapp', 'human_handoff'] as const

/** Strict JSON schema for OpenAI Responses `text.format` (json_schema). provider_used is server-owned. */
export const ADVISOR_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    customer_message: { type: 'string' },
    language: { type: 'string', enum: [...LANGS] },
    detected_intent: { type: 'string' },
    project_summary: { type: 'string' },
    recommended_products: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: ['integer', 'null'] },
          name: { type: 'string' },
          why: { type: ['string', 'null'] },
        },
        required: ['id', 'name', 'why'],
      },
    },
    recommended_system_steps: { type: 'array', items: { type: 'string' } },
    missing_information: { type: 'array', items: { type: 'string' } },
    calculator_result_reference: { type: ['string', 'null'] },
    lead_readiness: { type: 'string', enum: [...READINESS] },
    suggested_next_action: { type: 'string', enum: [...ACTIONS] },
    needs_human: { type: 'boolean' },
    safety_or_uncertainty_note: { type: ['string', 'null'] },
  },
  required: [
    'customer_message',
    'language',
    'detected_intent',
    'project_summary',
    'recommended_products',
    'recommended_system_steps',
    'missing_information',
    'calculator_result_reference',
    'lead_readiness',
    'suggested_next_action',
    'needs_human',
    'safety_or_uncertainty_note',
  ],
} as const

/** Gemini responseSchema (its dialect uses nullable + no additionalProperties). */
export function geminiResponseSchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      customer_message: { type: 'string' },
      language: { type: 'string', enum: [...LANGS] },
      detected_intent: { type: 'string' },
      project_summary: { type: 'string' },
      recommended_products: {
        type: 'array',
        items: {
          type: 'object',
          properties: { id: { type: 'integer', nullable: true }, name: { type: 'string' }, why: { type: 'string', nullable: true } },
          required: ['name'],
        },
      },
      recommended_system_steps: { type: 'array', items: { type: 'string' } },
      missing_information: { type: 'array', items: { type: 'string' } },
      calculator_result_reference: { type: 'string', nullable: true },
      lead_readiness: { type: 'string', enum: [...READINESS] },
      suggested_next_action: { type: 'string', enum: [...ACTIONS] },
      needs_human: { type: 'boolean' },
      safety_or_uncertainty_note: { type: 'string', nullable: true },
    },
    required: [
      'customer_message', 'language', 'detected_intent', 'project_summary', 'recommended_products',
      'recommended_system_steps', 'missing_information', 'lead_readiness', 'suggested_next_action', 'needs_human',
    ],
  }
}

const isStr = (v: unknown): v is string => typeof v === 'string'
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr)

/** Runtime validation + coercion of a model output. Returns null-ish tolerant defaults are NOT applied — invalid => error. */
export function validateModelOutput(raw: unknown): { ok: true; value: ModelOutput } | { ok: false; errors: string[] } {
  const errors: string[] = []
  const o = (raw ?? {}) as Record<string, unknown>

  if (!isStr(o.customer_message) || o.customer_message.trim() === '') errors.push('customer_message')
  const language = o.language === 'sw' ? 'sw' : o.language === 'en' ? 'en' : null
  if (!language) errors.push('language')
  if (!isStr(o.detected_intent)) errors.push('detected_intent')
  if (!isStr(o.project_summary)) errors.push('project_summary')

  let recommended: ModelOutput['recommended_products'] = []
  if (!Array.isArray(o.recommended_products)) errors.push('recommended_products')
  else {
    recommended = o.recommended_products.map((p) => {
      const rp = (p ?? {}) as Record<string, unknown>
      return {
        id: typeof rp.id === 'number' ? rp.id : null,
        name: isStr(rp.name) ? rp.name : '',
        why: isStr(rp.why) ? rp.why : null,
      }
    })
    if (recommended.some((p) => p.name === '')) errors.push('recommended_products[].name')
  }

  if (!isStrArr(o.recommended_system_steps)) errors.push('recommended_system_steps')
  if (!isStrArr(o.missing_information)) errors.push('missing_information')
  if (!(o.calculator_result_reference == null || isStr(o.calculator_result_reference))) errors.push('calculator_result_reference')
  if (!READINESS.includes(o.lead_readiness as (typeof READINESS)[number])) errors.push('lead_readiness')
  if (!ACTIONS.includes(o.suggested_next_action as (typeof ACTIONS)[number])) errors.push('suggested_next_action')
  if (typeof o.needs_human !== 'boolean') errors.push('needs_human')
  if (!(o.safety_or_uncertainty_note == null || isStr(o.safety_or_uncertainty_note))) errors.push('safety_or_uncertainty_note')

  if (errors.length) return { ok: false, errors }
  return {
    ok: true,
    value: {
      customer_message: o.customer_message as string,
      language: language as 'en' | 'sw',
      detected_intent: o.detected_intent as string,
      project_summary: o.project_summary as string,
      recommended_products: recommended,
      recommended_system_steps: o.recommended_system_steps as string[],
      missing_information: o.missing_information as string[],
      calculator_result_reference: (o.calculator_result_reference as string) ?? null,
      lead_readiness: o.lead_readiness as ModelOutput['lead_readiness'],
      suggested_next_action: o.suggested_next_action as ModelOutput['suggested_next_action'],
      needs_human: o.needs_human as boolean,
      safety_or_uncertainty_note: (o.safety_or_uncertainty_note as string) ?? null,
    },
  }
}
