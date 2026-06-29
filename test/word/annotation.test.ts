import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getWordAnnotationText, makeWordAnnotationContent, makeWordAnnotationRoman, makeWordAnnotationRuby } from '@root/word'

test('getWordAnnotationText joins ruby tokens', () => {
  const ruby = makeWordAnnotationRuby({ words: [makeWordAnnotationContent({ content: 'か' }), makeWordAnnotationContent({ content: 'ん' })] })
  assert.equal(getWordAnnotationText(ruby), 'かん')
})

test('getWordAnnotationText joins roman tokens', () => {
  const roman = makeWordAnnotationRoman({ words: [makeWordAnnotationContent({ content: 'ni' }), makeWordAnnotationContent({ content: 'hao' })] })
  assert.equal(getWordAnnotationText(roman), 'nihao')
})
