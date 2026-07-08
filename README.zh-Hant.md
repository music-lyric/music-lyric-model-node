# music-lyric-model-node

[English](./README.md) | [简体中文](./README.zh-Hans.md) | [繁體中文](./README.zh-Hant.md)

**music lyric model** 的 Node 綁定.

## 使用

從 npm 安裝:

```bash
npm install music-lyric-model
```

```ts
import { Runtime, Storage, Common } from 'music-lyric-model'

// Runtime —— 解析產物.
const info = Runtime.makeInfo({ timing: Common.Timing.WORD }) // 會蓋上當前的 SCHEMA_VERSION
const bytes = Runtime.encodeInfo(info) // Uint8Array
const json = Runtime.infoToJson(info) // JSON
const back = Runtime.decodeInfo(bytes)

// 安全解包 oneof 變體, 無需手寫 guard.
const normal = Runtime.asLineNormal(back.lines[0]) // LineNormal | undefined

// getWord* 同時接受 Word 容器或裸 WordNormal.
const word = Runtime.getLineWords(back.lines[0])[0]
Runtime.getWordDuration(word) // Word
Runtime.getWordDuration(Runtime.asWordNormal(word)!) // WordNormal

// Storage —— 儲存模型.
const lyric = Storage.makeLyric()
const stored = Storage.encodeLyric(lyric)
```

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

從 proto submodule 重新產生 `gen/` (需要 `buf`):

```bash
git submodule update --init --recursive   # 拉取 proto/
npm run generate
```

`npm run generate` 串聯 `generate:proto` 與 `generate:version`.

## 授權

基於 [MIT License](./LICENSE) 發布.
