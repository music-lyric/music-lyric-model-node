import type { JsonValue, MessageInitShape } from '@bufbuild/protobuf'
import type { Lyric } from '@root/storage/proto'

import { SCHEMA_VERSION } from '@root/version'
import { LyricSchema } from '@root/storage/proto'

import { create, fromBinary, fromJson, toBinary, toJson } from '@bufbuild/protobuf'
import { getStorageLineTime } from '@root/storage/line'

/**
 * Creates a Lyric, stamping the current SCHEMA_VERSION.
 */
export const makeStorageLyric = (init?: MessageInitShape<typeof LyricSchema>): Lyric => {
  return create(LyricSchema, { ...init, version: SCHEMA_VERSION })
}

/**
 * Encode a Lyric to protobuf binary.
 */
export const encodeStorageLyric = (lyric: Lyric): Uint8Array => {
  return toBinary(LyricSchema, lyric)
}

/**
 * Decode a Lyric from protobuf binary.
 */
export const decodeStorageLyric = (bytes: Uint8Array): Lyric => {
  return fromBinary(LyricSchema, bytes)
}

/**
 * Convert a Lyric to protobuf JSON.
 */
export const storageLyricToJson = (lyric: Lyric): JsonValue => {
  return toJson(LyricSchema, lyric)
}

/**
 * Restore a Lyric from protobuf JSON.
 */
export const storageLyricFromJson = (json: JsonValue): Lyric => {
  return fromJson(LyricSchema, json)
}

/**
 * Sort lines and their background lines by start time ascending.
 */
export const sortStorageLinesByTime = (lyric: Lyric): void => {
  lyric.lines.sort((a, b) => (getStorageLineTime(a)?.start ?? 0) - (getStorageLineTime(b)?.start ?? 0))

  for (const line of lyric.lines) {
    line.backgrounds.sort((a, b) => (a.time?.start ?? 0) - (b.time?.start ?? 0))
  }
}
