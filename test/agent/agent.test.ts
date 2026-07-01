import assert from 'node:assert/strict'
import { test } from 'node:test'

import { AgentType } from '@root/proto'
import { getAgentById, getAgentLineCounts, getAgentsByType, getPrimaryAgent, hasAgent, makeAgentItem, makeLineAgent, resolveLineAgent } from '@root/agent'
import { makeInfo } from '@root/info'
import { makeLineInterlude, makeLineNormal } from '@root/line'

const agents = [
  makeAgentItem({ id: 'a1', type: AgentType.PERSON, names: ['Alice'] }),
  makeAgentItem({ id: 'a2', type: AgentType.GROUP, names: ['Chorus'] }),
]

test('getAgentById finds the agent', () => {
  assert.equal(getAgentById(agents, 'a2')?.names[0], 'Chorus')
  assert.equal(getAgentById(agents, 'none'), undefined)
})

test('resolveLineAgent resolves a line reference', () => {
  const line = makeLineNormal({ content: { agent: makeLineAgent({ id: 'a2' }) } })
  assert.equal(resolveLineAgent(line, agents)?.id, 'a2')
  assert.equal(resolveLineAgent(makeLineNormal({}), agents), undefined)
  assert.equal(resolveLineAgent(makeLineInterlude(), agents), undefined)
})

test('getAgentLineCounts counts lines per agent', () => {
  const lines = [
    makeLineNormal({ content: { agent: makeLineAgent({ id: 'a2' }) } }),
    makeLineNormal({ content: { agent: makeLineAgent({ id: 'a2' }) } }),
    makeLineNormal({ content: { agent: makeLineAgent({ id: 'a1' }) } }),
  ]
  const counts = getAgentLineCounts(lines)
  assert.equal(counts.get('a2'), 2)
  assert.equal(counts.get('a1'), 1)
})

test('getPrimaryAgent picks the most lines', () => {
  const info = makeInfo({
    agents,
    lines: [
      makeLineNormal({ content: { agent: makeLineAgent({ id: 'a2' }) } }),
      makeLineNormal({ content: { agent: makeLineAgent({ id: 'a2' }) } }),
      makeLineNormal({ content: { agent: makeLineAgent({ id: 'a1' }) } }),
    ],
  })
  assert.equal(getPrimaryAgent(info)?.id, 'a2')
  assert.equal(getPrimaryAgent(makeInfo()), undefined)
})

test('hasAgent and getAgentsByType filter by type', () => {
  assert.equal(hasAgent(agents, AgentType.GROUP), true)
  assert.equal(hasAgent(agents, AgentType.OTHER), false)
  assert.equal(getAgentsByType(agents, AgentType.PERSON).length, 1)
  assert.equal(getAgentsByType(agents, AgentType.PERSON)[0].id, 'a1')
})
