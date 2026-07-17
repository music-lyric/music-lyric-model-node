import alias from '@rollup/plugin-alias'
import { build } from 'vite'

import type { InputOptions, OutputOptions, Plugin } from 'rollup'

import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { rollup } from 'rollup'
import { dts } from 'rollup-plugin-dts'

const root = process.cwd()

const formatMap: Record<string, string> = {
  cjs: 'comm',
  es: 'ecma',
}

const NAMESPACES = ['common', 'parsed', 'storage'] as const

type Namespace = (typeof NAMESPACES)[number]

const entries = [
  { name: 'index', file: 'src/index.ts' },
  { name: 'common/index', file: 'src/common/index.ts' },
  { name: 'parsed/index', file: 'src/parsed/index.ts' },
  { name: 'storage/index', file: 'src/storage/index.ts' },
] as const

/**
 * Absolute path with forward slashes for rollup.
 */
const absolute = (name: string): string => {
  return join(root, name).replace(/\\/g, '/')
}

/**
 * Whether an import id points at the common package surface.
 */
const refersToCommon = (id: string): boolean => {
  const path = id.replace(/\\/g, '/')
  return (
    path === '@root/common' ||
    path.startsWith('@root/common/') ||
    path.startsWith('@gen/common/') ||
    path.includes('/gen/common/') ||
    /\/src\/common(?:\/index)?(?:\.ts)?$/.test(path)
  )
}

/**
 * Suppress rollup-plugin-dts noise from ambiguous namespace re-exports.
 */
const handleWarn: InputOptions['onwarn'] = (warning, warn) => {
  if (warning.code === 'AMBIGUOUS_EXTERNAL_NAMESPACES') {
    return
  }
  warn(warning)
}

/**
 * Drop protoc-gen-es @generated tags from declaration output.
 */
const removeGeneratedTags = (code: string): string => {
  return code.replace(/^[ \t]*\*[ \t]*@generated from .*\r?\n/gm, '').replace(/\/\*\*[\s*]*\*\//g, '')
}

/**
 * Rollup plugin that cleans generated doc tags from declaration chunks.
 */
const cleanGeneratedTags = (): Plugin => {
  return {
    name: 'remove-generated-tags',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk') {
          file.code = removeGeneratedTags(file.code)
        }
      }
    },
  }
}

/**
 * Map an import id to a package namespace barrel, if any.
 */
const barrelNamespaceOf = (id: string): Namespace | null => {
  const matched = id.replace(/\\/g, '/').match(/(?:^\.\/|^@root\/|\/src\/)(common|parsed|storage)(?:\/|$|\.ts$)/)
  return matched ? (matched[1] as Namespace) : null
}

/**
 * Build one library entry with shared modules inlined.
 */
const buildJsEntry = async (name: string, file: string): Promise<void> => {
  await build({
    configFile: false,
    build: {
      lib: {
        entry: { [name]: join(root, file) },
        formats: ['es', 'cjs'],
        fileName(format) {
          const suffix = formatMap[format] || format
          return `${name}.${suffix}.js`
        },
      },
      rollupOptions: {
        external: [/^@bufbuild\/protobuf/],
      },
      outDir: join(root, 'dist'),
      emptyOutDir: false,
      minify: 'esbuild',
      reportCompressedSize: false,
      sourcemap: true,
    },
    resolve: {
      alias: {
        '@root': join(root, 'src'),
        '@gen': join(root, 'gen'),
      },
    },
  })
}

/**
 * Bundle one namespace into dist/<ns>/index.d.ts.
 */
const bundleDtsNamespace = async (ns: Namespace): Promise<void> => {
  const input: InputOptions = {
    input: absolute(`src/${ns}/index.ts`),
    onwarn: handleWarn,
    external: (id) => id.startsWith('@bufbuild/protobuf') || (ns !== 'common' && refersToCommon(id)),
    plugins: [
      alias({
        entries: [
          { find: /^@root\//, replacement: `${absolute('src')}/` },
          { find: /^@gen\//, replacement: `${absolute('gen')}/` },
        ],
      }),
      dts(),
      cleanGeneratedTags(),
    ],
  }

  const output: OutputOptions = {
    file: absolute(`dist/${ns}/index.d.ts`),
    format: 'es',
    paths: (id) => (refersToCommon(id) ? '../common/index' : id),
  }

  const bundle = await rollup(input)
  await bundle.write(output)
  await bundle.close()
}

/**
 * Bundle the package root into dist/index.d.ts.
 */
const bundleDtsEntry = async (): Promise<void> => {
  const input: InputOptions = {
    input: absolute('src/index.ts'),
    onwarn: handleWarn,
    external: (id) => id.startsWith('@bufbuild/protobuf') || barrelNamespaceOf(id) !== null,
    plugins: [alias({ entries: [{ find: /^@root\//, replacement: `${absolute('src')}/` }] }), dts(), cleanGeneratedTags()],
  }

  const output: OutputOptions = {
    file: absolute('dist/index.d.ts'),
    format: 'es',
    paths: (id) => {
      const ns = barrelNamespaceOf(id)
      return ns ? `./${ns}/index` : id
    },
  }

  const bundle = await rollup(input)
  await bundle.write(output)
  await bundle.close()
}

/**
 * Build JS and declaration files for every public entry.
 */
const main = async (): Promise<void> => {
  await rm(join(root, 'dist'), { recursive: true, force: true })

  for (const entry of entries) {
    await buildJsEntry(entry.name, entry.file)
  }

  for (const ns of NAMESPACES) {
    await bundleDtsNamespace(ns)
  }
  await bundleDtsEntry()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
