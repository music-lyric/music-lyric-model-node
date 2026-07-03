import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Runtime, SCHEMA_VERSION } from '@root/index'

/**
 * Build an Info with two agent-tagged lines and a trailing interlude.
 */
const buildInfo = () =>
  Runtime.makeInfo({
    agents: [Runtime.makeAgentItem({ id: 'a1' }), Runtime.makeAgentItem({ id: 'a2' })],
    lines: [
      Runtime.makeLineNormal({ content: { agent: Runtime.makeLineAgent({ id: 'a1' }), words: [Runtime.makeWordNormal({ content: 'hello' })] } }, { start: 1000, end: 2000 }),
      Runtime.makeLineNormal({ content: { agent: Runtime.makeLineAgent({ id: 'a1' }), words: [Runtime.makeWordNormal({ content: 'world' })] } }, { start: 2000, end: 3000 }),
      Runtime.makeLineInterlude({ start: 3000, end: 4000 }),
    ],
  })

test('makeInfo stamps the schema version', () => {
  assert.equal(Runtime.makeInfo().version, SCHEMA_VERSION)
  assert.equal(Runtime.makeInfo({ version: '0.0.1' }).version, SCHEMA_VERSION)
})

test('line guards and plain text read the body', () => {
  const info = buildInfo()
  assert.equal(Runtime.isLineNormal(info.lines[0]), true)
  assert.equal(Runtime.isLineInterlude(info.lines[2]), true)
  assert.equal(Runtime.getLineText(info.lines[0]), 'hello')
})

test('agent line counts and primary agent', () => {
  const info = buildInfo()
  assert.equal(Runtime.getAgentLineCounts(info.lines).get('a1'), 2)
  assert.equal(Runtime.getPrimaryAgent(info)?.id, 'a1')
})

test('sortLinesByTime orders ascending', () => {
  const info = buildInfo()
  info.lines.reverse()
  Runtime.sortLinesByTime(info)
  assert.equal(Runtime.getLineTime(info.lines[0])?.start, 1000)
})

test('binary and json round-trip preserve content', () => {
  const info = buildInfo()
  const fromBinary = Runtime.decodeInfo(Runtime.encodeInfo(info))
  assert.equal(Runtime.getLineText(fromBinary.lines[0]), 'hello')
  const fromJson = Runtime.infoFromJson(Runtime.infoToJson(info))
  assert.equal(Runtime.getLineText(fromJson.lines[1]), 'world')
})
