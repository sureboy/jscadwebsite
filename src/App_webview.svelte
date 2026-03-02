<script lang="ts">
  import { onMount } from 'svelte';
  import { initSolidPage} from './lib/ShowSolid.svelte';
  //import {HandleMessageClass} from './lib/function/handleMessage' 
  import HandlePage,
  { 
    handleMsg,
    //HandleMessage,
    //Direction,
    solidConfig  
  } from './lib/HandleMessagePage.svelte';
  //
  //const solidConfig = $state(conf)
  //const handleMsg =new HandleMessageClass(solidConfig)
  solidConfig.showMenu = -1
  onMount(() => {    
    initSolidPage(solidConfig) 
    const vscode =  (window as any).vscode
    solidConfig.postMessage =  vscode.postMessage
    vscode.postMessage({ 
      msg:{direction:handleMsg.Direction.map(v=>{ 
        return v.name}) }, 
      type:'loaded'
    });
    
    window.addEventListener('message', (event:any) => { 
      handleMsg.HandleMessage(event.data,vscode.postMessage)
    });
    return () =>{} 
  });  
</script> 

<HandlePage  ></HandlePage> 