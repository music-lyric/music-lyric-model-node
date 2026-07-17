import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getTimeDuration, getTimeProgress, isTimeActive, makeTime } from '@root/index'

test('getTimeDuration returns end minus start', () => {
  assert.equal(getTimeDuration(makeTime({ start: 100, end: 250 })), 150)
  assert.equal(getTimeDuration(), 0)
})

test('getTimeProgress clamps to 0..1', () => {
  const time = makeTime({ start: 100, end: 200 })
  assert.equal(getTimeProgress(time, 50), 0)
  assert.equal(getTimeProgress(time, 150), 0.5)
  assert.equal(getTimeProgress(time, 250), 1)
})

test('isTimeActive checks the half-open range', () => {
  const time = makeTime({ start: 100, end: 200 })
  assert.equal(isTimeActive(time, 100), true)
  assert.equal(isTimeActive(time, 200), false)
  assert.equal(isTimeActive(undefined, 150), false)
})
