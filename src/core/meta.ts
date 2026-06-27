import type { MessageInitShape } from '@bufbuild/protobuf'
import type { MetaCreator, MetaItem } from '@root/proto'

import { MetaCreatorSchema, MetaItemSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates a MetaCreator.
 */
export const makeMetaCreator = (init?: MessageInitShape<typeof MetaCreatorSchema>): MetaCreator => {
  return create(MetaCreatorSchema, init)
}

/**
 * Creates a MetaItem; set its typed value through the `content` oneof.
 */
export const makeMetaItem = (init?: MessageInitShape<typeof MetaItemSchema>): MetaItem => {
  return create(MetaItemSchema, init)
}
