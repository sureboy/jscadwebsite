<script lang="ts">
  import { onMount } from 'svelte';
  import { initSolidPage} from './lib/ShowSolid.svelte';
  import HandlePage,{ HandleMessage,Direction,solidConfig} from './lib/HandleMessagePage.svelte';
  
  //import { vscode } from './lib/function/vscodeApi';
const vscode = (window as any).vscode
  solidConfig.showMenu = -1
  onMount(() => {
    
    initSolidPage(solidConfig) 
    solidConfig.postMessage = vscode.postMessage
    vscode.postMessage({ 
      msg:{direction:Direction.map(v=>{ 
        return v.name}),pageType:solidConfig.workermsg.pageType},
    //  supportsWebGPU: hasWebGPU,
      type:'loaded'
    });
    
    window.addEventListener('message', (event:any) => { 
      HandleMessage(event.data,vscode.postMessage)
    });
    return () =>{
      
    } 
  });  
</script> 
<HandlePage  ></HandlePage> 