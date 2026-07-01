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

/**
 * Whether the time range is active at the given moment in milliseconds.
 */
export const isTimeActive = (time: Time | undefined, ms: number): boolean => {
  return time ? ms >= time.start && ms < time.end : false
}

/**
 * Progress within a time range at the given moment, clamped to 0..1.
 */
export const getTimeProgress = (time: Time | undefined, ms: number): number => {
  const duration = getTimeDuration(time)
  if (!time || duration <= 0) {
    return 0
  }
  if (ms <= time.start) {
    return 0
  }
  if (ms >= time.end) {
    return 1
  }
  return (ms - time.start) / duration
}
