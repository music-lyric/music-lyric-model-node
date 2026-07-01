# music-lyric-model-node

[English](./README.md) | [简体中文](./README.zh-Hans.md) | [繁體中文](./README.zh-Hant.md)

**music lyric model** 的 Node 绑定.

## 使用

从 npm 安装:

```bash
npm install music-lyric-model
```

```ts
import { makeInfo, encodeInfo, decodeInfo, infoToJson, infoFromJson, InfoType } from 'music-lyric-model'

// makeInfo 会盖上当前的 SCHEMA_VERSION.
const info = makeInfo()
info.type = InfoType.NORMAL

const bytes = encodeInfo(info) // Uint8Array
const json = infoToJson(info) // JSON

const fromBytes = decodeInfo(bytes)
const fromJson = infoFromJson(json)
```

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

从 proto submodule 重新生成 `gen/` (需要 `buf`):

```bash
git submodule update --init --recursive   # 拉取 proto/
npm run generate
```

`npm run generate` 串联 `generate:proto` 和 `generate:version`.

## 许可证

基于 [MIT License](./LICENSE) 发布.
