import type { MessageInitShape } from '@bufbuild/protobuf'
import type { AgentItem, AgentType } from '@root/common/proto'

import { AgentItemSchema } from '@root/common/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates an AgentItem.
 */
export const makeAgentItem = (init?: MessageInitShape<typeof AgentItemSchema>): AgentItem => {
  return create(AgentItemSchema, init)
}

/**
 * Agent with the given id.
 */
export const getAgentById = (agents: AgentItem[], id: string): AgentItem | undefined => {
  return agents.find((item) => item.id === id)
}

/**
 * Agents resolved from id references, in reference order.
 * Missing ids are skipped.
 */
export const resolveAgents = (agents: AgentItem[], ids: string[]): AgentItem[] => {
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
