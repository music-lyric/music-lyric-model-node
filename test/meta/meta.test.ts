import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getMetaReference, getMetaText, getMetaUnknown, makeMeta, makeMetaCredit, makeMetaReference, makeMetaText, makeMetaUnknown } from '@root/meta'

const meta = makeMeta({
  titles: [makeMetaText({ value: 'Song' }), makeMetaText({ language: 'ja', value: '歌' })],
  artists: [makeMetaText({ value: 'Alice' }), makeMetaText({ value: 'Bob' })],
  offset: 120,
  duration: 200000,
  isrcs: ['US1234567890'],
  credits: [makeMetaCredit({ role: 'lyricist', names: [makeMetaText({ value: 'Carol' })] })],
  unknowns: [makeMetaUnknown({ key: 'x', value: 'foo' }), makeMetaUnknown({ key: 'x', value: 'bar' })],
  references: [makeMetaReference({ platform: 'apple', ids: ['1', '2'] })],
})

test('typed fields are read directly', () => {
  assert.equal(meta.titles.length, 2)
  assert.equal(meta.artists.length, 2)
  assert.equal(meta.offset, 120)
  assert.equal(meta.duration, 200000)
  assert.equal(meta.isrcs[0], 'US1234567890')
  assert.equal(meta.credits[0].names[0].value, 'Carol')
})

test('getMetaText prefers a language match then falls back', () => {
  assert.equal(getMetaText(meta.titles, 'ja'), '歌')
  assert.equal(getMetaText(meta.titles), 'Song')
  assert.equal(getMetaText(meta.titles, 'ko'), 'Song')
  assert.equal(getMetaText([]), undefined)
})

test('getMetaUnknown groups raw values by key', () => {
  assert.deepEqual(getMetaUnknown(meta.unknowns, 'x'), ['foo', 'bar'])
  assert.deepEqual(getMetaUnknown(meta.unknowns, 'none'), [])
})

test('getMetaReference reads ids for a platform', () => {
  assert.deepEqual(getMetaReference(meta.references, 'apple'), ['1', '2'])
  assert.deepEqual(getMetaReference(meta.references, 'spotify'), [])
})
