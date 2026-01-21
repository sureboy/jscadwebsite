<script lang="ts">
	import '../app.css'; 
	let { children } = $props();
</script>

<svelte:head>
 <link rel="manifest" href="./manifest.json">
</svelte:head>

{@render children()}
