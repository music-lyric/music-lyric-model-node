import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Part } from '@root/storage/proto'

import { PartSchema } from '@root/storage/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates a Part, a line's structural section.
 */
export const makePart = (init?: MessageInitShape<typeof PartSchema>): Part => {
  return create(PartSchema, init)
}
