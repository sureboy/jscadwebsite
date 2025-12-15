<script lang="ts" >
  import favicon from './lib/assets/logo.png';
  import App_node  from './App_node.svelte';
  import App_webview  from './App_webview.svelte' 
</script>
<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
{#if ((window as any).vscode)}
<App_webview></App_webview>
{:else}
<App_node></App_node> 
{/if}