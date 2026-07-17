import type { MessageInitShape } from '@bufbuild/protobuf'
import type {
  ParsedLine,
  ParsedLineBackground,
  ParsedLineInterlude,
  ParsedLineNormal,
} from '@root/parsed/proto'
import type {
  LineAnnotation,
  LineAnnotationRoman,
  LineAnnotationTranslation,
  Time,
  Unknown,
  Word,
  WordNormal,
} from '@root/common/proto'

import {
  ParsedLineBackgroundSchema,
  ParsedLineInterludeSchema,
  ParsedLineNormalSchema,
  ParsedLineSchema,
} from '@root/parsed/proto'

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
 * Creates a normal line wrapped in a ParsedLine.
 */
export const makeParsedLineNormal = (init?: MessageInitShape<typeof ParsedLineNormalSchema>): ParsedLine => {
  return create(ParsedLineSchema, { body: { case: 'normal', value: init ?? {} } })
}

/**
 * Creates a ParsedLineBackground.
 */
export const makeParsedLineBackground = (
  init?: MessageInitShape<typeof ParsedLineBackgroundSchema>,
): ParsedLineBackground => {
  return create(ParsedLineBackgroundSchema, init)
}

/**
 * Creates an interlude wrapped in a ParsedLine.
 */
export const makeParsedLineInterlude = (
  init?: MessageInitShape<typeof ParsedLineInterludeSchema>,
): ParsedLine => {
  return create(ParsedLineSchema, { body: { case: 'interlude', value: init ?? {} } })
}

/**
 * Time range of a line body.
 */
export const getParsedLineTime = (line: ParsedLine): Time | undefined => {
  if (line.body.case === 'normal' || line.body.case === 'interlude') {
    return line.body.value.time
  }
  return undefined
}

/**
 * Duration of a line in milliseconds.
 */
export const getParsedLineDuration = (line: ParsedLine): number => {
  return getTimeDuration(getParsedLineTime(line))
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
 * Words of a line, empty for an interlude.
 */
export const getParsedLineWords = (line: ParsedLine): Word[] => {
  return asParsedLineNormal(line)?.words ?? []
}

/**
 * Plain text of a line.
 */
export const getParsedLineText = (line: ParsedLine): string => {
  return getWordsText(getParsedLineWords(line))
}

/**
 * Languages of a line: the explicit tags, otherwise those of its words.
 */
export const getParsedLineLanguages = (line: ParsedLine): string[] => {
  const normal = asParsedLineNormal(line)
  if (!normal) {
    return []
  }
  if (normal.languages.length) {
    return normal.languages
  }
  return getWordsLanguages(normal.words)
}

/**
 * Languages of a background line: the explicit tags, otherwise those of its words.
 */
export const getParsedBackgroundLanguages = (background: ParsedLineBackground): string[] => {
  if (background.languages.length) {
    return background.languages
  }
  return getWordsLanguages(background.words)
}

/**
 * Annotation of a line, absent on an interlude.
 */
export const getParsedLineAnnotation = (line: ParsedLine): LineAnnotation | undefined => {
  return asParsedLineNormal(line)?.annotation
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
export const getParsedLineTranslation = (line: ParsedLine, language?: string): string | undefined => {
  const annotation = getParsedLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.translations, language)?.content : undefined
}

/**
 * Romanized text of a line, preferring a language match.
 */
export const getParsedLineRoman = (line: ParsedLine, language?: string): string | undefined => {
  const annotation = getParsedLineAnnotation(line)
  return annotation ? getFirstAnnotation(annotation.romans, language)?.content : undefined
}

/**
 * Whether a ParsedLine holds a normal line.
 */
export const isParsedLineNormal = (
  line: ParsedLine,
): line is ParsedLine & { body: { case: 'normal'; value: ParsedLineNormal } } => {
  return line.body.case === 'normal'
}

/**
 * Whether a ParsedLine holds an interlude.
 */
export const isParsedLineInterlude = (
  line: ParsedLine,
): line is ParsedLine & { body: { case: 'interlude'; value: ParsedLineInterlude } } => {
  return line.body.case === 'interlude'
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
