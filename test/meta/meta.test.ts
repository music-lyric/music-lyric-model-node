import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getAllMeta, getFirstMeta, getMetaValue, hasMeta, makeMetaItem, getMetaByKey } from '@root/meta'

const metas = [
  makeMetaItem({ key: 'ti', content: { case: 'title', value: 'Song' } }),
  makeMetaItem({ key: 'ar', content: { case: 'singer', value: 'Alice' } }),
  makeMetaItem({ key: 'ar', content: { case: 'singer', value: 'Bob' } }),
  makeMetaItem({ key: 'offset', content: { case: 'offset', value: 120 } }),
]

test('hasMeta checks presence by case', () => {
  assert.equal(hasMeta(metas, 'title'), true)
  assert.equal(hasMeta(metas, 'album'), false)
})

test('getFirstMeta and getMetaValue read the typed value', () => {
  assert.equal(getMetaValue(getFirstMeta(metas, 'title')!), 'Song')
  assert.equal(getMetaValue(getFirstMeta(metas, 'offset')!), 120)
  assert.equal(getFirstMeta(metas, 'album'), undefined)
})

test('getAllMeta returns every entry of a case', () => {
  assert.equal(getAllMeta(metas, 'singer').length, 2)
})

test('getMetaByKey groups by original key', () => {
  assert.equal(getMetaByKey(metas, 'ar').length, 2)
})
