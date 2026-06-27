import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Time } from '@root/proto'

import { TimeSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates a Time.
 */
export const makeTime = (init?: MessageInitShape<typeof TimeSchema>): Time => {
  return create(TimeSchema, init)
}
