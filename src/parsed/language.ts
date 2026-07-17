import type { MessageInitShape } from '@bufbuild/protobuf'
import type { LanguageItem } from '@root/parsed/proto'

import { LanguageItemSchema } from '@root/parsed/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates a LanguageItem.
 */
export const makeParsedLanguageItem = (init?: MessageInitShape<typeof LanguageItemSchema>): LanguageItem => {
  return create(LanguageItemSchema, init)
}

/**
 * The language entry of the given tag.
 */
export const getParsedLanguageByTag = (languages: LanguageItem[], tag: string): LanguageItem | undefined => {
  return languages.find((item) => item.tag === tag)
}

/**
 * The language with the highest share.
 */
export const getParsedPrimaryLanguage = (languages: LanguageItem[]): LanguageItem | undefined => {
  let result: LanguageItem | undefined
  for (let i = 0, len = languages.length; i < len; i++) {
    if (!result || languages[i].percent > result.percent) {
      result = languages[i]
    }
  }
  return result
}

/**
 * Whether a language of the given tag is present.
 */
export const hasParsedLanguage = (languages: LanguageItem[], tag: string): boolean => {
  return languages.some((item) => item.tag === tag)
}
