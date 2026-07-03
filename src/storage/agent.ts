import type { MessageInitShape } from '@bufbuild/protobuf'
import type { AgentType } from '@root/common/proto'
import type { AgentItem, Line, Lyric } from '@root/storage/proto'

import { AgentItemSchema } from '@root/storage/proto'

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
 * Agents performing a line, resolved from its id references.
 */
export const resolveLineAgents = (line: Line, agents: AgentItem[]): AgentItem[] => {
  const ids = line.content?.agents ?? []
  const result: AgentItem[] = []
  for (const id of ids) {
    const agent = getAgentById(agents, id)
    if (agent) {
      result.push(agent)
    }
  }
  return result
}

/**
 * Number of lines each agent performs, keyed by agent id.
 */
export const getAgentLineCounts = (lines: Line[]): Map<string, number> => {
  const result = new Map<string, number>()
  for (let i = 0, len = lines.length; i < len; i++) {
    const agents = lines[i].content?.agents
    if (!agents) {
      continue
    }
    for (const id of agents) {
      result.set(id, (result.get(id) ?? 0) + 1)
    }
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
 * Agent performing the most lines.
 */
export const getPrimaryAgent = (lyric: Lyric): AgentItem | undefined => {
  const counts = getAgentLineCounts(lyric.lines)

  let result: AgentItem | undefined
  let max = -1
  for (let i = 0, len = lyric.agents.length; i < len; i++) {
    const agent = lyric.agents[i]
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
