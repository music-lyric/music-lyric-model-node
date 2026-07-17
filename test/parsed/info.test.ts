import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  SCHEMA_VERSION,
  asParsedLineNormal,
  decodeParsedInfo,
  encodeParsedInfo,
  getAgentLineCounts,
  getParsedLineText,
  getParsedLineTime,
  getPrimaryAgent,
  isParsedLineInterlude,
  isParsedLineNormal,
  makeAgentItem,
  makeParsedInfo,
  makeParsedLineInterlude,
  makeParsedLineNormal,
  makeWordNormal,
  parsedInfoFromJson,
  parsedInfoToJson,
  sortParsedLinesByTime,
} from '@root/index'

/**
 * Build an Info with two timed lines and a trailing interlude.
 */
const buildInfo = () =>
  makeParsedInfo({
    agents: [makeAgentItem({ id: 'a1' }), makeAgentItem({ id: 'a2' })],
    lines: [
      makeParsedLineNormal({
        time: { start: 1000, end: 2000 },
        agents: ['a1'],
        words: [makeWordNormal({ content: 'hello' })],
      }),
      makeParsedLineNormal({
        time: { start: 2000, end: 3000 },
        agents: ['a1'],
        words: [makeWordNormal({ content: 'world' })],
      }),
      makeParsedLineInterlude({ time: { start: 3000, end: 4000 } }),
    ],
  })

/**
 * Normal bodies from an info, skipping interludes.
 */
const normalLinesOf = (info: ReturnType<typeof buildInfo>) => {
  return info.lines.flatMap((line) => {
    const normal = asParsedLineNormal(line)
    return normal ? [normal] : []
  })
}

test('makeParsedInfo stamps the schema version', () => {
  assert.equal(makeParsedInfo().version, SCHEMA_VERSION)
  assert.equal(makeParsedInfo({ version: '0.0.1' }).version, SCHEMA_VERSION)
})

test('line guards and plain text read the body', () => {
  const info = buildInfo()
  assert.equal(isParsedLineNormal(info.lines[0]), true)
  assert.equal(isParsedLineInterlude(info.lines[2]), true)
  assert.equal(getParsedLineText(info.lines[0]), 'hello')
})

test('agent line counts and primary agent over normal bodies', () => {
  const info = buildInfo()
  const normals = normalLinesOf(info)
  assert.equal(getAgentLineCounts(normals).get('a1'), 2)
  assert.equal(getPrimaryAgent(info.agents, normals)?.id, 'a1')
})

test('sortParsedLinesByTime orders ascending', () => {
  const info = buildInfo()
  info.lines.reverse()
  sortParsedLinesByTime(info)
  assert.equal(getParsedLineTime(info.lines[0])?.start, 1000)
})

test('binary and json round-trip preserve content', () => {
  const info = buildInfo()
  const fromBinary = decodeParsedInfo(encodeParsedInfo(info))
  assert.equal(getParsedLineText(fromBinary.lines[0]), 'hello')
  const fromJson = parsedInfoFromJson(parsedInfoToJson(info))
  assert.equal(getParsedLineText(fromJson.lines[1]), 'world')
})
