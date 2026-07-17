import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Meta, MetaCredit, MetaReference, MetaText, Unknown } from '@root/common/proto'

import { MetaCreditSchema, MetaReferenceSchema, MetaSchema, MetaTextSchema } from '@root/common/proto'

import { create } from '@bufbuild/protobuf'
import { getUnknownValues } from '@root/common/unknown'

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
    const matched = items.find((item) => item.language === language)
    if (matched) {
      return matched.content
    }
  }
  return items[0]?.content
}

/**
 * Unrecognized meta values carrying the given original key.
 */
export const getMetaUnknown = (unknowns: Unknown[], key: string): string[] => {
  return getUnknownValues(unknowns, key)
}

/**
 * Reference ids for the given platform.
 */
export const getMetaReference = (references: MetaReference[], platform: string): string[] => {
  return references.find((item) => item.platform === platform)?.ids ?? []
}
