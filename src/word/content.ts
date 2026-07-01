import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Time, Word, WordAnnotationRuby, WordNormal, WordSpace } from '@root/proto'

import { WordNormalSchema, WordSchema, WordSpaceSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'
import { getTimeDuration, isTimeActive } from '@root/common/time'

/**
 * Creates a normal word wrapped in a Word.
 */
export const makeWordNormal = (init?: MessageInitShape<typeof WordNormalSchema>): Word => {
  return create(WordSchema, { body: { case: 'normal', value: init ?? {} } })
}

/**
 * Creates a run of spaces wrapped in a Word.
 */
export const makeWordSpace = (init?: MessageInitShape<typeof WordSpaceSchema>): Word => {
  return create(WordSchema, { body: { case: 'space', value: init ?? {} } })
}

/**
 * Whether a Word holds a normal word.
 */
export const isWordNormal = (word: Word): word is Word & { body: { case: 'normal'; value: WordNormal } } => {
  return word.body.case === 'normal'
}

/**
 * Whether a Word holds a run of spaces.
 */
export const isWordSpace = (word: Word): word is Word & { body: { case: 'space'; value: WordSpace } } => {
  return word.body.case === 'space'
}

/**
 * Rendered text of a word: its content, or padded spaces.
 */
export const getWordText = (word: Word): string => {
  if (word.body.case === 'normal') {
    return word.body.value.content
  }
  if (word.body.case === 'space') {
    return ' '.repeat(word.body.value.count)
  }
  return ''
}

/**
 * Time range of a word, if any.
 */
export const getWordTime = (word: Word): Time | undefined => {
  return word.body.case === 'normal' ? word.body.value.time : undefined
}

/**
 * Ruby annotation of a word, if any.
 */
export const getWordRuby = (word: Word): WordAnnotationRuby | undefined => {
  return word.body.case === 'normal' ? word.body.value.annotation?.ruby : undefined
}

/**
 * Duration of a word in milliseconds.
 */
export const getWordDuration = (word: Word): number => {
  return getTimeDuration(getWordTime(word))
}

/**
 * Index of the word active at the given moment, or -1 when none.
 */
export const getActiveWordIndex = (words: Word[], ms: number): number => {
  for (let i = 0, len = words.length; i < len; i++) {
    if (isTimeActive(getWordTime(words[i]), ms)) {
      return i
    }
  }
  return -1
}

/**
 * Word active at the given moment, if any.
 */
export const getActiveWord = (words: Word[], ms: number): Word | undefined => {
  const index = getActiveWordIndex(words, ms)
  return index === -1 ? undefined : words[index]
}
