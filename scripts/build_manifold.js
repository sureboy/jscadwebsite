import esbuild from "esbuild"
await esbuild.build({
  entryPoints: ['./node_modules/manifold-3d/manifold.js'],
  outfile: './static/lib/manifold.esm.js',
  platform: 'browser', // 目标是浏览器
  format: 'esm',       // 输出 ESM 格式
  bundle: true,
  // 排除 Node 内置模块，避免打包报错
  external: ['module', 'fs', 'path', 'process'],
  // 可选：替换 process 等全局变量（浏览器无 process）
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});