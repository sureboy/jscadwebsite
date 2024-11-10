<script lang="ts"> 
import {mimeType} from "@jscad/stl-serializer"  
import {CSG2Three} from "$lib/function/csg2Three"   
import { page } from '$app/stores';
import {StoreCode3Dview,saveStorage,initMySolid,StoreAlertMsg,StoreMyClass,StoreInputCode,solid1} from "$lib/function/storage"
import {createSceneOBJ,onWindowResize} from "$lib/function/threeScene" 
import { createCanvasElement } from "three";
import { onMount ,onDestroy} from 'svelte';  
import type {CodeToWorker,WorkerMsg} from '$lib/function/share' 
import {  Modal,Spinner ,Textarea } from 'flowbite-svelte';  
import   QRCode  from 'qrcode';   
let container:HTMLElement; 
let qrcode:HTMLElement;
let worker:Worker|null
let formModal=false
let waitting = false
//let shareUrl = ""
let canvas:HTMLElement;

formModal = true 
waitting = true
onDestroy(()=>{
  if (worker) {
    worker.terminate();
  }
})
const getRemote = (k:string)=>{

  fetch(`https://stl.miguotuijian.cn/?url=${encodeURI($page.url.origin)}&k=${k}`).then((r)=>{     
    waitting =false 
    formModal=false
    r.arrayBuffer().then((v)=>{ 
      const fl = (new TextDecoder('utf-8')).decode(v).split("\n======\n")
      let codes = fl.slice(1)
      let titles = fl[0].split(",")
      const name = k.split("__")
      titles = titles.map((vn)=>{
        //vn = vn.split("_")[0]+"_"+name[1]
        let newName=vn.split("__")[0]+"__"+name[1]
   
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
      StoreInputCode.set(codes[0]);
  
    }).catch(e=>{
      console.log(e)
    })
  }).finally(()=>{
    waitting=false   
    formModal=false
  })
}
const getQrcode = (k:string,oldk:string)=>{
  //const k =hashName[1]   
  StoreInputCode.set(window.localStorage.getItem(oldk)||""); 
  QRCode.toCanvas(canvas, `${$page.url.origin}/#${k}`, function (error) {
    if (error) console.error(error)
    else{
      
      qrcode.appendChild(canvas!)
      console.log('success!');
    }   
    waitting=false         
  })
}
const updataCode = (hash:string)=>{ 
  if (hash){
    const hashName = hash.substring(1).split(":")
    if (hashName ){
      const firstName = hashName[0]
      switch (firstName) {
        case 'solid1':
          StoreInputCode.set(solid1);
          break
        case 'remote':
          if (hashName.length>1){
            getRemote(hashName[1])
            return
          }
          break      
        case 'qrcode':
          if (hashName.length>2){
            getQrcode(hashName[1],hashName[2])
            return
          }
          break
        default:
          const code = window.localStorage.getItem(hashName[0])
          if (code)
            StoreInputCode.set(code);
          else{
            getRemote(hashName[0])
            return
          }

          break
      }
    }  
  }  
  formModal=false
  waitting = false
}

onMount(()=>{    
  const el  =createCanvasElement() ;
  canvas =document.createElement("canvas")  
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
    //console.log(e)
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

<Modal bind:open={formModal} size="xs" autoclose class="w-full pointer-events-auto" > 
  <div bind:this={qrcode} class=" text-center " >    
    {#if waitting}
    <Spinner  color="green" />
    {/if}
  </div> 
</Modal> 