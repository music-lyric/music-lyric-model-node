import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Runtime } from '@root/index'

test('asWordNormal and asWordSpace unwrap the matching variant', () => {
  const normal = Runtime.makeWordNormal({ content: 'hi' })
  const space = Runtime.makeWordSpace({ count: 2 })
  assert.equal(Runtime.asWordNormal(normal)?.content, 'hi')
  assert.equal(Runtime.asWordNormal(space), undefined)
  assert.equal(Runtime.asWordSpace(space)?.count, 2)
  assert.equal(Runtime.asWordSpace(normal), undefined)
})

test('getWordTime and getWordDuration accept a Word or a bare WordNormal', () => {
  const word = Runtime.makeWordNormal({ content: 'hi', time: { start: 1000, end: 1500 } })
  const normal = Runtime.asWordNormal(word)!
  assert.equal(Runtime.getWordTime(word)?.start, 1000)
  assert.equal(Runtime.getWordTime(normal)?.start, 1000)
  assert.equal(Runtime.getWordDuration(word), 500)
  assert.equal(Runtime.getWordDuration(normal), 500)
})

test('getWordTime is undefined and getWordDuration zero for a space', () => {
  const space = Runtime.makeWordSpace({ count: 1 })
  assert.equal(Runtime.getWordTime(space), undefined)
  assert.equal(Runtime.getWordDuration(space), 0)
})
