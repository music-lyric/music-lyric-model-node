import type { MessageInitShape } from '@bufbuild/protobuf'
import type { LineAnnotation, LineAnnotationRoman, LineAnnotationTranslation } from '@root/common/proto'

import {
  LineAnnotationRomanSchema,
  LineAnnotationSchema,
  LineAnnotationTranslationSchema,
} from '@root/common/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates a LineAnnotationRoman.
 */
export const makeLineAnnotationRoman = (
  init?: MessageInitShape<typeof LineAnnotationRomanSchema>,
): LineAnnotationRoman => {
  return create(LineAnnotationRomanSchema, init)
}

/**
 * Creates a LineAnnotationTranslation.
 */
export const makeLineAnnotationTranslation = (
  init?: MessageInitShape<typeof LineAnnotationTranslationSchema>,
): LineAnnotationTranslation => {
  return create(LineAnnotationTranslationSchema, init)
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
export const getFirstAnnotation = <T extends { language?: string }>(
  items: T[],
  language?: string,
): T | undefined => {
  if (language !== undefined) {
    const matched = items.find((item) => item.language === language)
    if (matched) {
      return matched
    }
  }
  return items[0]
}
