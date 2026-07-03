import type { JsonValue, MessageInitShape } from '@bufbuild/protobuf'
import type { Lyric } from '@root/storage/proto'

import { SCHEMA_VERSION } from '@root/version'
import { LyricSchema } from '@root/storage/proto'

import { create, fromBinary, fromJson, toBinary, toJson } from '@bufbuild/protobuf'
import { getLineTime } from '@root/storage/line'

/**
 * Creates a Lyric, stamping the current SCHEMA_VERSION.
 */
export const makeLyric = (init?: MessageInitShape<typeof LyricSchema>): Lyric => {
  return create(LyricSchema, { ...init, version: SCHEMA_VERSION })
}

/**
 * Encode a Lyric to protobuf binary.
 */
export const encodeLyric = (lyric: Lyric): Uint8Array => {
  return toBinary(LyricSchema, lyric)
}

/**
 * Decode a Lyric from protobuf binary.
 */
export const decodeLyric = (bytes: Uint8Array): Lyric => {
  return fromBinary(LyricSchema, bytes)
}

/**
 * Convert a Lyric to protobuf JSON.
 */
export const lyricToJson = (lyric: Lyric): JsonValue => {
  return toJson(LyricSchema, lyric)
}

/**
 * Restore a Lyric from protobuf JSON.
 */
export const lyricFromJson = (json: JsonValue): Lyric => {
  return fromJson(LyricSchema, json)
}

/**
 * Sort lines and their background lines by start time ascending.
 */
export const sortLinesByTime = (lyric: Lyric): void => {
  lyric.lines.sort((a, b) => (getLineTime(a)?.start ?? 0) - (getLineTime(b)?.start ?? 0))

  for (const line of lyric.lines) {
    line.backgrounds.sort((a, b) => (a.time?.start ?? 0) - (b.time?.start ?? 0))
  }
}
