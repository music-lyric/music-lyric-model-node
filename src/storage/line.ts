import type { MessageInitShape } from '@bufbuild/protobuf'
import type { LineAnnotation, Time, Word } from '@root/common/proto'
import type { StorageLine, StorageLineBackground } from '@root/storage/proto'

import { StorageLineBackgroundSchema, StorageLineSchema } from '@root/storage/proto'

import { create } from '@bufbuild/protobuf'
import { getFirstAnnotation, getTimeDuration, getWordsLanguages, getWordsText, isTimeActive } from '@root/common'

/**
 * A storage primary line or background line.
 * Shared fields: time, agents, words, annotation.
 */
export type StorageLineLike = StorageLine | StorageLineBackground

/**
 * Creates a storage line.
 */
export const makeStorageLine = (init?: MessageInitShape<typeof StorageLineSchema>): StorageLine => {
  return create(StorageLineSchema, init)
}

/**
 * Creates a storage background line.
 */
export const makeStorageLineBackground = (init?: MessageInitShape<typeof StorageLineBackgroundSchema>): StorageLineBackground => {
  return create(StorageLineBackgroundSchema, init)
}

/**
 * Time range of a primary or background line.
 */
export const getStorageLineTime = (line: StorageLineLike): Time | undefined => {
  return line.time
}

/**
 * Duration of a primary or background line in milliseconds.
 */
export const getStorageLineDuration = (line: StorageLineLike): number => {
  return getTimeDuration(getStorageLineTime(line))
}

/**
 * Words of a primary or background line.
 */
export const getStorageLineWords = (line: StorageLineLike): Word[] => {
  return line.words
}

/**
 * Plain text of a primary or background line.
 */
export const getStorageLineText = (line: StorageLineLike): string => {
  return getWordsText(line.words)
}

/**
 * Languages of a primary or background line, collected from its words.
 */
export const getStorageLineLanguages = (line: StorageLineLike): string[] => {
  return getWordsLanguages(line.words)
}

/**
 * Annotation of a primary or background line.
 */
export const getStorageLineAnnotation = (line: StorageLineLike): LineAnnotation | undefined => {
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
 * Translated text of a primary or background line, preferring a language match.
 */
export const getStorageLineTranslation = (line: StorageLineLike, language?: string): string | undefined => {
  const annotation = getStorageLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.translations, language)?.content : undefined
}

/**
 * Romanized text of a primary or background line, preferring a language match.
 */
export const getStorageLineRoman = (line: StorageLineLike, language?: string): string | undefined => {
  const annotation = getStorageLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.romans, language)?.content : undefined
}
