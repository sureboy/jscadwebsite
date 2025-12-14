<script lang="ts" >
  import { onMount } from 'svelte';
  import {initSolidPage} from './lib/ShowSolid.svelte';
  //import Menu  from './lib/Menu.svelte'
  //import { CSG2Three } from "./lib/function/csg2Three";
  //import {runWorker} from "./lib/function/worker"
  import type { workerConfigType } from './lib/function/utils';
  import {MenuType} from './lib/function/utils'
    
  import HandlePage,{ HandleMessage,Direction,solidConfig} from './lib/HandleMessagePage.svelte';
    import MainMenu from './lib/MainMenu.svelte';
  //import {onWindowResize,startSceneOBJ,addSceneOBJ} from "./lib/function/threeScene" ;
  solidConfig.setWorkerMsg = (w:workerConfigType)=>{ 
    solidConfig.workermsg = w
  }
  solidConfig.oldMenu =MenuType.MainMenu | MenuType.Camera | MenuType.Gzip | MenuType.Png | MenuType.Stl;//  1 | (1<<1) | (1<<2) | (1<<3);
  const loadedFetch = ()=>{
    fetch("/api",{
      method:"POST",
      headers: {
        "Content-Type": "application/json", 
      },
      body:JSON.stringify({ 
      msg: {direction:Direction.map(v=>{ 
        return v.name}),pageType:solidConfig.workermsg.pageType||"run"}, 
      type:'loaded'
    })
    }).then(data=>{
      data.json().then(db=>{
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