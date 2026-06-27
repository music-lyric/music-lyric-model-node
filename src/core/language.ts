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
