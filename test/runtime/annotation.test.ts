import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Runtime } from '@root/index'

/**
 * Build a normal word carrying a single-token roman annotation.
 */
const romanWord = (content: string, roman: string, language?: string) =>
  Runtime.makeWordNormal({
    content,
    annotation: Runtime.makeWordAnnotation({ romans: [Runtime.makeWordAnnotationRoman({ language, words: [Runtime.makeWordAnnotationContent({ content: roman })] })] }),
  })

/**
 * Build a normal word carrying a single translation.
 */
const translateWord = (content: string, translate: string, language?: string) =>
  Runtime.makeWordNormal({
    content,
    annotation: Runtime.makeWordAnnotation({ translates: [Runtime.makeWordAnnotationTranslate({ language, content: translate })] }),
  })

test('deriveLineRomans joins tokens in word order with padded spacing', () => {
  const words = [romanWord('今日', 'kyou', 'romaji'), Runtime.makeWordSpace({ count: 1 }), romanWord('は', 'wa', 'romaji')]
  const [item] = Runtime.deriveLineRomans(words)
  assert.equal(item.content, 'kyou wa')
  assert.equal(item.language, 'romaji')
  assert.equal(item.derived, true)
})

test('deriveLineTranslates aggregates word translations by language', () => {
  const words = [translateWord('猫', 'cat', 'en'), Runtime.makeWordSpace({ count: 1 }), translateWord('好', 'good', 'en')]
  const [item] = Runtime.deriveLineTranslates(words)
  assert.equal(item.content, 'cat good')
  assert.equal(item.language, 'en')
  assert.equal(item.derived, true)
})

test('getFirstAnnotation prefers a language match then falls back', () => {
  const items = [Runtime.makeLineAnnotationTranslate({ content: '你好', language: 'zh' }), Runtime.makeLineAnnotationTranslate({ content: 'hi', language: 'en' })]
  assert.equal(Runtime.getFirstAnnotation(items, 'en')?.content, 'hi')
  assert.equal(Runtime.getFirstAnnotation(items)?.content, '你好')
  assert.equal(Runtime.getFirstAnnotation(items, 'ko')?.content, '你好')
})
