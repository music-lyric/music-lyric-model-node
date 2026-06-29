import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Line, LineAnnotation, LineAnnotationRoman, LineAnnotationTranslate, LineAnnotationUnknown } from '@root/proto'

import { LineAnnotationRomanSchema, LineAnnotationSchema, LineAnnotationTranslateSchema, LineAnnotationUnknownSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'
import { getLineAnnotation } from '@root/line/content'

/**
 * Creates a LineAnnotationUnknown.
 */
export const makeLineAnnotationUnknown = (init?: MessageInitShape<typeof LineAnnotationUnknownSchema>): LineAnnotationUnknown => {
  return create(LineAnnotationUnknownSchema, init)
}

/**
 * Creates a LineAnnotationRoman.
 */
export const makeLineAnnotationRoman = (init?: MessageInitShape<typeof LineAnnotationRomanSchema>): LineAnnotationRoman => {
  return create(LineAnnotationRomanSchema, init)
}

/**
 * Creates a LineAnnotationTranslate.
 */
export const makeLineAnnotationTranslate = (init?: MessageInitShape<typeof LineAnnotationTranslateSchema>): LineAnnotationTranslate => {
  return create(LineAnnotationTranslateSchema, init)
}

/**
 * Creates a LineAnnotation, the per-line annotation container.
 */
export const makeLineAnnotation = (init?: MessageInitShape<typeof LineAnnotationSchema>): LineAnnotation => {
  return create(LineAnnotationSchema, init)
}

/**
 * First annotation item, preferring a language match.
 */
export const getFirstAnnotation = <T extends { language?: string }>(items: T[], language?: string): T | undefined => {
  if (language !== undefined) {
    const matched = items.find(item => item.language === language)
    if (matched) {
      return matched
    }
  }
  return items[0]
}

/**
 * Translated text of a line, preferring a language match.
 */
export const getLineTranslate = (line: Line, language?: string): string | undefined => {
  const annotation = getLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.translates, language)?.content : undefined
}

/**
 * Romanized text of a line, preferring a language match.
 */
export const getLineRoman = (line: Line, language?: string): string | undefined => {
  const annotation = getLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.romans, language)?.content : undefined
}
