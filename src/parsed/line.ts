import type { MessageInitShape } from '@bufbuild/protobuf'
import type { ParsedLine, ParsedLineBackground, ParsedLineInterlude, ParsedLineNormal } from '@root/parsed/proto'
import type { LineAnnotation, LineAnnotationRoman, LineAnnotationTranslation, Time, Unknown, Word, WordNormal } from '@root/common/proto'

import { ParsedLineBackgroundSchema, ParsedLineInterludeSchema, ParsedLineNormalSchema, ParsedLineSchema } from '@root/parsed/proto'

import { create } from '@bufbuild/protobuf'
import {
  getFirstAnnotation,
  getTimeDuration,
  getWordAnnotationText,
  getWordsLanguages,
  getWordsText,
  isTimeActive,
  makeLineAnnotation,
  makeLineAnnotationRoman,
  makeLineAnnotationTranslation,
  makeUnknown,
} from '@root/common'

/**
 * A parsed normal body or background line.
 * Shared fields: time, agents, languages, words, annotation.
 */
export type ParsedLineContent = ParsedLineNormal | ParsedLineBackground

/**
 * Whether a value is the ParsedLine oneof wrapper.
 */
const isParsedLineWrapper = (line: ParsedLine | ParsedLineContent | ParsedLineInterlude): line is ParsedLine => {
  return 'body' in line
}

/**
 * Creates a normal line wrapped in a ParsedLine.
 */
export const makeParsedLineNormal = (init?: MessageInitShape<typeof ParsedLineNormalSchema>): ParsedLine => {
  return create(ParsedLineSchema, { body: { case: 'normal', value: init ?? {} } })
}

/**
 * Creates a ParsedLineBackground.
 */
export const makeParsedLineBackground = (init?: MessageInitShape<typeof ParsedLineBackgroundSchema>): ParsedLineBackground => {
  return create(ParsedLineBackgroundSchema, init)
}

/**
 * Creates an interlude wrapped in a ParsedLine.
 */
export const makeParsedLineInterlude = (init?: MessageInitShape<typeof ParsedLineInterludeSchema>): ParsedLine => {
  return create(ParsedLineSchema, { body: { case: 'interlude', value: init ?? {} } })
}

/**
 * Whether a ParsedLine holds a normal line.
 */
export const isParsedLineNormal = (line: ParsedLine): line is ParsedLine & { body: { case: 'normal'; value: ParsedLineNormal } } => {
  return line.body.case === 'normal'
}

/**
 * Whether a ParsedLine holds an interlude.
 */
export const isParsedLineInterlude = (line: ParsedLine): line is ParsedLine & { body: { case: 'interlude'; value: ParsedLineInterlude } } => {
  return line.body.case === 'interlude'
}

/**
 * Normal body of a line, if any.
 */
export const asParsedLineNormal = (line: ParsedLine): ParsedLineNormal | undefined => {
  return isParsedLineNormal(line) ? line.body.value : undefined
}

/**
 * Interlude body of a line, if any.
 */
export const asParsedLineInterlude = (line: ParsedLine): ParsedLineInterlude | undefined => {
  return isParsedLineInterlude(line) ? line.body.value : undefined
}

/**
 * Time range of a line wrapper, normal body, background, or interlude.
 */
export const getParsedLineTime = (line: ParsedLine | ParsedLineContent | ParsedLineInterlude): Time | undefined => {
  if (isParsedLineWrapper(line)) {
    if (line.body.case === 'normal' || line.body.case === 'interlude') {
      return line.body.value.time
    }
    return undefined
  }
  return line.time
}

/**
 * Duration of a line in milliseconds.
 */
export const getParsedLineDuration = (line: ParsedLine | ParsedLineContent | ParsedLineInterlude): number => {
  return getTimeDuration(getParsedLineTime(line))
}

/**
 * Words of a line wrapper, normal body, or background; empty for an interlude wrapper.
 */
export const getParsedLineWords = (line: ParsedLine | ParsedLineContent): Word[] => {
  if (isParsedLineWrapper(line)) {
    return asParsedLineNormal(line)?.words ?? []
  }
  return line.words
}

/**
 * Plain text of a line wrapper, normal body, or background.
 */
export const getParsedLineText = (line: ParsedLine | ParsedLineContent): string => {
  return getWordsText(getParsedLineWords(line))
}

/**
 * Languages of a line: explicit tags when present, otherwise those of its words.
 * Accepts a line wrapper, normal body, or background; empty for an interlude wrapper.
 */
export const getParsedLineLanguages = (line: ParsedLine | ParsedLineContent): string[] => {
  if (isParsedLineWrapper(line)) {
    const normal = asParsedLineNormal(line)
    if (!normal) {
      return []
    }
    return languagesOf(normal)
  }
  return languagesOf(line)
}

/**
 * Annotation of a line wrapper, normal body, or background; absent on an interlude wrapper.
 */
export const getParsedLineAnnotation = (line: ParsedLine | ParsedLineContent): LineAnnotation | undefined => {
  if (isParsedLineWrapper(line)) {
    return asParsedLineNormal(line)?.annotation
  }
  return line.annotation
}

/**
 * Index of the line active at the given moment, or -1 when none.
 */
export const getParsedActiveLineIndex = (lines: ParsedLine[], ms: number): number => {
  for (let i = 0, len = lines.length; i < len; i++) {
    if (isTimeActive(getParsedLineTime(lines[i]), ms)) {
      return i
    }
  }
  return -1
}

/**
 * Line active at the given moment, if any.
 */
export const getParsedActiveLine = (lines: ParsedLine[], ms: number): ParsedLine | undefined => {
  const index = getParsedActiveLineIndex(lines, ms)
  return index === -1 ? undefined : lines[index]
}

/**
 * Translated text of a line, preferring a language match.
 */
export const getParsedLineTranslation = (line: ParsedLine | ParsedLineContent, language?: string): string | undefined => {
  const annotation = getParsedLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.translations, language)?.content : undefined
}

/**
 * Romanized text of a line, preferring a language match.
 */
export const getParsedLineRoman = (line: ParsedLine | ParsedLineContent, language?: string): string | undefined => {
  const annotation = getParsedLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.romans, language)?.content : undefined
}

/**
 * Explicit languages, or those derived from words when empty.
 */
const languagesOf = (item: { languages: string[]; words: Word[] }): string[] => {
  if (item.languages.length) {
    return item.languages
  }
  return getWordsLanguages(item.words)
}

/**
 * Aggregate per-word annotations into line items, one per distinct group.
 */
const aggregate = <T, R>(
  words: Word[],
  collect: (word: WordNormal) => T[] | undefined,
  groupOf: (item: T) => string,
  textOf: (item: T) => string,
  languageOf: (item: T) => string | undefined,
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
        content += textOf(item)
        language ??= languageOf(item)
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
 * Line romanizations aggregated from word annotations, grouped by language.
 * Display-time only; does not write back into the line message.
 */
export const deriveParsedLineRomans = (words: Word[]): LineAnnotationRoman[] => {
  return aggregate(
    words,
    (word) => word.annotation?.romans,
    (item) => item.language ?? '',
    (item) => getWordAnnotationText(item),
    (item) => item.language,
    (_group, content, language) => makeLineAnnotationRoman({ language, content }),
  )
}

/**
 * Line translations aggregated from word annotations, grouped by language.
 * Display-time only; does not write back into the line message.
 */
export const deriveParsedLineTranslations = (words: Word[]): LineAnnotationTranslation[] => {
  return aggregate(
    words,
    (word) => word.annotation?.translations,
    (item) => item.language ?? '',
    (item) => item.content,
    (item) => item.language,
    (_group, content, language) => makeLineAnnotationTranslation({ language, content }),
  )
}

/**
 * Line unknown annotations aggregated from word annotations, grouped by original key.
 * Display-time only; does not write back into the line message.
 */
export const deriveParsedLineUnknowns = (words: Word[]): Unknown[] => {
  return aggregate(
    words,
    (word) => word.annotation?.unknowns,
    (item) => item.key,
    (item) => item.value,
    () => undefined,
    (group, content) => makeUnknown({ key: group, value: content }),
  )
}

/**
 * Build a LineAnnotation by aggregating word annotations for display.
 * Does not write back into the line message.
 */
export const deriveParsedLineAnnotation = (words: Word[]): LineAnnotation => {
  return makeLineAnnotation({
    unknowns: deriveParsedLineUnknowns(words),
    romans: deriveParsedLineRomans(words),
    translations: deriveParsedLineTranslations(words),
  })
}
