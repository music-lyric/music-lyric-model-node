import type { DescMessage, JsonValue, MessageShape } from '@bufbuild/protobuf'
import type { Time } from '@root/common/proto'

import * as Runtime from '@root/runtime/proto'
import * as Storage from '@root/storage/proto'

import { create, fromJson, toJson } from '@bufbuild/protobuf'

/**
 * Re-encode a message across two structurally identical schemas via protobuf JSON.
 *
 * Used for subtrees whose runtime and storage shapes are field-for-field identical.
 */
const reencode = <Src extends DescMessage, Dst extends DescMessage>(source: Src, target: Dst, message: MessageShape<Src>): MessageShape<Dst> => {
  return fromJson(target, toJson(source, message) as JsonValue)
}

/**
 * Convert a runtime AgentItem to its storage counterpart.
 */
const toStorageAgent = (agent: Runtime.AgentItem): Storage.AgentItem => {
  return reencode(Runtime.AgentItemSchema, Storage.AgentItemSchema, agent)
}

/**
 * Convert a storage AgentItem to its runtime counterpart.
 */
const toRuntimeAgent = (agent: Storage.AgentItem): Runtime.AgentItem => {
  return reencode(Storage.AgentItemSchema, Runtime.AgentItemSchema, agent)
}

/**
 * Convert a runtime Meta to its storage counterpart.
 */
const toStorageMeta = (meta: Runtime.Meta): Storage.Meta => {
  return reencode(Runtime.MetaSchema, Storage.MetaSchema, meta)
}

/**
 * Convert a storage Meta to its runtime counterpart.
 */
const toRuntimeMeta = (meta: Storage.Meta): Runtime.Meta => {
  return reencode(Storage.MetaSchema, Runtime.MetaSchema, meta)
}

/**
 * Convert a runtime Part to its storage counterpart.
 */
const toStoragePart = (part: Runtime.Part): Storage.Part => {
  return reencode(Runtime.PartSchema, Storage.PartSchema, part)
}

/**
 * Convert a storage Part to its runtime counterpart.
 */
const toRuntimePart = (part: Storage.Part): Runtime.Part => {
  return reencode(Storage.PartSchema, Runtime.PartSchema, part)
}

/**
 * Convert a runtime Word to its storage counterpart.
 */
const toStorageWord = (word: Runtime.Word): Storage.Word => {
  return reencode(Runtime.WordSchema, Storage.WordSchema, word)
}

/**
 * Convert a storage Word to its runtime counterpart.
 */
const toRuntimeWord = (word: Storage.Word): Runtime.Word => {
  return reencode(Storage.WordSchema, Runtime.WordSchema, word)
}

/**
 * Convert a runtime LineAnnotation to storage, dropping the runtime-only `derived` flag.
 */
const toStorageAnnotation = (annotation: Runtime.LineAnnotation): Storage.LineAnnotation => {
  return create(Storage.LineAnnotationSchema, {
    unknowns: annotation.unknowns.map((item) => ({ key: item.key, value: item.value })),
    translates: annotation.translates.map((item) => ({ language: item.language, content: item.content })),
    romans: annotation.romans.map((item) => ({ language: item.language, content: item.content })),
  })
}

/**
 * Convert a storage LineAnnotation to runtime; `derived` defaults to false.
 */
const toRuntimeAnnotation = (annotation: Storage.LineAnnotation): Runtime.LineAnnotation => {
  return create(Runtime.LineAnnotationSchema, {
    unknowns: annotation.unknowns.map((item) => ({ key: item.key, value: item.value })),
    translates: annotation.translates.map((item) => ({ language: item.language, content: item.content })),
    romans: annotation.romans.map((item) => ({ language: item.language, content: item.content })),
  })
}

/**
 * Convert a runtime LineContent to storage, folding in the line-level time and extra.
 *
 * Runtime keeps time and extra on the enclosing Line or LineBackground, while storage keeps them on the content; the runtime `languages` field has no storage counterpart and is dropped.
 */
const toStorageContent = (content: Runtime.LineContent | undefined, time: Time | undefined, extra: Record<string, string>): Storage.LineContent => {
  return create(Storage.LineContentSchema, {
    extra,
    time,
    agents: content?.agent ? [content.agent.id] : [],
    words: content?.words.map(toStorageWord) ?? [],
    annotation: content?.annotation ? toStorageAnnotation(content.annotation) : undefined,
  })
}

/**
 * Convert a storage LineContent to runtime; only the first agent id is kept and `languages` is left empty.
 *
 * A storage line may reference several agents, but a runtime line references at most one; extra agents are dropped.
 */
const toRuntimeContent = (content: Storage.LineContent): Runtime.LineContent => {
  return create(Runtime.LineContentSchema, {
    agent: content.agents.length ? { id: content.agents[0] } : undefined,
    words: content.words.map(toRuntimeWord),
    annotation: content.annotation ? toRuntimeAnnotation(content.annotation) : undefined,
  })
}

/**
 * Convert a runtime Line to storage.
 *
 * A normal line maps to a content plus its backgrounds; an interlude (or an unset body) maps to a line carrying only time and extra, with no words.
 */
const toStorageLine = (line: Runtime.Line): Storage.Line => {
  const part = line.part ? toStoragePart(line.part) : undefined

  if (line.body.case === 'normal') {
    const normal = line.body.value
    return create(Storage.LineSchema, {
      content: toStorageContent(normal.content, line.time, line.extra),
      backgrounds: normal.backgrounds.map((background) => toStorageContent(background.content, background.time, background.extra)),
      part,
    })
  }

  return create(Storage.LineSchema, {
    content: create(Storage.LineContentSchema, { time: line.time, extra: line.extra }),
    part,
  })
}

/**
 * Convert a storage Line to runtime.
 *
 * A line with no words is treated as an interlude; otherwise it becomes a normal line with its backgrounds.
 */
const toRuntimeLine = (line: Storage.Line): Runtime.Line => {
  const content = line.content
  const part = line.part ? toRuntimePart(line.part) : undefined
  const time = content?.time
  const extra = content?.extra ?? {}

  if (!content || content.words.length === 0) {
    return create(Runtime.LineSchema, { time, extra, part, body: { case: 'interlude', value: {} } })
  }

  return create(Runtime.LineSchema, {
    time,
    extra,
    part,
    body: {
      case: 'normal',
      value: {
        content: toRuntimeContent(content),
        backgrounds: line.backgrounds.map((background) => ({
          extra: background.extra,
          time: background.time,
          content: toRuntimeContent(background),
        })),
      },
    },
  })
}

/**
 * Convert a runtime Info to a storage Lyric.
 *
 * The Info must be valid, otherwise an error is thrown.
 */
export const infoToLyric = (info: Runtime.Info): Storage.Lyric => {
  if (info.type !== Runtime.InfoType.VALID) {
    throw new Error(`cannot convert Info to Lyric: expected a valid Info, got type ${Runtime.InfoType[info.type] ?? info.type}`)
  }

  return create(Storage.LyricSchema, {
    version: info.version,
    timing: info.timing,
    extra: info.extra,
    meta: info.meta ? toStorageMeta(info.meta) : undefined,
    agents: info.agents.map(toStorageAgent),
    lines: info.lines.map(toStorageLine),
  })
}

/**
 * Convert a storage Lyric to a runtime Info.
 *
 * The result is stamped valid.
 */
export const lyricToInfo = (lyric: Storage.Lyric): Runtime.Info => {
  return create(Runtime.InfoSchema, {
    version: lyric.version,
    type: Runtime.InfoType.VALID,
    timing: lyric.timing,
    extra: lyric.extra,
    meta: lyric.meta ? toRuntimeMeta(lyric.meta) : undefined,
    agents: lyric.agents.map(toRuntimeAgent),
    lines: lyric.lines.map(toRuntimeLine),
  })
}
