import assert from 'node:assert/strict'
import { test } from 'node:test'

import { SCHEMA_VERSION } from '@root/version'
import { calcAgentIndex, decodeInfo, encodeInfo, infoFromJson, infoToJson, makeInfo, sortLinesByTime } from '@root/info'
import { getLineText, getLineTime, isLineNormal, makeLineInterlude, makeLineNormal } from '@root/line'
import { makeWordNormal } from '@root/word'
import { getAgentById, makeAgentItem, makeLineAgent } from '@root/agent'

/**
 * Build an Info with two agent-tagged lines for index and round-trip checks.
 */
const buildInfo = () =>
  makeInfo({
    agents: [makeAgentItem({ id: 'a1' }), makeAgentItem({ id: 'a2' })],
    lines: [
      makeLineNormal({ time: { start: 1000, end: 2000 }, agent: makeLineAgent({ id: 'a1' }), words: [makeWordNormal({ content: 'hello' })] }),
      makeLineNormal({ time: { start: 2000, end: 3000 }, agent: makeLineAgent({ id: 'a1' }), words: [makeWordNormal({ content: 'world' })] }),
      makeLineInterlude({ time: { start: 3000, end: 4000 } }),
    ],
  })

test('makeInfo always stamps the schema version', () => {
  assert.equal(makeInfo().version, SCHEMA_VERSION)
  assert.equal(makeInfo({ version: '0.0.1' }).version, SCHEMA_VERSION)
})

test('calcAgentIndex fills index and count snapshots', () => {
  const info = buildInfo()
  calcAgentIndex(info)
  const [first, second] = info.lines
  assert.ok(isLineNormal(first) && isLineNormal(second))
  assert.equal(first.body.value.agent?.globalIndex, 0)
  assert.equal(second.body.value.agent?.globalIndex, 1)
  assert.equal(second.body.value.agent?.blockIndex, 1)
  assert.equal(getAgentById(info.agents, 'a1')?.count, 2)
  assert.equal(getAgentById(info.agents, 'a2')?.count, 0)
})

test('sortLinesByTime orders ascending', () => {
  const info = buildInfo()
  info.lines.reverse()
  sortLinesByTime(info)
  assert.equal(getLineTime(info.lines[0])?.start, 1000)
  assert.equal(getLineTime(info.lines[2])?.start, 3000)
})

test('binary round-trip preserves content', () => {
  const info = buildInfo()
  const back = decodeInfo(encodeInfo(info))
  assert.equal(getLineText(back.lines[0]), 'hello')
  assert.equal(back.version, info.version)
})

test('json round-trip preserves content', () => {
  const info = buildInfo()
  const back = infoFromJson(infoToJson(info))
  assert.equal(getLineText(back.lines[1]), 'world')
})
