import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Runtime } from '@root/index'

test('asLineNormal and asLineInterlude unwrap the matching variant', () => {
  const normal = Runtime.makeLineNormal({ content: { words: [Runtime.makeWordNormal({ content: 'hi' })] } })
  const interlude = Runtime.makeLineInterlude()
  assert.equal(Runtime.asLineNormal(normal)?.content?.words.length, 1)
  assert.equal(Runtime.asLineNormal(interlude), undefined)
  assert.ok(Runtime.asLineInterlude(interlude))
  assert.equal(Runtime.asLineInterlude(normal), undefined)
})
