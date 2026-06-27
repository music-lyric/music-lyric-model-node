import type { MessageInitShape } from '@bufbuild/protobuf'
import type { AgentItem, LineAgent } from '@root/proto'

import { AgentItemSchema, LineAgentSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'

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
