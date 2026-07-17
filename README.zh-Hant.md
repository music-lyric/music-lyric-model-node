# music-lyric-model-node

[English](./README.md) | [简体中文](./README.zh-Hans.md) | [繁體中文](./README.zh-Hant.md)

**music lyric model** 的 Node 綁定.

## 使用

從 npm 安裝:

```bash
npm install music-lyric-model
```

### 根入口

套件根會 re-export `common`、`parsed`、`storage` 的全部內容:

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

### 子路徑

| 匯入                        | 作用     |
| --------------------------- | -------- |
| `music-lyric-model/common`  | 共享原語 |
| `music-lyric-model/parsed`  | 解析產物 |
| `music-lyric-model/storage` | 持久化   |

```ts
// 共享
import { Timing, makeTime, makeWordNormal, getWordsText } from 'music-lyric-model/common'

// Parsed
import { makeParsedInfo, encodeParsedInfo, asParsedLineNormal, getParsedLineText, isParsedInfoValid } from 'music-lyric-model/parsed'

// Storage
import { makeStorageLyric, encodeStorageLyric, getStorageLineText, resolveLineAgents } from 'music-lyric-model/storage'
```

`parsed` 與 `storage` 會依賴 `common` 的共享型別與 helper, 但互不 re-export. 跨模型時請同時 import 兩個子路徑 (或直接用根入口).

## 建置

### 環境需求

- Node.js ≥ 22

### npm

安裝依賴並建置:

```bash
npm install
npm run build
```

`npm test` 執行測試.

### 產生

從 proto submodule 重新產生 `gen` (需要 `buf`):

```bash
git submodule update --init --recursive
npm run generate
```

`npm run generate` 串聯 `generate:proto` 與 `generate:version`.

## 授權

基於 [MIT License](./LICENSE) 發布.
