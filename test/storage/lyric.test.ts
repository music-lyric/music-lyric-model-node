import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  SCHEMA_VERSION,
  decodeStorageLyric,
  encodeStorageLyric,
  getStorageLineText,
  getStorageLineTime,
  makeAgentItem,
  makeStorageLine,
  makeStorageLyric,
  makeWordNormal,
  resolveAgents,
  storageLyricFromJson,
  storageLyricToJson,
} from '@root/index'

/**
 * Build a Lyric with two lines referencing agents by id.
 */
const buildLyric = () =>
  makeStorageLyric({
    agents: [makeAgentItem({ id: 'a1', names: ['Alice'] }), makeAgentItem({ id: 'a2', names: ['Bob'] })],
    lines: [
      makeStorageLine({
        time: { start: 1000, end: 2000 },
        agents: ['a1', 'a2'],
        words: [makeWordNormal({ content: 'hello' })],
      }),
      makeStorageLine({
        time: { start: 2000, end: 3000 },
        agents: ['a1'],
        words: [makeWordNormal({ content: 'world' })],
      }),
    ],
  })

test('makeStorageLyric stamps the schema version', () => {
  assert.equal(makeStorageLyric().version, SCHEMA_VERSION)
  assert.equal(makeStorageLyric({ version: '0.0.1' }).version, SCHEMA_VERSION)
})

test('line time, plain text and multi-agent resolution', () => {
  const lyric = buildLyric()
  const first = lyric.lines[0]
  assert.equal(getStorageLineTime(first)?.start, 1000)
  assert.equal(getStorageLineText(first), 'hello')
  assert.deepEqual(
    resolveAgents(lyric.agents, first.agents).map((agent) => agent.id),
    ['a1', 'a2'],
  )
})

test('binary and json round-trip preserve content', () => {
  const lyric = buildLyric()
  const fromBinary = decodeStorageLyric(encodeStorageLyric(lyric))
  assert.equal(getStorageLineText(fromBinary.lines[0]), 'hello')
  const fromJson = storageLyricFromJson(storageLyricToJson(lyric))
  assert.equal(getStorageLineText(fromJson.lines[1]), 'world')
})
