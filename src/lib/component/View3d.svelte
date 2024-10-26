<script lang="ts"> 
import {mimeType} from "@jscad/stl-serializer"  
import {CSG2Three} from "$lib/function/csg2Three"   

import {StoreCode3Dview,saveStorage,initMySolid,StoreAlertMsg,StoreMyClass,StoreInputCode,solid1} from "$lib/function/storage"
import {createSceneOBJ,onWindowResize} from "$lib/function/threeScene" 
import { createCanvasElement } from "three";
import { onMount ,onDestroy} from 'svelte';  
import type {CodeToWorker,WorkerMsg} from '$lib/function/share' 
let container:HTMLElement; 
let worker:Worker|null
onDestroy(()=>{
  if (worker) {
    worker.terminate();
  }
})
const updataCode = (hash:string)=>{
  //console.log(hash)
  if (!hash) return 
  if (hash==="#new"){
    StoreInputCode.set(solid1);
    return
  }
  const code = window.localStorage.getItem(hash.substring(1))
  if (code) StoreInputCode.set(code);
}

onMount(()=>{    
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
  window.addEventListener("hashchange", (e)=>{ 
    updataCode(new URL(e.newURL).hash)
  });
  updataCode(window.location.hash)
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
}
StoreCode3Dview.subscribe((t:CodeToWorker)=>{
  if (!worker)return 
  worker.postMessage(t)
  $StoreAlertMsg.waitting ==true   
  $StoreAlertMsg.errMsg=""
})
const WorkerInit =(el:HTMLCanvasElement)=>{
  let mesh:any[] = [] 
  //if (browser && window.Worker) {
  import('$workers/codeToThree.ts?worker').then((MyWorker)=>{
    worker = new MyWorker.default(); 
    worker.onmessage = function (e:MessageEvent<WorkerMsg>) { 
      $StoreAlertMsg.errMsg=""
      if(e.data.stl){
        downSTL(e.data.stl,e.data.name!) 
        $StoreAlertMsg.waitting = false;
        return 
      }
      if (e.data.ver){
        $StoreAlertMsg.waitting = true; 
        try{
          mesh.push(CSG2Three(e.data.ver,{}))
        }catch(e:any){
          $StoreAlertMsg.errMsg = e.toString()
        }         
        return
      }            
      if (el && mesh.length>0 ){
        try{
          createSceneOBJ(el!,mesh)
        }catch(e:any){
          $StoreAlertMsg.errMsg = e.toString()
        }
        
        mesh = []
      } 
      if (e.data.name){
        $StoreAlertMsg.name = e.data.name     
        if (e.data.code){
          saveStorage(e.data.name,e.data.code)
        }
      }
      if (e.data.errMsg){
        $StoreAlertMsg.errMsg = e.data.errMsg
      }
      if (e.data.Flist){    
        //console.log(e.data.Flist)
        StoreMyClass.update((v_:Map<string, any>)=>{      
          e.data.Flist!.forEach(v=>{
            //if (!v)return;
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