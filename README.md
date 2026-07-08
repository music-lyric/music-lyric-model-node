# music-lyric-model-node

[English](./README.md) | [简体中文](./README.zh-Hans.md) | [繁體中文](./README.zh-Hant.md)

The Node binding for the **music lyric model**.

## Usage

Install from npm:

```bash
npm install music-lyric-model
```

```ts
import { Runtime, Storage, Common } from 'music-lyric-model'

// Runtime — the parse output.
const info = Runtime.makeInfo({ timing: Common.Timing.WORD }) // stamps the current SCHEMA_VERSION
const bytes = Runtime.encodeInfo(info) // Uint8Array
const json = Runtime.infoToJson(info) // JSON
const back = Runtime.decodeInfo(bytes)

// Safe oneof unwrap, no hand-written guard.
const normal = Runtime.asLineNormal(back.lines[0]) // LineNormal | undefined

// getWord* accept either the Word wrapper or a bare WordNormal.
const word = Runtime.getLineWords(back.lines[0])[0]
Runtime.getWordDuration(word) // Word
Runtime.getWordDuration(Runtime.asWordNormal(word)!) // WordNormal

// Storage — the persistence model.
const lyric = Storage.makeLyric()
const stored = Storage.encodeLyric(lyric)
```

## Build

### Requirements

- Node.js ≥ 22

### npm

Install dependencies and build:

```bash
npm install
npm run build
```

`npm test` runs the test suite.

### Generate

Regenerate `gen/` from the proto submodule (requires `buf`):

```bash
git submodule update --init --recursive   # fetch proto/
npm run generate
```

`npm run generate` chains `generate:proto` and `generate:version`.

## License

Released under the [MIT License](./LICENSE).
