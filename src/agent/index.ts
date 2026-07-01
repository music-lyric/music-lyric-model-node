import type { MessageInitShape } from '@bufbuild/protobuf'
import type { AgentItem, AgentType, Info, Line, LineAgent } from '@root/proto'

import { AgentItemSchema, LineAgentSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'
import { isLineNormal } from '@root/line'

/**
 * Occurrence index of a line's performing agent, computed from the current line order.
 */
export interface AgentLineIndex {
  /**
   * Occurrence of this agent among all lines, 0-based.
   */
  globalIndex: number

  /**
   * Occurrence within the current run of consecutive same-agent lines, 0-based.
   */
  blockIndex: number
}

/**
 * Creates an AgentItem.
 */
export const makeAgentItem = (init?: MessageInitShape<typeof AgentItemSchema>): AgentItem => {
  return create(AgentItemSchema, init)
}

/**
 * Creates a LineAgent, a line's reference to an agent.
 */
export const makeLineAgent = (init?: MessageInitShape<typeof LineAgentSchema>): LineAgent => {
  return create(LineAgentSchema, init)
}

/**
 * Agent with the given id.
 */
export const getAgentById = (agents: AgentItem[], id: string): AgentItem | undefined => {
  return agents.find((item) => item.id === id)
}

/**
 * Agent performing a line, resolved from its reference.
 */
export const resolveLineAgent = (line: Line, agents: AgentItem[]): AgentItem | undefined => {
  if (!isLineNormal(line)) {
    return undefined
  }
  const ref = line.body.value.content?.agent
  return ref ? getAgentById(agents, ref.id) : undefined
}

/**
 * Number of lines each agent performs, keyed by agent id.
 */
export const getAgentLineCounts = (lines: Line[]): Map<string, number> => {
  const result = new Map<string, number>()
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i]
    if (!isLineNormal(line)) {
      continue
    }
    const agent = line.body.value.content?.agent
    if (!agent) {
      continue
    }
    result.set(agent.id, (result.get(agent.id) ?? 0) + 1)
  }
  return result
}

/**
 * Number of lines the given agent performs.
 */
export const getAgentLineCount = (lines: Line[], id: string): number => {
  return getAgentLineCounts(lines).get(id) ?? 0
}

/**
 * Global and block occurrence index of each line's agent, keyed by the line.
 */
export const getAgentLineIndexes = (lines: Line[]): Map<Line, AgentLineIndex> => {
  const result = new Map<Line, AgentLineIndex>()
  const globals = new Map<string, number>()

  let prevId: string | null = null
  let blockIndex = 0

  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i]
    if (!isLineNormal(line)) {
      continue
    }
    const agent = line.body.value.content?.agent
    if (!agent) {
      continue
    }

    const id = agent.id

    const globalIndex = globals.get(id) ?? 0
    globals.set(id, globalIndex + 1)

    if (id !== prevId) {
      blockIndex = 0
      prevId = id
    }

    result.set(line, { globalIndex, blockIndex: blockIndex++ })
  }

  return result
}

/**
 * Agent performing the most lines.
 */
export const getPrimaryAgent = (info: Info): AgentItem | undefined => {
  const counts = getAgentLineCounts(info.lines)

  let result: AgentItem | undefined
  let max = -1
  for (let i = 0, len = info.agents.length; i < len; i++) {
    const agent = info.agents[i]
    const count = counts.get(agent.id) ?? 0
    if (count > max) {
      max = count
      result = agent
    }
  }
  return result
}

/**
 * All agents of a type.
 */
export const getAgentsByType = (agents: AgentItem[], type: AgentType): AgentItem[] => {
  return agents.filter((item) => item.type === type)
}

/**
 * Whether any agent of a type exists.
 */
export const hasAgent = (agents: AgentItem[], type: AgentType): boolean => {
  return agents.some((item) => item.type === type)
}
