import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  getLineAnnotation,
  getLineDuration,
  getLineLanguages,
  getLineText,
  getLineTime,
  getLineWords,
  getWordsLanguages,
  getWordsText,
  isLineInterlude,
  isLineNormal,
  makeLineAnnotation,
  makeLineInterlude,
  makeLineNormal,
} from '@root/line'
import { makeWordNormal, makeWordSpace } from '@root/word'

const normal = makeLineNormal({
  time: { start: 1000, end: 2000 },
  languages: [],
  words: [makeWordNormal({ content: 'hello', language: 'en' }), makeWordSpace({ count: 1 }), makeWordNormal({ content: '漢', language: 'ja' })],
  annotation: makeLineAnnotation(),
})
const interlude = makeLineInterlude({ time: { start: 2000, end: 3000 } })

test('guards narrow the line body', () => {
  assert.equal(isLineNormal(normal), true)
  assert.equal(isLineInterlude(interlude), true)
  assert.equal(isLineNormal(interlude), false)
})

test('getLineTime and getLineDuration read across the oneof', () => {
  assert.equal(getLineTime(normal)?.start, 1000)
  assert.equal(getLineTime(interlude)?.end, 3000)
  assert.equal(getLineDuration(normal), 1000)
})

test('getLineWords is empty for an interlude', () => {
  assert.equal(getLineWords(normal).length, 3)
  assert.equal(getLineWords(interlude).length, 0)
})

test('getLineText and getWordsText render the words', () => {
  assert.equal(getLineText(normal), 'hello 漢')
  assert.equal(getLineText(interlude), '')
  assert.equal(getWordsText(getLineWords(normal)), 'hello 漢')
})

test('languages fall back to those of the words', () => {
  assert.deepEqual(getLineLanguages(normal), ['en', 'ja'])
  assert.deepEqual(getWordsLanguages(getLineWords(normal)), ['en', 'ja'])
  assert.deepEqual(getLineLanguages(interlude), [])
})

test('getLineAnnotation is absent on an interlude', () => {
  assert.ok(getLineAnnotation(normal))
  assert.equal(getLineAnnotation(interlude), undefined)
})
