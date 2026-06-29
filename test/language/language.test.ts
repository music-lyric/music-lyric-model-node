import assert from 'node:assert/strict'
import { test } from 'node:test'

import { hasLanguage, getLanguageByTag, makeLanguageItem, getPrimaryLanguage } from '@root/language'

const languages = [makeLanguageItem({ tag: 'en', percent: 70 }), makeLanguageItem({ tag: 'ja', percent: 30 })]

test('hasLanguage checks presence by tag', () => {
  assert.equal(hasLanguage(languages, 'ja'), true)
  assert.equal(hasLanguage(languages, 'ko'), false)
})

test('getLanguageByTag finds the entry', () => {
  assert.equal(getLanguageByTag(languages, 'en')?.percent, 70)
  assert.equal(getLanguageByTag(languages, 'ko'), undefined)
})

test('getPrimaryLanguage picks the highest share', () => {
  assert.equal(getPrimaryLanguage(languages)?.tag, 'en')
  assert.equal(getPrimaryLanguage([]), undefined)
})
