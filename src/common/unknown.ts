import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Unknown } from '@root/common/proto'

import { UnknownSchema } from '@root/common/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates an Unknown key-value pair preserved from an unrecognized source field.
 */
export const makeUnknown = (init?: MessageInitShape<typeof UnknownSchema>): Unknown => {
  return create(UnknownSchema, init)
}

/**
 * Raw values among unknowns that carry the given original key.
 */
export const getUnknownValues = (unknowns: Unknown[], key: string): string[] => {
  return unknowns.filter((item) => item.key === key).map((item) => item.value)
}
