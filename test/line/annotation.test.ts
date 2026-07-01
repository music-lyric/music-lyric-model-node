import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  deriveLineAnnotation,
  deriveLineRomans,
  deriveLineTranslates,
  deriveLineUnknowns,
  getFirstAnnotation,
  getLineRoman,
  getLineTranslate,
  makeLineAnnotation,
  makeLineAnnotationRoman,
  makeLineAnnotationTranslate,
  makeLineNormal,
} from '@root/line'
import { makeWordAnnotation, makeWordAnnotationContent, makeWordAnnotationRoman, makeWordAnnotationTranslate, makeWordAnnotationUnknown, makeWordNormal, makeWordSpace } from '@root/word'

const translates = [makeLineAnnotationTranslate({ content: '你好', language: 'zh-hans' }), makeLineAnnotationTranslate({ content: 'hi', language: 'en' })]
const line = makeLineNormal({
  content: {
    annotation: makeLineAnnotation({ translates, romans: [makeLineAnnotationRoman({ content: 'nihao' })] }),
  },
})

test('getFirstAnnotation prefers a language match then falls back', () => {
  assert.equal(getFirstAnnotation(translates, 'en')?.content, 'hi')
  assert.equal(getFirstAnnotation(translates)?.content, '你好')
  assert.equal(getFirstAnnotation(translates, 'ko')?.content, '你好')
  assert.equal(getFirstAnnotation([]), undefined)
})

test('getLineTranslate reads the translation', () => {
  assert.equal(getLineTranslate(line), '你好')
  assert.equal(getLineTranslate(line, 'en'), 'hi')
})

test('getLineRoman reads the romanization', () => {
  assert.equal(getLineRoman(line), 'nihao')
})

/**
 * Build a word carrying a single-token roman annotation.
 */
const romanWord = (content: string, roman: string, language?: string) =>
  makeWordNormal({
    content,
    annotation: makeWordAnnotation({ romans: [makeWordAnnotationRoman({ language, words: [makeWordAnnotationContent({ content: roman })] })] }),
  })

test('deriveLineRomans joins tokens in word order with padded spacing', () => {
  const words = [romanWord('今日', 'kyou', 'romaji'), makeWordSpace({ count: 1 }), romanWord('は', 'wa', 'romaji')]
  const romans = deriveLineRomans(words)
  assert.equal(romans.length, 1)
  assert.equal(romans[0].content, 'kyou wa')
  assert.equal(romans[0].language, 'romaji')
  assert.equal(romans[0].derived, true)
})

test('deriveLineRomans keeps one item per language in first-seen order', () => {
  const words = [romanWord('a', 'A', 'x'), romanWord('b', 'B', 'y')]
  const romans = deriveLineRomans(words)
  assert.deepEqual(romans.map(item => item.language), ['x', 'y'])
  assert.deepEqual(romans.map(item => item.content), ['A', 'B'])
})

test('deriveLineTranslates aggregates word translations', () => {
  const words = [makeWordNormal({ content: '猫', annotation: makeWordAnnotation({ translates: [makeWordAnnotationTranslate({ language: 'en', words: [makeWordAnnotationContent({ content: 'cat' })] })] }) })]
  const [item] = deriveLineTranslates(words)
  assert.equal(item.content, 'cat')
  assert.equal(item.language, 'en')
  assert.equal(item.derived, true)
})

test('deriveLineUnknowns groups by original key', () => {
  const words = [
    makeWordNormal({ content: 'x', annotation: makeWordAnnotation({ unknowns: [makeWordAnnotationUnknown({ key: 'note', words: [makeWordAnnotationContent({ content: 'a' })] })] }) }),
    makeWordNormal({ content: 'y', annotation: makeWordAnnotation({ unknowns: [makeWordAnnotationUnknown({ key: 'note', words: [makeWordAnnotationContent({ content: 'b' })] })] }) }),
  ]
  const unknowns = deriveLineUnknowns(words)
  assert.equal(unknowns.length, 1)
  assert.equal(unknowns[0].key, 'note')
  assert.equal(unknowns[0].content, 'ab')
  assert.equal(unknowns[0].derived, true)
})

test('deriveLineAnnotation fills every list', () => {
  const annotation = deriveLineAnnotation([romanWord('今日', 'kyou', 'romaji')])
  assert.equal(annotation.romans.length, 1)
  assert.equal(annotation.translates.length, 0)
  assert.equal(annotation.unknowns.length, 0)
})
