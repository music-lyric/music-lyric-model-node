import type { MessageInitShape } from '@bufbuild/protobuf'
import type { LineAnnotation, LineAnnotationRoman, LineAnnotationTranslation } from '@root/common/proto'

import {
  LineAnnotationRomanSchema,
  LineAnnotationSchema,
  LineAnnotationTranslationSchema,
} from '@root/common/proto'

import { create } from '@bufbuild/protobuf'
import { makeUnknown } from '@root/common/unknown'

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
 * Creates an Unknown entry for an unrecognized line annotation.
 */
export const makeLineAnnotationUnknown = makeUnknown

/**
 * Creates a LineAnnotation, the per-line annotation container.
 */
export const makeLineAnnotation = (init?: MessageInitShape<typeof LineAnnotationSchema>): LineAnnotation => {
  return create(LineAnnotationSchema, init)
}
