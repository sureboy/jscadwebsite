<script lang="ts">
  import { onMount } from 'svelte';
  import { initSolidPage} from './lib/ShowSolid.svelte';
  import HandlePage,
  { 
    HandleMessage,
    Direction,
    solidConfig
  } from './lib/HandleMessagePage.svelte';
  //
  solidConfig.showMenu = -1
  onMount(() => {    
    initSolidPage(solidConfig) 
    const vscode =  (window as any).vscode
    solidConfig.postMessage =  vscode.postMessage
    vscode.postMessage({ 
      msg:{direction:Direction.map(v=>{ 
        return v.name}),pageType:solidConfig.workermsg?.pageType||"run"}, 
      type:'loaded'
    });
    
    window.addEventListener('message', (event:any) => { 
      HandleMessage(event.data,vscode.postMessage)
    });
    return () =>{} 
  });  
</script> 

<HandlePage  ></HandlePage> 