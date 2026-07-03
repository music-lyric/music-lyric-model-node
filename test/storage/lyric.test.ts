import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Storage, SCHEMA_VERSION } from '@root/index'

/**
 * Build a Lyric with two lines referencing agents by id.
 */
const buildLyric = () =>
  Storage.makeLyric({
    agents: [Storage.makeAgentItem({ id: 'a1', names: ['Alice'] }), Storage.makeAgentItem({ id: 'a2', names: ['Bob'] })],
    lines: [
      Storage.makeLine({ content: { time: { start: 1000, end: 2000 }, agents: ['a1', 'a2'], words: [Storage.makeWordNormal({ content: 'hello' })] } }),
      Storage.makeLine({ content: { time: { start: 2000, end: 3000 }, agents: ['a1'], words: [Storage.makeWordNormal({ content: 'world' })] } }),
    ],
  })

test('makeLyric stamps the schema version', () => {
  assert.equal(Storage.makeLyric().version, SCHEMA_VERSION)
  assert.equal(Storage.makeLyric({ version: '0.0.1' }).version, SCHEMA_VERSION)
})

test('line time, plain text and multi-agent resolution', () => {
  const lyric = buildLyric()
  const first = lyric.lines[0]
  assert.equal(Storage.getLineTime(first)?.start, 1000)
  assert.equal(Storage.getLineText(first), 'hello')
  assert.deepEqual(
    Storage.resolveLineAgents(first, lyric.agents).map((agent) => agent.id),
    ['a1', 'a2'],
  )
})

test('agent line counts over string references', () => {
  const lyric = buildLyric()
  const counts = Storage.getAgentLineCounts(lyric.lines)
  assert.equal(counts.get('a1'), 2)
  assert.equal(counts.get('a2'), 1)
  assert.equal(Storage.getPrimaryAgent(lyric)?.id, 'a1')
})

test('binary and json round-trip preserve content', () => {
  const lyric = buildLyric()
  const fromBinary = Storage.decodeLyric(Storage.encodeLyric(lyric))
  assert.equal(Storage.getLineText(fromBinary.lines[0]), 'hello')
  const fromJson = Storage.lyricFromJson(Storage.lyricToJson(lyric))
  assert.equal(Storage.getLineText(fromJson.lines[1]), 'world')
})
