import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Time } from '@root/common/proto'
import type { Line, LineBackground } from '@root/storage/proto'
import type { LineAnnotation, Word } from '@root/common/proto'

import { LineBackgroundSchema, LineSchema } from '@root/storage/proto'

import { create } from '@bufbuild/protobuf'
import { getTimeDuration, getWordsText, isTimeActive } from '@root/common'

/**
 * Creates a storage Line.
 */
export const makeStorageLine = (init?: MessageInitShape<typeof LineSchema>): Line => {
  return create(LineSchema, init)
}

/**
 * Creates a storage LineBackground.
 */
export const makeStorageLineBackground = (
  init?: MessageInitShape<typeof LineBackgroundSchema>,
): LineBackground => {
  return create(LineBackgroundSchema, init)
}

/**
 * Time range of a line.
 */
export const getStorageLineTime = (line: Line): Time | undefined => {
  return line.time
}

/**
 * Time range of a background line.
 */
export const getStorageBackgroundTime = (background: LineBackground): Time | undefined => {
  return background.time
}

/**
 * Duration of a line in milliseconds.
 */
export const getStorageLineDuration = (line: Line): number => {
  return getTimeDuration(getStorageLineTime(line))
}

/**
 * Words of a line.
 */
export const getStorageLineWords = (line: Line): Word[] => {
  return line.words
}

/**
 * Plain text of a line.
 */
export const getStorageLineText = (line: Line): string => {
  return getWordsText(line.words)
}

/**
 * Plain text of a background line.
 */
export const getStorageBackgroundText = (background: LineBackground): string => {
  return getWordsText(background.words)
}

/**
 * Distinct language tags among a list of words, in first-seen order.
 */
export const getStorageWordsLanguages = (words: Word[]): string[] => {
  const result: string[] = []
  const seen = new Set<string>()
  for (let i = 0, len = words.length; i < len; i++) {
    const word = words[i]
    if (word.body.case === 'normal' && word.body.value.language) {
      const tag = word.body.value.language
      if (!seen.has(tag)) {
        seen.add(tag)
        result.push(tag)
      }
    }
  }
  return result
}

/**
 * Languages of a line, collected from its words.
 */
export const getStorageLineLanguages = (line: Line): string[] => {
  return getStorageWordsLanguages(line.words)
}

/**
 * Annotation of a line.
 */
export const getStorageLineAnnotation = (line: Line): LineAnnotation | undefined => {
  return line.annotation
}

/**
 * Index of the line active at the given moment, or -1 when none.
 */
export const getStorageActiveLineIndex = (lines: Line[], ms: number): number => {
  for (let i = 0, len = lines.length; i < len; i++) {
    if (isTimeActive(getStorageLineTime(lines[i]), ms)) {
      return i
    }
  }
  return -1
}

/**
 * Line active at the given moment, if any.
 */
export const getStorageActiveLine = (lines: Line[], ms: number): Line | undefined => {
  const index = getStorageActiveLineIndex(lines, ms)
  return index === -1 ? undefined : lines[index]
}

/**
 * First annotation item, preferring a language match.
 */
export const getStorageFirstAnnotation = <T extends { language?: string }>(
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

/**
 * Translated text of a line, preferring a language match.
 */
export const getStorageLineTranslation = (line: Line, language?: string): string | undefined => {
  const annotation = getStorageLineAnnotation(line)
  return annotation ? getStorageFirstAnnotation(annotation.translations, language)?.content : undefined
}

/**
 * Romanized text of a line, preferring a language match.
 */
export const getStorageLineRoman = (line: Line, language?: string): string | undefined => {
  const annotation = getStorageLineAnnotation(line)
  return annotation ? getStorageFirstAnnotation(annotation.romans, language)?.content : undefined
}
