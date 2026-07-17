import assert from 'node:assert/strict'
import { test } from 'node:test'

import { asWordNormal, asWordSpace, getWordDuration, getWordTime, makeWordNormal, makeWordSpace } from '@root/index'

test('asWordNormal and asWordSpace unwrap the matching variant', () => {
  const normal = makeWordNormal({ content: 'hi' })
  const space = makeWordSpace({ count: 2 })
  assert.equal(asWordNormal(normal)?.content, 'hi')
  assert.equal(asWordNormal(space), undefined)
  assert.equal(asWordSpace(space)?.count, 2)
  assert.equal(asWordSpace(normal), undefined)
})

test('getWordTime and getWordDuration accept a Word or a bare WordNormal', () => {
  const word = makeWordNormal({ content: 'hi', time: { start: 1000, end: 1500 } })
  const normal = asWordNormal(word)!
  assert.equal(getWordTime(word)?.start, 1000)
  assert.equal(getWordTime(normal)?.start, 1000)
  assert.equal(getWordDuration(word), 500)
  assert.equal(getWordDuration(normal), 500)
})

test('getWordTime is undefined and getWordDuration zero for a space', () => {
  const space = makeWordSpace({ count: 1 })
  assert.equal(getWordTime(space), undefined)
  assert.equal(getWordDuration(space), 0)
})
