import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  deriveParsedLineRomans,
  deriveParsedLineTranslations,
  getParsedFirstAnnotation,
  makeLineAnnotationTranslation,
  makeWordAnnotation,
  makeWordAnnotationContent,
  makeWordAnnotationRoman,
  makeWordAnnotationTranslation,
  makeWordNormal,
  makeWordSpace,
} from '@root/index'

/**
 * Build a normal word carrying a single-token roman annotation.
 */
const romanWord = (content: string, roman: string, language?: string) =>
  makeWordNormal({
    content,
    annotation: makeWordAnnotation({
      romans: [
        makeWordAnnotationRoman({
          language,
          words: [makeWordAnnotationContent({ content: roman })],
        }),
      ],
    }),
  })

/**
 * Build a normal word carrying a single translation.
 */
const translateWord = (content: string, translation: string, language?: string) =>
  makeWordNormal({
    content,
    annotation: makeWordAnnotation({
      translations: [makeWordAnnotationTranslation({ language, content: translation })],
    }),
  })

test('deriveParsedLineRomans joins tokens in word order with padded spacing', () => {
  const words = [romanWord('今日', 'kyou', 'romaji'), makeWordSpace({ count: 1 }), romanWord('は', 'wa', 'romaji')]
  const [item] = deriveParsedLineRomans(words)
  assert.equal(item.content, 'kyou wa')
  assert.equal(item.language, 'romaji')
})

test('deriveParsedLineTranslations aggregates word translations by language', () => {
  const words = [translateWord('猫', 'cat', 'en'), makeWordSpace({ count: 1 }), translateWord('好', 'good', 'en')]
  const [item] = deriveParsedLineTranslations(words)
  assert.equal(item.content, 'cat good')
  assert.equal(item.language, 'en')
})

test('getParsedFirstAnnotation prefers a language match then falls back', () => {
  const items = [
    makeLineAnnotationTranslation({ content: '你好', language: 'zh' }),
    makeLineAnnotationTranslation({ content: 'hi', language: 'en' }),
  ]
  assert.equal(getParsedFirstAnnotation(items, 'en')?.content, 'hi')
  assert.equal(getParsedFirstAnnotation(items)?.content, '你好')
  assert.equal(getParsedFirstAnnotation(items, 'ko')?.content, '你好')
})
