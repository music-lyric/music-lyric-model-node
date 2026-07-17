import type { JsonValue, MessageInitShape } from '@bufbuild/protobuf'
import type { Info } from '@root/parsed/proto'

import { SCHEMA_VERSION } from '@root/version'
import { InfoSchema } from '@root/parsed/proto'

import { create, fromBinary, fromJson, toBinary, toJson } from '@bufbuild/protobuf'
import { getParsedLineTime, isParsedLineNormal } from '@root/parsed/line'

/**
 * Creates an Info, stamping the current SCHEMA_VERSION.
 */
export const makeParsedInfo = (init?: MessageInitShape<typeof InfoSchema>): Info => {
  return create(InfoSchema, { ...init, version: SCHEMA_VERSION })
}

/**
 * Encode an Info to protobuf binary.
 */
export const encodeParsedInfo = (info: Info): Uint8Array => {
  return toBinary(InfoSchema, info)
}

/**
 * Decode an Info from protobuf binary.
 */
export const decodeParsedInfo = (bytes: Uint8Array): Info => {
  return fromBinary(InfoSchema, bytes)
}

/**
 * Convert an Info to protobuf JSON.
 */
export const parsedInfoToJson = (info: Info): JsonValue => {
  return toJson(InfoSchema, info)
}

/**
 * Restore an Info from protobuf JSON.
 */
export const parsedInfoFromJson = (json: JsonValue): Info => {
  return fromJson(InfoSchema, json)
}

/**
 * Sort lines and their background lines by start time ascending.
 */
export const sortParsedLinesByTime = (info: Info): void => {
  info.lines.sort((a, b) => (getParsedLineTime(a)?.start ?? 0) - (getParsedLineTime(b)?.start ?? 0))

  for (const line of info.lines) {
    if (!isParsedLineNormal(line)) {
      continue
    }
    line.body.value.backgrounds.sort((a, b) => (a.time?.start ?? 0) - (b.time?.start ?? 0))
  }
}
