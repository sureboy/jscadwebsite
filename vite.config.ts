import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite'; 
import { nodePolyfills } from 'vite-plugin-node-polyfills'
export default defineConfig({
	plugins: [
		sveltekit(),
		    nodePolyfills({
      // 只提供 module 模块的 polyfill，或者不提供任何 polyfill 只是阻止报错
      include: ["module"], // 不包含任何实际的 polyfill
    }),
	] ,
	optimizeDeps: {
    	exclude: ['manifold-3d']
  	},
 
	resolve: {
    alias: {
      // 将 module 模块的引用指向一个空模块
      module: 'rollup-plugin-node-polyfills/polyfills/empty.js', // 或者创建一个空文件
    }
  }
});
