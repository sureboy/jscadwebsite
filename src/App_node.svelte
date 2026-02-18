<script lang="ts" >
  import { onMount } from 'svelte';
  import {initSolidPage} from './lib/ShowSolid.svelte';
  import {MenuType} from './lib/function/utils'    
  import HandlePage,{ HandleMessage,Direction,solidConfig} from './lib/HandleMessagePage.svelte';
  solidConfig.oldMenu =MenuType.MainMenu | MenuType.Camera | MenuType.Gzip | MenuType.Png | MenuType.Stl;//  1 | (1<<1) | (1<<2) | (1<<3);
  /*
  solidConfig.postMessage = (e:{type:string,path?:string})=>{ 
        if (e.path){
            setTimeout(()=>{
                handleCurrentMsg({
                    name:e.path,
                    db:window.localStorage.getItem(e.path)},
                    solidConfig.postMessage
                )
            }) 
        }
    }
  */
  const loadedFetch = ()=>{
    fetch("/api",{
      method:"POST",
      headers: {
        "Content-Type": "application/json", 
      },
      body:JSON.stringify({ 
        msg: {direction:Direction.map(v=>{ 
          return v.name}),pageType:solidConfig.workermsg?.pageType||"run"}, 
        type:'loaded'
      })
    }).then(data=>{
      data.json().then(db=>{
        console.log("loaded",db)
        HandleMessage(db,solidConfig.postMessage)
      })
    })
  }

  onMount(() => {
    initSolidPage(solidConfig)
    loadedFetch();
  })
   
    
  </script> 
<HandlePage  ></HandlePage> 