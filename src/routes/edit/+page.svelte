<!-- src/routes/+page.svelte -->
<script lang="ts" >
    import CodeEditor ,{codeFile,initEdit} from '$lib/components/CodeEditor.svelte';
    import { onMount } from 'svelte';
    
    //let codeFile = $state({title:"edit",value:"test"});
    
     
    //let title = $state("edit")
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
