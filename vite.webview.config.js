import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path'; 
import copy from 'rollup-plugin-copy';
// https://vite.dev/config/
const outDir = path.resolve(__dirname, '../solidJSCADVscodeExtenstion/myModule/webui')
export default defineConfig({
  plugins: [svelte()],
  build: {
    //outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.js')
      },
      output: {
        dir:outDir,
        //minifyInternalExports:true,
        //file:'src/index.html',
        entryFileNames: 'main.js',
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'chunks/[name].js', 
        format: 'es'
      },
      plugins: [
        copy({
          targets: [
            { src: 'src/index.html', dest: outDir }  // 将 index.html 复制到 dist 目录
          ],
          hook: 'writeBundle',
        })
      ]
    }
  }
});