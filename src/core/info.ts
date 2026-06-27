import type { MessageInitShape } from '@bufbuild/protobuf'
import type { Info } from '@root/proto'

import { SCHEMA_VERSION } from '@root/version'

import { InfoSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'

/**
 * Creates an Info, stamping the current SCHEMA_VERSION unless overridden.
 */
export const makeInfo = (init?: MessageInitShape<typeof InfoSchema>): Info => {
  return create(InfoSchema, { ...init, version: SCHEMA_VERSION })
}
