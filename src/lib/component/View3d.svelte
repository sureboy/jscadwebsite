<script lang="ts"> 
import {mimeType} from "@jscad/stl-serializer"  
import {CSG2Three} from "$lib/function/csg2Three"   
import { page } from '$app/stores';
import {StoreCode3Dview,saveStorage,initMySolid,StoreAlertMsg,StoreMyClass,StoreInputCode,solid1} from "$lib/function/storage"
import {createSceneOBJ,onWindowResize} from "$lib/function/threeScene" 
import { createCanvasElement } from "three";
import { onMount ,onDestroy} from 'svelte';  
import type {CodeToWorker,WorkerMsg} from '$lib/function/share' 
import {  Modal  } from 'flowbite-svelte';  
let container:HTMLElement; 
let worker:Worker|null
let formModal=false
onDestroy(()=>{
  if (worker) {
    worker.terminate();
  }
})
const updataCode = (hash:string)=>{
  //console.log(hash)
  if (!hash) return 
  const halist = hash.substring(1).split(":")
  if (!halist )return;
  if (halist[0]==="remote"){

    fetch(`https://stl.miguotuijian.cn?url=${encodeURI($page.url.origin)}&k=${halist[1]}`).then((r)=>{      
      r.arrayBuffer().then((v)=>{ 
        const fl = (new TextDecoder('utf-8')).decode(v).split("\n======\n")
        let codes = fl.slice(1)
        let titles = fl[0].split(",")
        if (halist.length===3 && halist[2]==="QR"){
          formModal=true

        }else{
          titles = titles.map((vn)=>{
            let newName=vn
            for (let n = 1;;n++){            
              if (!window.localStorage.getItem(newName))break;
              newName = vn+"_"+n
            }    
            //console.log(vn,newName)     
            if (vn !== newName){
              codes = codes.map((code_val)=>{
                return code_val.replaceAll(vn,newName)
              })
            } 
            return newName
          })
          titles.forEach((codeN,i)=>{
            window.localStorage.setItem(codeN,codes[i])
            console.log(codeN,codes[i])
            worker!.postMessage({code:codes[i],name:codeN,show:false})
          })
        }
        StoreInputCode.set(codes[0]);
        //console.log(v)
      })
    })
  }else{
    const code = window.localStorage.getItem(halist[0])
    if (code) StoreInputCode.set(code);
  }

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
    updataCode(window.location.hash)
  }) 
}
</script>
<div bind:this={container}  class=" h-full w-full z-0 absolute top-0 left-0" > 

</div>
<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full pointer-events-auto" ></Modal> 