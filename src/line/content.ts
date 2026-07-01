import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Line, LineAnnotation, LineBackground, LineContent, LineInterlude, LineNormal, Time, Word } from '@root/proto'

import { LineBackgroundSchema, LineContentSchema, LineNormalSchema, LineSchema, TimeSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'
import { getTimeDuration } from '@root/common/time'
import { getWordText } from '@root/word'

/**
 * Creates a LineContent, the sung content shared by normal and background lines.
 */
export const makeLineContent = (init?: MessageInitShape<typeof LineContentSchema>): LineContent => {
  return create(LineContentSchema, init)
}

/**
 * Creates a normal line wrapped in a Line, with an optional time range.
 */
export const makeLineNormal = (init?: MessageInitShape<typeof LineNormalSchema>, time?: MessageInitShape<typeof TimeSchema>): Line => {
  return create(LineSchema, { time, body: { case: 'normal', value: init ?? {} } })
}

/**
 * Creates a LineBackground, a background line attached to a normal line.
 */
export const makeLineBackground = (init?: MessageInitShape<typeof LineBackgroundSchema>): LineBackground => {
  return create(LineBackgroundSchema, init)
}

/**
 * Creates an interlude wrapped in a Line, with an optional time range.
 */
export const makeLineInterlude = (time?: MessageInitShape<typeof TimeSchema>): Line => {
  return create(LineSchema, { time, body: { case: 'interlude', value: {} } })
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
  return line.time
}

/**
 * Duration of a line in milliseconds.
 */
export const getLineDuration = (line: Line): number => {
  return getTimeDuration(getLineTime(line))
}

/**
 * Content of a line, absent on an interlude.
 */
export const getLineContent = (line: Line): LineContent | undefined => {
  return isLineNormal(line) ? line.body.value.content : undefined
}

/**
 * Words of a line, empty for an interlude.
 */
export const getLineWords = (line: Line): Word[] => {
  return getLineContent(line)?.words ?? []
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
  const content = getLineContent(line)
  if (!content) {
    return []
  }
  if (content.languages.length) {
    return content.languages
  }
  return getWordsLanguages(content.words)
}

/**
 * Annotation of a line, absent on an interlude.
 */
export const getLineAnnotation = (line: Line): LineAnnotation | undefined => {
  return getLineContent(line)?.annotation
}
