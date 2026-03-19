import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite'; 
export default defineConfig({
	plugins: [
		sveltekit()
	] ,
	optimizeDeps: {
    	exclude: ['manifold-3d']
  	},
	build: {
    	rollupOptions: {
      		external: ['module'] // 明确将 'module' 标记为外部依赖
    	}
  	}
});
