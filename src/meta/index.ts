import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Meta, MetaCredit, MetaReference, MetaText, MetaUnknown } from '@root/proto'

import { MetaCreditSchema, MetaReferenceSchema, MetaSchema, MetaTextSchema, MetaUnknownSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates a Meta, the lyric metadata container.
 */
export const makeMeta = (init?: MessageInitShape<typeof MetaSchema>): Meta => {
  return create(MetaSchema, init)
}

/**
 * Creates a MetaText, a value optionally tagged with a language.
 */
export const makeMetaText = (init?: MessageInitShape<typeof MetaTextSchema>): MetaText => {
  return create(MetaTextSchema, init)
}

/**
 * Creates a MetaCredit, a role with its credited names.
 */
export const makeMetaCredit = (init?: MessageInitShape<typeof MetaCreditSchema>): MetaCredit => {
  return create(MetaCreditSchema, init)
}

/**
 * Creates a MetaUnknown, an unrecognized meta preserved by its original key.
 */
export const makeMetaUnknown = (init?: MessageInitShape<typeof MetaUnknownSchema>): MetaUnknown => {
  return create(MetaUnknownSchema, init)
}

/**
 * Creates a MetaReference, a platform and its identifiers.
 */
export const makeMetaReference = (init?: MessageInitShape<typeof MetaReferenceSchema>): MetaReference => {
  return create(MetaReferenceSchema, init)
}

/**
 * Text of a localized meta list, preferring a language match.
 */
export const getMetaText = (items: MetaText[], language?: string): string | undefined => {
  if (language !== undefined) {
    const matched = items.find(item => item.language === language)
    if (matched) {
      return matched.value
    }
  }
  return items[0]?.value
}

/**
 * Unrecognized meta values carrying the given original key.
 */
export const getMetaUnknown = (unknowns: MetaUnknown[], key: string): string[] => {
  return unknowns.filter(item => item.key === key).map(item => item.value)
}

/**
 * Reference ids for the given platform.
 */
export const getMetaReference = (references: MetaReference[], platform: string): string[] => {
  return references.find(item => item.platform === platform)?.ids ?? []
}
