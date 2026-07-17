import type { MessageInitShape } from '@bufbuild/protobuf'
import type { AgentItem, AgentType } from '@root/common/proto'

import { AgentItemSchema } from '@root/common/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Anything that references performing agents by id.
 */
export type AgentRefs = {
  agents: readonly string[]
}

/**
 * Creates an AgentItem.
 */
export const makeAgentItem = (init?: MessageInitShape<typeof AgentItemSchema>): AgentItem => {
  return create(AgentItemSchema, init)
}

/**
 * Agent with the given id.
 */
export const getAgentById = (agents: readonly AgentItem[], id: string): AgentItem | undefined => {
  return agents.find((item) => item.id === id)
}

/**
 * Agents resolved from id references, in reference order.
 * Missing ids are skipped.
 */
export const resolveAgents = (agents: readonly AgentItem[], ids: readonly string[]): AgentItem[] => {
  const result: AgentItem[] = []
  for (let i = 0, len = ids.length; i < len; i++) {
    const item = getAgentById(agents, ids[i])
    if (item) {
      result.push(item)
    }
  }
  return result
}

/**
 * Agents resolved from a line's agent id references, in reference order.
 * Missing ids are skipped.
 */
export const resolveLineAgents = (agents: readonly AgentItem[], line: AgentRefs): AgentItem[] => {
  return resolveAgents(agents, line.agents)
}

/**
 * How many lines reference each agent id.
 * Each id is counted at most once per line.
 */
export const getAgentLineCounts = (lines: readonly AgentRefs[]): Map<string, number> => {
  const counts = new Map<string, number>()
  for (let i = 0, len = lines.length; i < len; i++) {
    const seen = new Set<string>()
    const ids = lines[i].agents
    for (let j = 0, jLen = ids.length; j < jLen; j++) {
      const id = ids[j]
      if (seen.has(id)) {
        continue
      }
      seen.add(id)
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }
  return counts
}

/**
 * Agent referenced by the most lines.
 * Ties keep the earlier entry in the agents list.
 * Returns undefined when no listed agent is referenced.
 */
export const getPrimaryAgent = (
  agents: readonly AgentItem[],
  lines: readonly AgentRefs[],
): AgentItem | undefined => {
  const counts = getAgentLineCounts(lines)
  let result: AgentItem | undefined
  let best = 0
  for (let i = 0, len = agents.length; i < len; i++) {
    const agent = agents[i]
    const count = counts.get(agent.id) ?? 0
    if (count > best) {
      best = count
      result = agent
    }
  }
  return result
}

/**
 * All agents of a type.
 */
export const getAgentsByType = (agents: readonly AgentItem[], type: AgentType): AgentItem[] => {
  return agents.filter((item) => item.type === type)
}

/**
 * Whether any agent of a type exists.
 */
export const hasAgent = (agents: readonly AgentItem[], type: AgentType): boolean => {
  return agents.some((item) => item.type === type)
}
