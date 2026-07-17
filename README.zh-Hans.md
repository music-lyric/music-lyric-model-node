# music-lyric-model-node

[English](./README.md) | [简体中文](./README.zh-Hans.md) | [繁體中文](./README.zh-Hant.md)

**music lyric model** 的 Node 绑定.

## 使用

从 npm 安装:

```bash
npm install music-lyric-model
```

### 根入口

包根会 re-export `common`、`parsed`、`storage` 的全部内容:

```ts
import {
  Timing,
  asParsedLineNormal,
  asWordNormal,
  encodeParsedInfo,
  getParsedLineText,
  getParsedLineWords,
  getWordDuration,
  makeParsedInfo,
  makeStorageLyric,
  makeWordNormal,
} from 'music-lyric-model'

// Parsed
const info = makeParsedInfo({ timing: Timing.WORD })
const bytes = encodeParsedInfo(info)

const normal = asParsedLineNormal(info.lines[0])
const word = getParsedLineWords(info.lines[0])[0]
getWordDuration(word) // Word 容器
getWordDuration(asWordNormal(word)!) // 裸 WordNormal

// Storage
const lyric = makeStorageLyric({ timing: Timing.WORD })
```

### 子路径

| 导入                        | 作用     |
| --------------------------- | -------- |
| `music-lyric-model/common`  | 共享原语 |
| `music-lyric-model/parsed`  | 解析产物 |
| `music-lyric-model/storage` | 持久化   |

```ts
// 共享
import { Timing, makeTime, makeWordNormal, getWordsText } from 'music-lyric-model/common'

// Parsed
import { makeParsedInfo, encodeParsedInfo, asParsedLineNormal, getParsedLineText, isParsedInfoValid } from 'music-lyric-model/parsed'

// Storage
import { makeStorageLyric, encodeStorageLyric, getStorageLineText, resolveLineAgents } from 'music-lyric-model/storage'
```

`parsed` 与 `storage` 会依赖 `common` 的共享类型与 helper, 但互不 re-export. 跨模型时请同时 import 两个子路径 (或直接用根入口).

## 构建

### 环境要求

- Node.js ≥ 22

### npm

安装依赖并构建:

```bash
npm install
npm run build
```

`npm test` 运行测试.

### 生成

从 proto submodule 重新生成 `gen` (需要 `buf`):

```bash
git submodule update --init --recursive
npm run generate
```

`npm run generate` 串联 `generate:proto` 和 `generate:version`.

## 许可证

基于 [MIT License](./LICENSE) 发布.
