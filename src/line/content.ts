import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Line, LineAnnotation, LineBackground, LineInterlude, LineNormal, Time, Word } from '@root/proto'

import { LineBackgroundSchema, LineInterludeSchema, LineNormalSchema, LineSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'
import { getTimeDuration } from '@root/common/time'
import { getWordText } from '@root/word'

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
 * Whether a Line holds a normal line.
 */
export const isLineNormal = (line: Line): line is Line & { body: { case: 'normal'; value: LineNormal } } => {
  return line.body.case === 'normal'
}

/**
 * Whether a Line holds an interlude.
 */
export const isLineInterlude = (line: Line): line is Line & { body: { case: 'interlude'; value: LineInterlude } } => {
  return line.body.case === 'interlude'
}

/**
 * Time range of a line.
 */
export const getLineTime = (line: Line): Time | undefined => {
  return line.body.value?.time
}

/**
 * Duration of a line in milliseconds.
 */
export const getLineDuration = (line: Line): number => {
  return getTimeDuration(getLineTime(line))
}

/**
 * Words of a line, empty for an interlude.
 */
export const getLineWords = (line: Line): Word[] => {
  return isLineNormal(line) ? line.body.value.words : []
}

/**
 * Text joined from a list of words.
 */
export const getWordsText = (words: Word[]): string => {
  let result = ''
  for (let i = 0, len = words.length; i < len; i++) {
    result += getWordText(words[i])
  }
  return result
}

/**
 * Plain text of a line.
 */
export const getLineText = (line: Line): string => {
  return getWordsText(getLineWords(line))
}

/**
 * Distinct language tags among a list of words.
 */
export const getWordsLanguages = (words: Word[]): string[] => {
  const result = new Set<string>()
  for (let i = 0, len = words.length; i < len; i++) {
    const word = words[i]
    if (word.body.case === 'normal' && word.body.value.language) {
      result.add(word.body.value.language)
    }
  }
  return [...result]
}

/**
 * Languages of a line: the explicit tags, otherwise those of its words.
 */
export const getLineLanguages = (line: Line): string[] => {
  if (!isLineNormal(line)) {
    return []
  }
  const normal = line.body.value
  if (normal.languages.length) {
    return normal.languages
  }
  return getWordsLanguages(normal.words)
}

/**
 * Annotation of a line, absent on an interlude.
 */
export const getLineAnnotation = (line: Line): LineAnnotation | undefined => {
  return isLineNormal(line) ? line.body.value.annotation : undefined
}
