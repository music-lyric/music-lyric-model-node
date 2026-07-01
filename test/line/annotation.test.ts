import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getFirstAnnotation, getLineRoman, getLineTranslate, makeLineAnnotation, makeLineAnnotationRoman, makeLineAnnotationTranslate, makeLineNormal } from '@root/line'

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
