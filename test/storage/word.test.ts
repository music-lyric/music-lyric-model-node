import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Storage } from '@root/index'

test('asWordNormal and asWordSpace unwrap the matching variant', () => {
  const normal = Storage.makeWordNormal({ content: 'hi' })
  const space = Storage.makeWordSpace({ count: 2 })
  assert.equal(Storage.asWordNormal(normal)?.content, 'hi')
  assert.equal(Storage.asWordNormal(space), undefined)
  assert.equal(Storage.asWordSpace(space)?.count, 2)
  assert.equal(Storage.asWordSpace(normal), undefined)
})

test('getWordTime and getWordDuration accept a Word or a bare WordNormal', () => {
  const word = Storage.makeWordNormal({ content: 'hi', time: { start: 1000, end: 1500 } })
  const normal = Storage.asWordNormal(word)!
  assert.equal(Storage.getWordTime(word)?.start, 1000)
  assert.equal(Storage.getWordTime(normal)?.start, 1000)
  assert.equal(Storage.getWordDuration(word), 500)
  assert.equal(Storage.getWordDuration(normal), 500)
})

test('getWordTime is undefined and getWordDuration zero for a space', () => {
  const space = Storage.makeWordSpace({ count: 1 })
  assert.equal(Storage.getWordTime(space), undefined)
  assert.equal(Storage.getWordDuration(space), 0)
})
