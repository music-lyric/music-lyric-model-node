import assert from 'node:assert/strict'
import { test } from 'node:test'

import { AgentType } from '@root/proto'
import { getAgentById, getLineAgent, makeAgentItem, makeLineAgent, getPrimaryAgent } from '@root/agent'
import { makeLineInterlude, makeLineNormal } from '@root/line'

const agents = [
  makeAgentItem({ id: 'a1', type: AgentType.PERSON, count: 3, names: ['Alice'] }),
  makeAgentItem({ id: 'a2', type: AgentType.GROUP, count: 5, names: ['Chorus'] }),
]

test('getAgentById finds the agent', () => {
  assert.equal(getAgentById(agents, 'a2')?.names[0], 'Chorus')
  assert.equal(getAgentById(agents, 'none'), undefined)
})

test('getLineAgent resolves a line reference', () => {
  const line = makeLineNormal({ agent: makeLineAgent({ id: 'a2' }) })
  assert.equal(getLineAgent(line, agents)?.id, 'a2')
  assert.equal(getLineAgent(makeLineNormal({}), agents), undefined)
  assert.equal(getLineAgent(makeLineInterlude({}), agents), undefined)
})

test('getPrimaryAgent picks the most lines', () => {
  assert.equal(getPrimaryAgent(agents)?.id, 'a2')
  assert.equal(getPrimaryAgent([]), undefined)
})
