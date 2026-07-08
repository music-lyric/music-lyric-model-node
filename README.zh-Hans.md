# music-lyric-model-node

[English](./README.md) | [简体中文](./README.zh-Hans.md) | [繁體中文](./README.zh-Hant.md)

**music lyric model** 的 Node 绑定.

## 使用

从 npm 安装:

```bash
npm install music-lyric-model
```

```ts
import { Runtime, Storage, Common } from 'music-lyric-model'

// Runtime —— 解析产物.
const info = Runtime.makeInfo({ timing: Common.Timing.WORD }) // 会盖上当前的 SCHEMA_VERSION
const bytes = Runtime.encodeInfo(info) // Uint8Array
const json = Runtime.infoToJson(info) // JSON
const back = Runtime.decodeInfo(bytes)

// 安全解包 oneof 变体, 无需手写 guard.
const normal = Runtime.asLineNormal(back.lines[0]) // LineNormal | undefined

// getWord* 同时接受 Word 容器或裸 WordNormal.
const word = Runtime.getLineWords(back.lines[0])[0]
Runtime.getWordDuration(word) // Word
Runtime.getWordDuration(Runtime.asWordNormal(word)!) // WordNormal

// Storage —— 存储模型.
const lyric = Storage.makeLyric()
const stored = Storage.encodeLyric(lyric)
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
