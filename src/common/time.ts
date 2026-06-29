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

/**
 * Duration of a time range in milliseconds.
 */
export const getTimeDuration = (time?: Time): number => {
  return time ? time.end - time.start : 0
}
