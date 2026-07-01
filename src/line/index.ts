import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Line, LineAnnotation, LineAnnotationRoman, LineAnnotationTranslate, LineAnnotationUnknown, LineBackground, LineContent, LineInterlude, LineNormal, Time, Word, WordAnnotationContent, WordNormal } from '@root/proto'

import { LineAnnotationRomanSchema, LineAnnotationSchema, LineAnnotationTranslateSchema, LineAnnotationUnknownSchema, LineBackgroundSchema, LineContentSchema, LineNormalSchema, LineSchema, TimeSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'
import { getTimeDuration, isTimeActive } from '@root/common'
import { getWordAnnotationText, getWordText } from '@root/word'

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
    const matched = items.find(item => item.language === language)
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
      const item = collect(word.body.value)?.find(entry => groupOf(entry) === group)
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
    word => word.annotation?.romans,
    item => item.language ?? '',
    (_group, content, language) => makeLineAnnotationRoman({ language, content, derived: true }),
  )
}

/**
 * Line translations aggregated from a line's word annotations, grouped by language.
 */
export const deriveLineTranslates = (words: Word[]): LineAnnotationTranslate[] => {
  return aggregate(
    words,
    word => word.annotation?.translates,
    item => item.language ?? '',
    (_group, content, language) => makeLineAnnotationTranslate({ language, content, derived: true }),
  )
}

/**
 * Line unknown annotations aggregated from a line's word annotations, grouped by original key.
 */
export const deriveLineUnknowns = (words: Word[]): LineAnnotationUnknown[] => {
  return aggregate(
    words,
    word => word.annotation?.unknowns,
    item => item.key,
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
