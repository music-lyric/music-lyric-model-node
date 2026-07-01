import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  getActiveWord,
  getActiveWordIndex,
  getWordDuration,
  getWordRuby,
  getWordText,
  getWordTime,
  isWordNormal,
  isWordSpace,
  makeWordNormal,
  makeWordSpace,
  makeWordAnnotation,
  makeWordAnnotationContent,
  makeWordAnnotationRuby,
} from '@root/word'

test('guards narrow the word body', () => {
  const normal = makeWordNormal({ content: 'hi' })
  const space = makeWordSpace({ count: 2 })
  assert.equal(isWordNormal(normal), true)
  assert.equal(isWordSpace(space), true)
  assert.equal(isWordNormal(space), false)
})

test('getWordText reads content or padded spaces', () => {
  assert.equal(getWordText(makeWordNormal({ content: 'hi' })), 'hi')
  assert.equal(getWordText(makeWordSpace({ count: 3 })), '   ')
})

test('getWordTime is present only on a normal word', () => {
  assert.equal(getWordTime(makeWordNormal({ time: { start: 10, end: 20 } }))?.end, 20)
  assert.equal(getWordTime(makeWordSpace({ count: 1 })), undefined)
})

test('getWordRuby reads the ruby annotation', () => {
  const ruby = makeWordAnnotationRuby({ words: [makeWordAnnotationContent({ content: 'かん' })] })
  const word = makeWordNormal({ content: '漢', annotation: makeWordAnnotation({ ruby }) })
  assert.equal(getWordRuby(word)?.words[0].content, 'かん')
  assert.equal(getWordRuby(makeWordNormal({ content: 'a' })), undefined)
})

test('getWordDuration reads the word time span', () => {
  assert.equal(getWordDuration(makeWordNormal({ time: { start: 10, end: 30 } })), 20)
  assert.equal(getWordDuration(makeWordSpace({ count: 1 })), 0)
})

test('getActiveWord finds the word at a moment', () => {
  const words = [makeWordNormal({ content: 'a', time: { start: 0, end: 100 } }), makeWordNormal({ content: 'b', time: { start: 100, end: 200 } })]
  assert.equal(getActiveWordIndex(words, 150), 1)
  const active = getActiveWord(words, 50)
  assert.equal(active && getWordText(active), 'a')
  assert.equal(getActiveWordIndex(words, 500), -1)
  assert.equal(getActiveWord(words, 500), undefined)
})
