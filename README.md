# music-lyric-model-node

[English](./README.md) | [简体中文](./README.zh-Hans.md) | [繁體中文](./README.zh-Hant.md)

The Node binding for the **music lyric model**.

## Usage

Install from npm:

```bash
npm install music-lyric-model
```

```ts
import { makeInfo, encodeInfo, decodeInfo, infoToJson, infoFromJson, InfoType } from 'music-lyric-model'

// makeInfo stamps the current SCHEMA_VERSION.
const info = makeInfo()
info.type = InfoType.NORMAL

const bytes = encodeInfo(info) // Uint8Array
const json = infoToJson(info) // JSON

const fromBytes = decodeInfo(bytes)
const fromJson = infoFromJson(json)
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
