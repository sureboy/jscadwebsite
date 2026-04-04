<script lang="ts">
	import '../app.css'; 
	let { children } = $props();
</script>

<svelte:head>
 <link rel="manifest" href="./manifest.json">
 <link rel="canonical" href="https://solidjscad.com/">
 <meta name="keywords" content="参数化建模, 3D建模, 在线建模, JavaScript 3D, SolidJScad, 代码生成3D, STL导出, 三维设计, 开源建模工具">
 <meta name="description" content="SolidJScad – 高性能几何内核 + 模块化编程 + 完整工具链。
从浏览器在线编辑到本地 IDE 插件，让实体建模如编写 JavaScript 一样自然。" />
</svelte:head>

{@render children()}
