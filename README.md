# music-lyric-model-node

[English](./README.md) | [简体中文](./README.zh-Hans.md) | [繁體中文](./README.zh-Hant.md)

The Node binding for the **music lyric model**.

## Usage

Install from npm:

```bash
npm install music-lyric-model
```

### Root entry

The package root re-exports everything from `common`, `parsed`, and `storage`:

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
getWordDuration(word) // Word wrapper
getWordDuration(asWordNormal(word)!) // bare WordNormal

// Storage
const lyric = makeStorageLyric({ timing: Timing.WORD })
```

### Subpaths

| Import                      | Role              |
| --------------------------- | ----------------- |
| `music-lyric-model/common`  | Shared primitives |
| `music-lyric-model/parsed`  | Parse output      |
| `music-lyric-model/storage` | Persistence       |

```ts
// Shared
import { Timing, makeTime, makeWordNormal, getWordsText } from 'music-lyric-model/common'

// Parsed
import { makeParsedInfo, encodeParsedInfo, asParsedLineNormal, getParsedLineText, isParsedInfoValid } from 'music-lyric-model/parsed'

// Storage
import { makeStorageLyric, encodeStorageLyric, getStorageLineText, resolveLineAgents } from 'music-lyric-model/storage'
```

`parsed` and `storage` depend on `common` for shared types and helpers; they do not re-export each other. Import both subpaths (or the root) when you work across models.

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

Regenerate `gen` from the proto submodule (requires `buf`):

```bash
git submodule update --init --recursive
npm run generate
```

`npm run generate` chains `generate:proto` and `generate:version`.

## License

Released under the [MIT License](./LICENSE).
