<script lang="ts">
	import '../app.css'; 
	let { children } = $props();
</script>

<svelte:head>
 <link rel="manifest" href="./manifest.json">
 <link rel="canonical" href="https://solidjscad.com/">
 <meta name="keywords" content="参数化建模, 3D建模, 在线建模, JavaScript 3D, SolidJScad, 代码生成3D, STL导出, 三维设计, 开源建模工具">
 <meta name="description" content="SolidJScad – 基于 JavaScript 的在线参数化 3D 建模平台。无需安装，实时编写代码即可生成复杂三维模型，支持 STL/3mf 导出，适合设计师、工程师和创客。" />
</svelte:head>

{@render children()}
