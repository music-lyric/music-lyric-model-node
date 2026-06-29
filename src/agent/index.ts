import type { MessageInitShape } from '@bufbuild/protobuf'
import type { AgentItem, Line, LineAgent } from '@root/proto'

import { AgentItemSchema, LineAgentSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'
import { isLineNormal } from '@root/line'

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
  return agents.find(item => item.id === id)
}

/**
 * Agent performing a line, resolved from its reference.
 */
export const getLineAgent = (line: Line, agents: AgentItem[]): AgentItem | undefined => {
  if (!isLineNormal(line)) {
    return undefined
  }
  const ref = line.body.value.agent
  return ref ? getAgentById(agents, ref.id) : undefined
}

/**
 * Agent performing the most lines.
 */
export const getPrimaryAgent = (agents: AgentItem[]): AgentItem | undefined => {
  let result: AgentItem | undefined
  for (let i = 0, len = agents.length; i < len; i++) {
    if (!result || agents[i].count > result.count) {
      result = agents[i]
    }
  }
  return result
}
