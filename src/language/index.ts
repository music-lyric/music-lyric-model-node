import type { MessageInitShape } from '@bufbuild/protobuf'
import type { LanguageItem } from '@root/proto'

import { LanguageItemSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates a LanguageItem.
 */
export const makeLanguageItem = (init?: MessageInitShape<typeof LanguageItemSchema>): LanguageItem => {
  return create(LanguageItemSchema, init)
}

/**
 * The language entry of the given tag.
 */
export const getLanguageByTag = (languages: LanguageItem[], tag: string): LanguageItem | undefined => {
  return languages.find(item => item.tag === tag)
}

/**
 * The language with the highest share.
 */
export const getPrimaryLanguage = (languages: LanguageItem[]): LanguageItem | undefined => {
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
export const hasLanguage = (languages: LanguageItem[], tag: string): boolean => {
  return languages.some(item => item.tag === tag)
}
