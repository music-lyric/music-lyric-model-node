import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getAgentById, getAgentLineCounts, getPrimaryAgent, makeAgentItem, resolveAgents, resolveLineAgents } from '@root/index'

/**
 * Build two agents and three lines with overlapping references.
 */
const sample = () => {
  const agents = [makeAgentItem({ id: 'a1', names: ['Alice'] }), makeAgentItem({ id: 'a2', names: ['Bob'] })]
  const lines = [{ agents: ['a1', 'a2'] }, { agents: ['a1'] }, { agents: ['a1', 'a1'] }]
  return { agents, lines }
}

test('getAgentById and resolveAgents preserve order and skip missing ids', () => {
  const { agents } = sample()
  assert.equal(getAgentById(agents, 'a2')?.names[0], 'Bob')
  assert.equal(getAgentById(agents, 'x'), undefined)
  assert.deepEqual(
    resolveAgents(agents, ['a2', 'missing', 'a1']).map((item) => item.id),
    ['a2', 'a1'],
  )
})

test('resolveLineAgents reads agent ids from the line', () => {
  const { agents, lines } = sample()
  assert.deepEqual(
    resolveLineAgents(agents, lines[0]).map((item) => item.id),
    ['a1', 'a2'],
  )
})

test('getAgentLineCounts counts each id once per line', () => {
  const { lines } = sample()
  const counts = getAgentLineCounts(lines)
  assert.equal(counts.get('a1'), 3)
  assert.equal(counts.get('a2'), 1)
})

test('getPrimaryAgent picks the agent on the most lines', () => {
  const { agents, lines } = sample()
  assert.equal(getPrimaryAgent(agents, lines)?.id, 'a1')
  assert.equal(getPrimaryAgent(agents, [{ agents: ['a2'] }, { agents: ['a2'] }])?.id, 'a2')
  assert.equal(getPrimaryAgent(agents, [{ agents: [] }]), undefined)
})
