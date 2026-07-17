import type { MessageInitShape } from '@bufbuild/protobuf'
import type { LineAnnotation, Time, Word } from '@root/common/proto'
import type { StorageLine, StorageLineBackground } from '@root/storage/proto'

import { StorageLineBackgroundSchema, StorageLineSchema } from '@root/storage/proto'

import { create } from '@bufbuild/protobuf'
import { getFirstAnnotation, getTimeDuration, getWordsLanguages, getWordsText, isTimeActive } from '@root/common'

/**
 * Creates a storage line.
 */
export const makeStorageLine = (init?: MessageInitShape<typeof StorageLineSchema>): StorageLine => {
  return create(StorageLineSchema, init)
}

/**
 * Creates a storage background line.
 */
export const makeStorageLineBackground = (
  init?: MessageInitShape<typeof StorageLineBackgroundSchema>,
): StorageLineBackground => {
  return create(StorageLineBackgroundSchema, init)
}

/**
 * Time range of a line.
 */
export const getStorageLineTime = (line: StorageLine): Time | undefined => {
  return line.time
}

/**
 * Time range of a background line.
 */
export const getStorageBackgroundTime = (background: StorageLineBackground): Time | undefined => {
  return background.time
}

/**
 * Duration of a line in milliseconds.
 */
export const getStorageLineDuration = (line: StorageLine): number => {
  return getTimeDuration(getStorageLineTime(line))
}

/**
 * Words of a line.
 */
export const getStorageLineWords = (line: StorageLine): Word[] => {
  return line.words
}

/**
 * Plain text of a line.
 */
export const getStorageLineText = (line: StorageLine): string => {
  return getWordsText(line.words)
}

/**
 * Plain text of a background line.
 */
export const getStorageBackgroundText = (background: StorageLineBackground): string => {
  return getWordsText(background.words)
}

/**
 * Languages of a line, collected from its words.
 */
export const getStorageLineLanguages = (line: StorageLine): string[] => {
  return getWordsLanguages(line.words)
}

/**
 * Annotation of a line.
 */
export const getStorageLineAnnotation = (line: StorageLine): LineAnnotation | undefined => {
  return line.annotation
}

/**
 * Index of the line active at the given moment, or -1 when none.
 */
export const getStorageActiveLineIndex = (lines: StorageLine[], ms: number): number => {
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
export const getStorageActiveLine = (lines: StorageLine[], ms: number): StorageLine | undefined => {
  const index = getStorageActiveLineIndex(lines, ms)
  return index === -1 ? undefined : lines[index]
}

/**
 * Translated text of a line, preferring a language match.
 */
export const getStorageLineTranslation = (line: StorageLine, language?: string): string | undefined => {
  const annotation = getStorageLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.translations, language)?.content : undefined
}

/**
 * Romanized text of a line, preferring a language match.
 */
export const getStorageLineRoman = (line: StorageLine, language?: string): string | undefined => {
  const annotation = getStorageLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.romans, language)?.content : undefined
}
