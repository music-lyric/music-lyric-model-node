import assert from 'node:assert/strict'
import { test } from 'node:test'

import { SCHEMA_VERSION } from '@root/version'
import { decodeInfo, encodeInfo, infoFromJson, infoToJson, makeInfo, sortLinesByTime } from '@root/info'
import { getAgentLineCounts, getAgentLineIndexes, makeAgentItem, makeLineAgent } from '@root/agent'
import { getLineText, getLineTime, makeLineInterlude, makeLineNormal } from '@root/line'
import { makeWordNormal } from '@root/word'

/**
 * Build an Info with two agent-tagged lines for index and round-trip checks.
 */
const buildInfo = () =>
  makeInfo({
    agents: [makeAgentItem({ id: 'a1' }), makeAgentItem({ id: 'a2' })],
    lines: [
      makeLineNormal({ content: { agent: makeLineAgent({ id: 'a1' }), words: [makeWordNormal({ content: 'hello' })] } }, { start: 1000, end: 2000 }),
      makeLineNormal({ content: { agent: makeLineAgent({ id: 'a1' }), words: [makeWordNormal({ content: 'world' })] } }, { start: 2000, end: 3000 }),
      makeLineInterlude({ start: 3000, end: 4000 }),
    ],
  })

test('makeInfo always stamps the schema version', () => {
  assert.equal(makeInfo().version, SCHEMA_VERSION)
  assert.equal(makeInfo({ version: '0.0.1' }).version, SCHEMA_VERSION)
})

test('agent line index and counts are computed on demand', () => {
  const info = buildInfo()
  const [first, second] = info.lines

  const indexes = getAgentLineIndexes(info.lines)
  assert.equal(indexes.get(first)?.globalIndex, 0)
  assert.equal(indexes.get(second)?.globalIndex, 1)
  assert.equal(indexes.get(second)?.blockIndex, 1)

  const counts = getAgentLineCounts(info.lines)
  assert.equal(counts.get('a1'), 2)
  assert.equal(counts.get('a2') ?? 0, 0)
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
