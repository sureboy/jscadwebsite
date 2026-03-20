<script lang="ts">
  import { onMount } from 'svelte';
  import { initSolidPage} from './lib/ShowSolid.svelte';
    import {handleCurrentMsg} from './lib/function/ImportParser'
  //import {HandleMessageClass} from './lib/function/handleMessage' 
  import HandlePage,
  { 
    handleMsg,
    //HandleMessage,
    //Direction,
    solidConfig  
  } from './lib/HandleMessagePage.svelte'; 

  solidConfig.showMenu = -1
  onMount(() => {    
    initSolidPage(solidConfig) 
    const vscode =  (window as any).vscode
    solidConfig.postMessage =(e:{type:string,path?:string})=>{
      console.log("new post msg")
        if (e.path &&
    solidConfig.workermsg.windowConfig.includeImport && 
    solidConfig.workermsg.windowConfig.includeImport[e.path]   ){
       setTimeout(()=>{
            handleCurrentMsg({
                name:e.path,
                //db:window.localStorage.getItem(e.path)
              },
                solidConfig.postMessage
            ).getUri=async()=> new URL(
                  solidConfig.workermsg.windowConfig.includeImport[e.path]   ,
                  `http://localhost:${solidConfig.workermsg.windowConfig.port}`).toString();
             
        }) 
      return
    }
      vscode.postMessage(e)
    }
    vscode.postMessage({ 
      msg:{direction:handleMsg.Direction.map(v=>{ 
        return v.name}) }, 
      type:'loaded'
    });
    window.addEventListener('message', (event:any) => { 
      handleMsg.HandleMessage(event.data,solidConfig.postMessage)
    });
    return () =>{} 
  });  
</script> 

<HandlePage  ></HandlePage> 