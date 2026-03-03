import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { DEFAULTS } from './shared/defaults'

const clientPort = parseInt(process.env.VIBECRAFT_CLIENT_PORT ?? String(DEFAULTS.CLIENT_PORT), 10)
const serverPort = parseInt(process.env.VIBECRAFT_PORT ?? String(DEFAULTS.SERVER_PORT), 10)

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*.ts', 'shared/**/*.ts'],
      rollupTypes: true,
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'shared'),
    },
  },
  define: {
    // Inject default port into frontend at build time
    __VIBECRAFT_DEFAULT_PORT__: serverPort,
  },
  server: {
    port: clientPort,
    host: true,
    proxy: {
      '/ws': {
        target: `ws://localhost:${serverPort}`,
        ws: true,
      },
      '/api': {
        target: `http://localhost:${serverPort}`,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'vibecraft',
      fileName: (format) => {
        if (format === 'es') return 'vibecraft.js'
        if (format === 'umd') return 'vibecraft.cjs'
        return `vibecraft.${format}.js`
      },
    },
    rollupOptions: {
      external: ['three', 'tone', 'ws', 'chokidar', '@deepgram/sdk'],
      output: {
        globals: {
          three: 'THREE',
          tone: 'Tone',
        },
      },
    },
  },
})
