import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Word, WordAnnotation, WordAnnotationContent, WordAnnotationRoman, WordAnnotationRuby, WordAnnotationUnknown } from '@root/proto'

import {
  WordNormalSchema,
  WordSchema,
  WordSpaceSchema,
  WordAnnotationContentSchema,
  WordAnnotationRomanSchema,
  WordAnnotationRubySchema,
  WordAnnotationSchema,
  WordAnnotationUnknownSchema,
} from '@root/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates a normal word wrapped in a Word.
 */
export const makeWordNormal = (init?: MessageInitShape<typeof WordNormalSchema>): Word => {
  return create(WordSchema, { body: { case: 'normal', value: init ?? {} } })
}

/**
 * Creates a run of spaces wrapped in a Word.
 */
export const makeWordSpace = (init?: MessageInitShape<typeof WordSpaceSchema>): Word => {
  return create(WordSchema, { body: { case: 'space', value: init ?? {} } })
}

/**
 * Creates a WordAnnotationContent, one token of a word annotation.
 */
export const makeWordAnnotationContent = (init?: MessageInitShape<typeof WordAnnotationContentSchema>): WordAnnotationContent => {
  return create(WordAnnotationContentSchema, init)
}

/**
 * Creates a WordAnnotationRoman.
 */
export const makeWordAnnotationRoman = (init?: MessageInitShape<typeof WordAnnotationRomanSchema>): WordAnnotationRoman => {
  return create(WordAnnotationRomanSchema, init)
}

/**
 * Creates a WordAnnotationRuby.
 */
export const makeWordAnnotationRuby = (init?: MessageInitShape<typeof WordAnnotationRubySchema>): WordAnnotationRuby => {
  return create(WordAnnotationRubySchema, init)
}

/**
 * Creates a WordAnnotationUnknown.
 */
export const makeWordAnnotationUnknown = (init?: MessageInitShape<typeof WordAnnotationUnknownSchema>): WordAnnotationUnknown => {
  return create(WordAnnotationUnknownSchema, init)
}

/**
 * Creates a WordAnnotation, the per-word annotation container.
 */
export const makeWordAnnotation = (init?: MessageInitShape<typeof WordAnnotationSchema>): WordAnnotation => {
  return create(WordAnnotationSchema, init)
}
