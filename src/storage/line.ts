import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Time } from '@root/common/proto'
import type {
  Line,
  LineAnnotation,
  LineAnnotationRoman,
  LineAnnotationTranslate,
  LineAnnotationUnknown,
  LineContent,
  Word,
} from '@root/storage/proto'

import {
  LineAnnotationRomanSchema,
  LineAnnotationSchema,
  LineAnnotationTranslateSchema,
  LineAnnotationUnknownSchema,
  LineContentSchema,
  LineSchema,
} from '@root/storage/proto'

import { create } from '@bufbuild/protobuf'
import { getTimeDuration, isTimeActive } from '@root/common'
import { getWordText } from '@root/storage/word'

/**
 * Creates a LineContent, the sung content shared by a line and its backgrounds.
 */
export const makeLineContent = (init?: MessageInitShape<typeof LineContentSchema>): LineContent => {
  return create(LineContentSchema, init)
}

/**
 * Creates a Line.
 */
export const makeLine = (init?: MessageInitShape<typeof LineSchema>): Line => {
  return create(LineSchema, init)
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

/**
 * Content of a line.
 */
export const getLineContent = (line: Line): LineContent | undefined => {
  return line.content
}

/**
 * Time range of a line.
 */
export const getLineTime = (line: Line): Time | undefined => {
  return line.content?.time
}

/**
 * Duration of a line in milliseconds.
 */
export const getLineDuration = (line: Line): number => {
  return getTimeDuration(getLineTime(line))
}

/**
 * Words of a line.
 */
export const getLineWords = (line: Line): Word[] => {
  return line.content?.words ?? []
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
 * Languages of a line, collected from its words.
 */
export const getLineLanguages = (line: Line): string[] => {
  return getWordsLanguages(getLineWords(line))
}

/**
 * Annotation of a line.
 */
export const getLineAnnotation = (line: Line): LineAnnotation | undefined => {
  return line.content?.annotation
}

/**
 * Index of the line active at the given moment, or -1 when none.
 */
export const getActiveLineIndex = (lines: Line[], ms: number): number => {
  for (let i = 0, len = lines.length; i < len; i++) {
    if (isTimeActive(getLineTime(lines[i]), ms)) {
      return i
    }
  }
  return -1
}

/**
 * Line active at the given moment, if any.
 */
export const getActiveLine = (lines: Line[], ms: number): Line | undefined => {
  const index = getActiveLineIndex(lines, ms)
  return index === -1 ? undefined : lines[index]
}

/**
 * First annotation item, preferring a language match.
 */
export const getFirstAnnotation = <T extends { language?: string }>(items: T[], language?: string): T | undefined => {
  if (language !== undefined) {
    const matched = items.find((item) => item.language === language)
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
