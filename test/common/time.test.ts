import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Common } from '@root/index'

test('getTimeDuration returns end minus start', () => {
  assert.equal(Common.getTimeDuration(Common.makeTime({ start: 100, end: 250 })), 150)
  assert.equal(Common.getTimeDuration(), 0)
})

test('getTimeProgress clamps to 0..1', () => {
  const time = Common.makeTime({ start: 100, end: 200 })
  assert.equal(Common.getTimeProgress(time, 50), 0)
  assert.equal(Common.getTimeProgress(time, 150), 0.5)
  assert.equal(Common.getTimeProgress(time, 250), 1)
})

test('isTimeActive checks the half-open range', () => {
  const time = Common.makeTime({ start: 100, end: 200 })
  assert.equal(Common.isTimeActive(time, 100), true)
  assert.equal(Common.isTimeActive(time, 200), false)
  assert.equal(Common.isTimeActive(undefined, 150), false)
})
