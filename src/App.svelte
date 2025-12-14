<script lang="ts" >
  import App_node  from './App_node.svelte';
  import App_webview  from './App_webview.svelte' 
</script>
{#if ((window as any).vscode)}
<App_webview></App_webview>
{:else}
<App_node></App_node> 
{/if}