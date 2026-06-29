import type { MessageInitShape } from '@bufbuild/protobuf'
import type { MetaCreator, MetaItem } from '@root/proto'

import { MetaCreatorSchema, MetaItemSchema } from '@root/proto'

import { create } from '@bufbuild/protobuf'

type MetaContent = MetaItem['content']

type MetaItemOf<C extends MetaCase> = MetaItem & { content: Extract<MetaContent, { case: C }> }

type MetaValue = Exclude<MetaContent, { case: undefined }>['value']

/**
 * Case discriminator of a populated meta value.
 */
export type MetaCase = Exclude<MetaContent['case'], undefined>

/**
 * Creates a MetaCreator.
 */
export const makeMetaCreator = (init?: MessageInitShape<typeof MetaCreatorSchema>): MetaCreator => {
  return create(MetaCreatorSchema, init)
}

/**
 * Creates a MetaItem; set its typed value through the `content` oneof.
 */
export const makeMetaItem = (init?: MessageInitShape<typeof MetaItemSchema>): MetaItem => {
  return create(MetaItemSchema, init)
}

/**
 * Whether any meta of a case exists.
 */
export const hasMeta = (metas: MetaItem[], kind: MetaCase): boolean => {
  return metas.some((meta) => meta.content.case === kind)
}

/**
 * All metas of a case.
 */
export const getAllMeta = <C extends MetaCase>(metas: MetaItem[], kind: C): MetaItemOf<C>[] => {
  return metas.filter((meta): meta is MetaItemOf<C> => meta.content.case === kind)
}

/**
 * First meta of a case.
 */
export const getFirstMeta = <C extends MetaCase>(metas: MetaItem[], kind: C): MetaItemOf<C> | undefined => {
  return metas.find((meta): meta is MetaItemOf<C> => meta.content.case === kind)
}

/**
 * Typed value of a meta, undefined when empty.
 */
export const getMetaValue = (meta: MetaItem): MetaValue | undefined => {
  return meta.content.value
}

/**
 * All metas with the given original key.
 */
export const getMetaByKey = (metas: MetaItem[], key: string): MetaItem[] => {
  return metas.filter((meta) => meta.key === key)
}
