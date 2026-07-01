import type { JsonValue, MessageInitShape } from '@bufbuild/protobuf'
import type { Info } from '@root/proto'

import { SCHEMA_VERSION } from '@root/version'
import { InfoSchema } from '@root/proto'

import { create, fromBinary, fromJson, toBinary, toJson } from '@bufbuild/protobuf'
import { getLineTime, isLineNormal } from '@root/line'

/**
 * Creates an Info, stamping the current SCHEMA_VERSION.
 */
export const makeInfo = (init?: MessageInitShape<typeof InfoSchema>): Info => {
  return create(InfoSchema, { ...init, version: SCHEMA_VERSION })
}

/**
 * Encode an Info to protobuf binary.
 */
export const encodeInfo = (info: Info): Uint8Array => {
  return toBinary(InfoSchema, info)
}

/**
 * Decode an Info from protobuf binary.
 */
export const decodeInfo = (bytes: Uint8Array): Info => {
  return fromBinary(InfoSchema, bytes)
}

/**
 * Convert an Info to protobuf JSON.
 */
export const infoToJson = (info: Info): JsonValue => {
  return toJson(InfoSchema, info)
}

/**
 * Restore an Info from protobuf JSON.
 */
export const infoFromJson = (json: JsonValue): Info => {
  return fromJson(InfoSchema, json)
}

/**
 * Sort lines and their background lines by start time ascending.
 */
export const sortLinesByTime = (info: Info): void => {
  info.lines.sort((a, b) => (getLineTime(a)?.start ?? 0) - (getLineTime(b)?.start ?? 0))

  for (const line of info.lines) {
    if (!isLineNormal(line)) {
      continue
    }
    line.body.value.backgrounds.sort((a, b) => (a.time?.start ?? 0) - (b.time?.start ?? 0))
  }
}
