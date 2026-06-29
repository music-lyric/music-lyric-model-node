import type { MessageInitShape } from '@bufbuild/protobuf'
import type { WordAnnotation, WordAnnotationContent, WordAnnotationRoman, WordAnnotationRuby, WordAnnotationUnknown } from '@root/proto'

import { WordAnnotationContentSchema, WordAnnotationRomanSchema, WordAnnotationRubySchema, WordAnnotationSchema, WordAnnotationUnknownSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'

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

/**
 * Text joined from every annotation token.
 */
export const getWordAnnotationText = (item: { words: WordAnnotationContent[] }): string => {
  let result = ''
  for (let i = 0, len = item.words.length; i < len; i++) {
    result += item.words[i].content
  }
  return result
}
