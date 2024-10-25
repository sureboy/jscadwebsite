<script lang="ts">
 // import {show3d,saveSolid,showSolidFromString,solidLogo as solidBase, } from "./show3d"; 
 //import { browser } from '$app/environment'; 
  
 import {mimeType} from "@jscad/stl-serializer"  
 import {CSG2Three} from "$lib/function/csg2Three"   

 import {StoreCode3Dview,saveStorage,initMySolid,StoreAlertMsg,StoreMyClass} from "$lib/function/storage"
 import {createSceneOBJ,onWindowResize} from "$lib/function/threeScene" 
 import { createCanvasElement } from "three";
 import { onMount ,onDestroy} from 'svelte';  
 import type {CodeToWorker,WorkerMsg} from '$lib/function/share' 
  let container:HTMLElement;
 //export let inputList:Map<string, any> ;
  let worker:Worker|null
  onDestroy(()=>{
      if (worker) {
        worker.terminate();
      }
    })

  onMount(async()=>{    
    const el  =createCanvasElement() ;
    el.width = window.innerWidth;
    el.height = window.innerHeight;
    WorkerInit(el)
    window.addEventListener('resize', ()=>{
      el!.width = window.innerWidth;
      el!.height = window.innerHeight; 
      onWindowResize(el!)				
    });
    container.appendChild(el)    
  })
  const downSTL = (stl:BlobPart[],name:string)=>{
    const file = new File(stl,name+".stl", {
      type: mimeType,
    });
    //console.log(file)
    let aTag = document.createElement('a'); 
    aTag.download = file.name;
    let href = URL.createObjectURL(file); 
    aTag.href = href;
    aTag.click();
    URL.revokeObjectURL(href); 
    //$StoreAlertMsg.waitting = false;
  }
 

  const WorkerInit =(el:HTMLCanvasElement)=>{
    let mesh:any[] = [] 
    //if (browser && window.Worker) {
    import('$workers/codeToThree.ts?worker').then((MyWorker)=>{
      worker = new MyWorker.default(); 
      StoreCode3Dview.subscribe((t:CodeToWorker)=>{
        worker!.postMessage(t)
        $StoreAlertMsg.waitting ==true   
        $StoreAlertMsg.errMsg=""
      })
      worker.onmessage = function (e:MessageEvent<WorkerMsg>) { 
        $StoreAlertMsg.errMsg=""
        if(e.data.stl){
          downSTL(e.data.stl,e.data.name!) 
          $StoreAlertMsg.waitting = false;
          return 
        }
        if (e.data.ver){
          $StoreAlertMsg.waitting = true; 
          mesh.push(CSG2Three(e.data.ver,{}))
          return
        }            
        if (el && mesh.length>0 ){
          createSceneOBJ(el!,mesh)
          mesh = []
        } 
        if (e.data.code && e.data.name){
          saveStorage(e.data.name,e.data.code)
        }
        if (e.data.errMsg){
          $StoreAlertMsg.errMsg = e.data.errMsg
        }
        if (e.data.Flist){    
          //console.log(e.data.Flist)
          StoreMyClass.update((v_:Map<string, any>)=>{      
            e.data.Flist!.forEach(v=>{
              if (!v)return;
              v_.set(v[0],v[1]);
            });
            //v_.delete("constructor")
            return v_ 
          }) 
        }
        $StoreAlertMsg.waitting = false; 
      };
      initMySolid((v,k)=>{
        worker!.postMessage({code:v,name:k,show:false})
      })

    }) 
  }
</script>
<div bind:this={container}  class=" h-full w-full z-0 absolute top-0 left-0" > 

</div>