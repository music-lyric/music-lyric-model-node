import alias from '@rollup/plugin-alias'

import type { InputOptions, OutputOptions, Plugin } from 'rollup'

import { join } from 'node:path'
import { rollup } from 'rollup'
import { dts } from 'rollup-plugin-dts'

const root = process.cwd()

const NAMESPACES = ['common', 'runtime', 'storage'] as const

type Namespace = (typeof NAMESPACES)[number]

const absolute = (name: string): string => {
  return join(root, name).replace(/\\/g, '/')
}

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

const handleWarn: InputOptions['onwarn'] = (warning, warn) => {
  if (warning.code === 'AMBIGUOUS_EXTERNAL_NAMESPACES') {
    return
  }
  warn(warning)
}

const removeGeneratedTags = (code: string): string => {
  return code.replace(/^[ \t]*\*[ \t]*@generated from .*\r?\n/gm, '').replace(/\/\*\*[\s*]*\*\//g, '')
}
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

const barrelNamespaceOf = (id: string): Namespace | null => {
  const matched = id.replace(/\\/g, '/').match(/(?:^\.\/|^@root\/|\/src\/)(common|runtime|storage)(?:\/|$|\.ts$)/)
  return matched ? (matched[1] as Namespace) : null
}

const bundleNamespace = async (ns: Namespace): Promise<void> => {
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
    file: absolute(`dist/types/${ns}.d.ts`),
    format: 'es',
    paths: (id) => (refersToCommon(id) ? './common' : id),
  }

  const bundle = await rollup(input)
  await bundle.write(output)
  await bundle.close()
}

const bundleEntry = async (): Promise<void> => {
  const input: InputOptions = {
    input: absolute('src/index.ts'),
    onwarn: handleWarn,
    external: (id) => id.startsWith('@bufbuild/protobuf') || barrelNamespaceOf(id) !== null,
    plugins: [alias({ entries: [{ find: /^@root\//, replacement: `${absolute('src')}/` }] }), dts(), cleanGeneratedTags()],
  }

  const output: OutputOptions = {
    file: absolute('dist/types/index.d.ts'),
    format: 'es',
    paths: (id) => {
      const ns = barrelNamespaceOf(id)
      return ns ? `./${ns}` : id
    },
  }

  const bundle = await rollup(input)
  await bundle.write(output)
  await bundle.close()
}

const main = async (): Promise<void> => {
  for (const ns of NAMESPACES) {
    await bundleNamespace(ns)
  }
  await bundleEntry()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
