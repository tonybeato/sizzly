import dts from 'vite-plugin-dts'
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command }) => {
  const isServe = command === 'serve';

  return {
    root: isServe ? 'playground' : '.',
    server: { open: true },
    resolve: {
      alias: {
        sizzly: path.resolve(__dirname, isServe ? 'src' : 'dist')
      }
    },
    plugins: [
      dts({
        entryRoot: 'src',
        outDir: 'dist',
        insertTypesEntry: true,
      })
    ],
    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'Sizzly',
        fileName: (f) => (f === 'cjs' ? 'sizzly.cjs' : 'sizzly.js'),
        formats: ['es', 'cjs'],
      },
      sourcemap: true
    }
  };
});
