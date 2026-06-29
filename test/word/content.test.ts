import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getWordRuby, getWordText, getWordTime, isWordNormal, isWordSpace, makeWordNormal, makeWordSpace, makeWordAnnotation, makeWordAnnotationContent, makeWordAnnotationRuby } from '@root/word'

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
