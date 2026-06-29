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
 * Fill each line agent's index and each agent's line count snapshots.
 */
export const calcAgentIndex = (info: Info): void => {
  const globalIndex = new Map<string, number>()
  const idIndex = new Map<string, number>()

  let id: string | null = null
  let blockIndex = 0

  for (const line of info.lines) {
    if (!isLineNormal(line)) {
      continue
    }
    const agent = line.body.value.agent
    if (!agent) {
      continue
    }

    const current = agent.id

    const gi = globalIndex.get(current) ?? 0
    agent.globalIndex = gi
    globalIndex.set(current, gi + 1)

    if (current !== id) {
      blockIndex = 0
      id = current
    }
    agent.blockIndex = blockIndex++

    idIndex.set(current, (idIndex.get(current) ?? 0) + 1)
  }

  for (const agent of info.agents) {
    agent.count = idIndex.get(agent.id) ?? 0
  }
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
