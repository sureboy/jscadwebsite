<!-- src/routes/+page.svelte -->
<script lang="ts" >
  import {codeFile} from '$lib/function/menuPanel'
  import CodeEditor ,{initEdit} from '$lib/CodeEditor.svelte';
  import { onMount } from 'svelte';
  onMount(() => {
    if (window.location.hash){
      codeFile.title = window.location.hash.slice(1)
      codeFile.value = window.localStorage.getItem(codeFile.title) || ""
      initEdit()
    }
    console.log(window.location.hash)
    //runCode();
  });
</script>
  <svelte:head><title>{codeFile.title}</title></svelte:head>
<CodeEditor  />
