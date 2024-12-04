<script context="module" lang="ts" >
 let el:HTMLCanvasElement|null; 
 let size:any
 export const screenHandle = (e:any)=>{
    //console.log(elCanvas)
    console.log(size)
    el?.toBlob((blob:any)=>{ 
        let aTag = document.createElement('a'); 
        aTag.download = e.detail.name+"_screen.png";
        let href = URL.createObjectURL(blob); 
        console.log(href)
        aTag.href = href;
        aTag.click();
        URL.revokeObjectURL(href);  		
      })
  }
</script>
<script lang="ts"> 
import {mimeType} from "@jscad/stl-serializer"  
import {CSG2Three,getMesh} from "$lib/function/csg2Three"   
import { page } from '$app/stores';
import {StoreCode3Dview,saveStorage,initMySolid,StoreAlertMsg,StoreMyClass,StoreInputCode,solid} from "$lib/function/storage"
import {onWindowResize,startSceneOBJ,addSceneOBJ} from "$lib/function/threeScene" 
import { createCanvasElement } from "three";
import { onMount ,onDestroy} from 'svelte';  
import type {CodeToWorker,WorkerMsg} from '$lib/function/share' 
import {  Modal,Spinner ,Button } from 'flowbite-svelte';  
import   QRCode  from 'qrcode';   
let container:HTMLElement; 
let qrcode:HTMLElement;
let worker:SharedWorker|Worker|null
//let mesh:any[] =  []
let formModal=false
let waitting = false
//let shareUrl = ""
let canvas:HTMLElement;
let remoteName = ""
formModal = true 
waitting = true


onDestroy(()=>{
  if (worker && worker instanceof Worker) {
    worker.terminate();
  }
})
const workerPostMessage = (v:any)=>{
  if (worker){
    
    //if (el){
    //  startSceneOBJ(el)
      //$StoreAlertMsg.waitting = true   
    //}
    if (worker instanceof Worker)
      worker.postMessage(v)
    else
      worker.port.postMessage(v)
  }    
}
const getRemote = (k:string)=>{

  fetch(`https://db.solidjscad.com/?url=${encodeURI($page.url.origin)}&k=${k}`).then((r)=>{     
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
        //console.log(codeN,codes[i])
        workerPostMessage({code:codes[i],name:codeN,show:false})
            
      })
      workerPostMessage({code:codes[0],name:titles[0],show:true})
      //StoreInputCode.set(codes[0]);
  
    }).catch(e=>{
      console.log(e)
    })
  }).catch(()=>{

  }).finally(()=>{
    waitting=false   
    formModal=false
  })
}
const getQrcode = (k:string,oldk:string)=>{
  //const k =hashName[1]   
  workerPostMessage({code:window.localStorage.getItem(oldk),name:oldk,show:true})
  //StoreInputCode.set(window.localStorage.getItem(oldk)||""); 
  //$StoreAlertMsg.name = oldk
  remoteName = "#"+k
  QRCode.toCanvas(canvas, `${$page.url.origin}/#${k}`, function (error) {
    if (error) console.error(error)
    else{      
      qrcode.appendChild(canvas!)
      //console.log('success!');
    }   
    waitting=false         
  })
}
const updataCode = (hash:string)=>{ 
  if (hash){
    StoreInputCode.set("");   
    //console.log(hash)
    const hashName = hash.substring(1).split(":") 
    const firstName = hashName[0]
    switch (firstName) {
      case 'new':
        let name = "solid__"+new Date().getTime().toString(36).substring(2)
        let code_ = solid(name)
        StoreInputCode.set(code_);
        StoreCode3Dview.set({code:code_,show:true,name:name})
        $StoreAlertMsg.name = name
        break
      case 'qrcode':
        if (hashName.length>2){
          getQrcode(hashName[1],hashName[2])
          return
        }
        break
      default:
        const code = window.localStorage.getItem(firstName)
        if (!code){   
          getRemote(firstName)
          //return
        }else
        StoreCode3Dview.set({code,show:true,name:firstName})
        //StoreInputCode.set(code);
        break
    }
  
  //}else{
    //StoreInputCode.set(window.localStorage.getItem("solid")||solid());
  }

  
  
  
  formModal=false
  waitting = false
}

onMount(()=>{    
  el = createCanvasElement() ;
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

const downSTL = (stl: BlobPart[],name:string)=>{
 
  const file = new File( stl,name+".stl", {
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
  workerPostMessage(t) 
  $StoreAlertMsg.name = t.name || ""
  $StoreAlertMsg.errMsg = ""
})
const workerMessage = (e:MessageEvent<WorkerMsg>)=>{ 
  if (e.data.errMsg){
    //$StoreAlertMsg.waitting = false;
    $StoreAlertMsg.errMsg += e.data.errMsg +"\n"
  }
  if(e.data.stl){
    downSTL(e.data.stl,e.data.name!)  
    $StoreAlertMsg.waitting = false;
    return 
  }
  if (e.data.start && el){
    startSceneOBJ(el) 
  }
  if (e.data.ver){
    $StoreAlertMsg.waitting = true; 
    try{
      if (el){
        addSceneOBJ(el,CSG2Three(e.data.ver, {} )) 
        //console.log("mesh",e.data.mesh)
      }
     
    }catch(e:any){
      $StoreAlertMsg.errMsg = e.toString()
    }         
    return
  }            
  //console.log(e.data)
  if (e.data.end){
    $StoreAlertMsg.waitting = false; 
    if (el)   onWindowResize(el)	
   
  } 
  if (e.data.name){
    $StoreAlertMsg.name = e.data.name     
    if (e.data.code){

      saveStorage(e.data.name,e.data.code)
    }
    //$StoreAlertMsg.waitting = false; 
  }

  if (e.data.Flist){    
    $StoreAlertMsg.waitting = true; 
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
  //$StoreAlertMsg.waitting = false; 
}

const WorkerInit_ =(el:HTMLCanvasElement)=>{
  import('$workers/codeToThree.ts?worker').then((MyWorker)=>{
      worker = new MyWorker.default(); 
      worker.onmessage = (e:MessageEvent<WorkerMsg>)=> { 
        workerMessage(e)
      }; 
      initMySolid((v,k)=>{
        workerPostMessage({code:v,name:k,show:false})
      })
      updataCode(window.location.hash)
    }).catch(e=>{
      $StoreAlertMsg.errMsg = e.toString()
    })
}
const WorkerInit =(el:HTMLCanvasElement)=>{
  //let mesh:any[] = [] 
  //if (browser && window.Worker) {
  import('$workers/codeToThree.ts?sharedworker').then((MyWorker)=>{
    worker = new MyWorker.default(); 
    worker.port.onmessage = (e:MessageEvent<WorkerMsg>)=> { 
      workerMessage(e)
    }; 
    //worker.port.start();
    initMySolid((v,k)=>{
      workerPostMessage({code:v,name:k,show:false})
    })
    updataCode(window.location.hash)
  }).catch(()=>{
    //$StoreAlertMsg.errMsg = e.toString()
    import('$workers/codeToThree.ts?worker').then((MyWorker)=>{
      worker = new MyWorker.default(); 
      worker.onmessage = (e:MessageEvent<WorkerMsg>)=> { 
        workerMessage(e)
      }; 
      initMySolid((v,k)=>{
        workerPostMessage({code:v,name:k,show:false})
      })
      updataCode(window.location.hash)
    }).catch(e=>{
      $StoreAlertMsg.errMsg = e.toString()
    })
  }) 
}
</script>
<div bind:this={container}  class=" h-full w-full z-0 absolute top-0 left-0" > 
</div>

<Modal bind:open={formModal} size="xs" autoclose class="w-full pointer-events-auto" > 
  <div bind:this={qrcode} class=" text-center flex" >    
    
    {#if waitting}
    <Spinner  color="green" />
    {:else}
    <Button color="none" href="/{remoteName}">{remoteName}</Button>
    {/if}
  </div> 
</Modal> 