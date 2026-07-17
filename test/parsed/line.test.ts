import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  asParsedLineInterlude,
  asParsedLineNormal,
  makeParsedLineInterlude,
  makeParsedLineNormal,
  makeWordNormal,
} from '@root/index'

test('asParsedLineNormal and asParsedLineInterlude unwrap the matching variant', () => {
  const normal = makeParsedLineNormal({ words: [makeWordNormal({ content: 'hi' })] })
  const interlude = makeParsedLineInterlude()
  assert.equal(asParsedLineNormal(normal)?.words.length, 1)
  assert.equal(asParsedLineNormal(interlude), undefined)
  assert.ok(asParsedLineInterlude(interlude))
  assert.equal(asParsedLineInterlude(normal), undefined)
})
