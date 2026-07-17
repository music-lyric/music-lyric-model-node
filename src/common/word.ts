import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Time } from '@root/common/proto'
import type {
  Word,
  WordAnnotation,
  WordAnnotationContent,
  WordAnnotationRoman,
  WordAnnotationRuby,
  WordAnnotationTranslation,
  WordNormal,
  WordSpace,
} from '@root/common/proto'

import {
  WordAnnotationContentSchema,
  WordAnnotationRomanSchema,
  WordAnnotationRubySchema,
  WordAnnotationSchema,
  WordAnnotationTranslationSchema,
  WordNormalSchema,
  WordSchema,
  WordSpaceSchema,
} from '@root/common/proto'

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
 * Creates a WordAnnotationContent, one token of a word annotation.
 */
export const makeWordAnnotationContent = (
  init?: MessageInitShape<typeof WordAnnotationContentSchema>,
): WordAnnotationContent => {
  return create(WordAnnotationContentSchema, init)
}

/**
 * Creates a WordAnnotationRoman.
 */
export const makeWordAnnotationRoman = (
  init?: MessageInitShape<typeof WordAnnotationRomanSchema>,
): WordAnnotationRoman => {
  return create(WordAnnotationRomanSchema, init)
}

/**
 * Creates a WordAnnotationTranslation.
 */
export const makeWordAnnotationTranslation = (
  init?: MessageInitShape<typeof WordAnnotationTranslationSchema>,
): WordAnnotationTranslation => {
  return create(WordAnnotationTranslationSchema, init)
}

/**
 * Creates a WordAnnotationRuby.
 */
export const makeWordAnnotationRuby = (
  init?: MessageInitShape<typeof WordAnnotationRubySchema>,
): WordAnnotationRuby => {
  return create(WordAnnotationRubySchema, init)
}

/**
 * Creates a WordAnnotation, the per-word annotation container.
 */
export const makeWordAnnotation = (init?: MessageInitShape<typeof WordAnnotationSchema>): WordAnnotation => {
  return create(WordAnnotationSchema, init)
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
 * Text joined from words in order.
 */
export const getWordsText = (words: Word[]): string => {
  let result = ''
  for (let i = 0, len = words.length; i < len; i++) {
    result += getWordText(words[i])
  }
  return result
}

/**
 * Distinct language tags among a list of words, in first-seen order.
 */
export const getWordsLanguages = (words: Word[]): string[] => {
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
 * Time range of a word, if any.
 * Accepts either the Word wrapper or a bare WordNormal.
 */
export const getWordTime = (word: Word | WordNormal): Time | undefined => {
  if ('body' in word) {
    return word.body.case === 'normal' ? word.body.value.time : undefined
  }
  return word.time
}

/**
 * Ruby annotations of a normal word, if any.
 */
export const getWordRubies = (word: Word): WordAnnotationRuby[] => {
  return word.body.case === 'normal' ? (word.body.value.annotation?.rubies ?? []) : []
}

/**
 * Duration of a word in milliseconds.
 * Accepts either the Word wrapper or a bare WordNormal.
 */
export const getWordDuration = (word: Word | WordNormal): number => {
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

/**
 * Text joined from every annotation token.
 */
export const getWordAnnotationText = (item: { words: WordAnnotationContent[] }): string => {
  let result = ''
  for (let i = 0, len = item.words.length; i < len; i++) {
    result += item.words[i].content
  }
  return result
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
 * Returns the normal word if the Word holds one, otherwise undefined.
 */
export const asWordNormal = (word: Word): WordNormal | undefined => {
  return isWordNormal(word) ? word.body.value : undefined
}

/**
 * Returns the space run if the Word holds one, otherwise undefined.
 */
export const asWordSpace = (word: Word): WordSpace | undefined => {
  return isWordSpace(word) ? word.body.value : undefined
}
