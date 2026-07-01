import type { MessageInitShape } from '@bufbuild/protobuf'
import type {
  Line,
  LineAnnotation,
  LineAnnotationRoman,
  LineAnnotationTranslate,
  LineAnnotationUnknown,
  Word,
  WordAnnotationContent,
  WordNormal,
} from '@root/proto'

import { LineAnnotationRomanSchema, LineAnnotationSchema, LineAnnotationTranslateSchema, LineAnnotationUnknownSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'
import { getLineAnnotation } from '@root/line/content'
import { getWordAnnotationText } from '@root/word'

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

/**
 * Aggregate per-word annotations into line items, one per distinct group.
 *
 * `collect` selects a word's annotation tokens, `groupOf` names each token's group, `make` builds the line item.
 *
 * Tokens are joined in word order with spaces padded to follow word spacing; groups keep first-seen order.
 */
const aggregate = <T extends { language?: string; words: WordAnnotationContent[] }, R>(
  words: Word[],
  collect: (word: WordNormal) => T[] | undefined,
  groupOf: (item: T) => string,
  make: (group: string, content: string, language: string | undefined) => R,
): R[] => {
  const groups: string[] = []
  for (let i = 0, len = words.length; i < len; i++) {
    const word = words[i]
    if (word.body.case !== 'normal') {
      continue
    }
    const items = collect(word.body.value)
    if (!items) {
      continue
    }
    for (const item of items) {
      const group = groupOf(item)
      if (!groups.includes(group)) {
        groups.push(group)
      }
    }
  }

  const result: R[] = []
  for (const group of groups) {
    let content = ''
    let pending = 0
    let language: string | undefined
    let has = false
    for (let i = 0, len = words.length; i < len; i++) {
      const word = words[i]
      if (word.body.case === 'space') {
        pending += word.body.value.count
        continue
      }
      if (word.body.case !== 'normal') {
        continue
      }
      const item = collect(word.body.value)?.find((entry) => groupOf(entry) === group)
      if (item) {
        if (has) {
          content += ' '.repeat(pending)
        }
        content += getWordAnnotationText(item)
        language ??= item.language
        pending = 0
        has = true
      }
    }
    if (has) {
      result.push(make(group, content, language))
    }
  }
  return result
}

/**
 * Line romanizations aggregated from a line's word annotations, grouped by language.
 */
export const deriveLineRomans = (words: Word[]): LineAnnotationRoman[] => {
  return aggregate(
    words,
    (word) => word.annotation?.romans,
    (item) => item.language ?? '',
    (_group, content, language) => makeLineAnnotationRoman({ language, content, derived: true }),
  )
}

/**
 * Line translations aggregated from a line's word annotations, grouped by language.
 */
export const deriveLineTranslates = (words: Word[]): LineAnnotationTranslate[] => {
  return aggregate(
    words,
    (word) => word.annotation?.translates,
    (item) => item.language ?? '',
    (_group, content, language) => makeLineAnnotationTranslate({ language, content, derived: true }),
  )
}

/**
 * Line unknown annotations aggregated from a line's word annotations, grouped by original key.
 */
export const deriveLineUnknowns = (words: Word[]): LineAnnotationUnknown[] => {
  return aggregate(
    words,
    (word) => word.annotation?.unknowns,
    (item) => item.key,
    (group, content, language) => makeLineAnnotationUnknown({ key: group, language, content, derived: true }),
  )
}

/**
 * Build a LineAnnotation by aggregating a line's word annotations; every item is marked derived.
 */
export const deriveLineAnnotation = (words: Word[]): LineAnnotation => {
  return makeLineAnnotation({
    unknowns: deriveLineUnknowns(words),
    translates: deriveLineTranslates(words),
    romans: deriveLineRomans(words),
  })
}
