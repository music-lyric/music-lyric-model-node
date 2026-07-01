# music-lyric-model-node

[English](./README.md) | [简体中文](./README.zh-Hans.md) | [繁體中文](./README.zh-Hant.md)

**music lyric model** 的 Node 綁定.

## 使用

從 npm 安裝:

```bash
npm install music-lyric-model
```

```ts
import { makeInfo, encodeInfo, decodeInfo, infoToJson, infoFromJson, InfoType } from 'music-lyric-model'

// makeInfo 會蓋上當前的 SCHEMA_VERSION.
const info = makeInfo()
info.type = InfoType.NORMAL

const bytes = encodeInfo(info) // Uint8Array
const json = infoToJson(info) // JSON

const fromBytes = decodeInfo(bytes)
const fromJson = infoFromJson(json)
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
