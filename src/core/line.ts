import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Line, LineBackground, LineAnnotation, LineAnnotationRoman, LineAnnotationTranslate, LineAnnotationUnknown } from '@root/proto'

import {
  LineBackgroundSchema,
  LineInterludeSchema,
  LineNormalSchema,
  LineSchema,
  LineAnnotationRomanSchema,
  LineAnnotationSchema,
  LineAnnotationTranslateSchema,
  LineAnnotationUnknownSchema,
} from '@root/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates a normal line wrapped in a Line.
 */
export const makeLineNormal = (init?: MessageInitShape<typeof LineNormalSchema>): Line => {
  return create(LineSchema, { body: { case: 'normal', value: init ?? {} } })
}

/**
 * Creates a LineBackground, a background line attached to a normal line.
 */
export const makeLineBackground = (init?: MessageInitShape<typeof LineBackgroundSchema>): LineBackground => {
  return create(LineBackgroundSchema, init)
}

/**
 * Creates an interlude wrapped in a Line.
 */
export const makeLineInterlude = (init?: MessageInitShape<typeof LineInterludeSchema>): Line => {
  return create(LineSchema, { body: { case: 'interlude', value: init ?? {} } })
}

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
