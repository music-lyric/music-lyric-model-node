import PluginDts from 'vite-plugin-dts'

import { join } from 'node:path'
import { defineConfig } from 'vite'

const root = process.cwd()

const formatMap: Record<string, string> = {
  cjs: 'comm',
  es: 'ecma',
}

export default defineConfig({
  build: {
    lib: {
      entry: join(root, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName(format) {
        return `index.${formatMap[format] || format}.js`
      },
    },
    rollupOptions: {
      external: [/^@bufbuild\/protobuf/],
    },
    outDir: join(root, 'dist'),
    minify: 'esbuild',
    reportCompressedSize: false,
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@root': join(root, 'src'),
      '@gen': join(root, 'gen'),
    },
  },
  plugins: [PluginDts({ rollupTypes: true })],
})
