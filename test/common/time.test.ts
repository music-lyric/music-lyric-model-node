import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getTimeDuration, makeTime } from '@root/common/time'

test('makeTime sets start and end', () => {
  const time = makeTime({ start: 100, end: 250 })
  assert.equal(time.start, 100)
  assert.equal(time.end, 250)
})

test('getTimeDuration returns end minus start', () => {
  assert.equal(getTimeDuration(makeTime({ start: 100, end: 250 })), 150)
  assert.equal(getTimeDuration(), 0)
})
