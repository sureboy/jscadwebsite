<script context="module" lang="ts" >

  const loader = new GCodeLoader();
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
  export const loaderGcode = (e:any)=>{
 
        //const uri = e.detail.uri
        //console.log(uri);  
        loader.load(e.detail.uri, function ( object ) { 
        if (el){
          //console.log(object)
          startSceneOBJ(el)
          addSceneOBJ(el,object) 
          onWindowResize(el)
        }
        //render();

        } );
      }
 
</script>
<script lang="ts"> 
import {mimeType} from "@jscad/stl-serializer"  
import {CSG2Three} from "$lib/function/csg2Three"   
import { page } from '$app/stores';
import {StoreCode3Dview,saveStorage,initMySolid,StoreAlertMsg,StoreMyClass,StoreInputCode,solid,StoreOrthographic} from "$lib/function/storage"
import {onWindowResize,startSceneOBJ,addSceneOBJ} from "$lib/function/threeScene" 
import { createCanvasElement } from "three";
import { onMount ,onDestroy} from 'svelte';   
import type {CodeToWorker,WorkerMsg} from '$lib/function/share' 
import {  Modal,Spinner ,Button } from 'flowbite-svelte';  
import   QRCode  from 'qrcode';   
import { GCodeLoader } from 'three/addons/loaders/GCodeLoader.js';
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
//let ischange = false
StoreOrthographic.subscribe(o=>{
  if (el)  onWindowResize(el,true,o)
})

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
  const n = k.split("__")
  const l = n.length
  if (l<2){
    //$StoreAlertMsg.errMsg="found not code"
    //let code_ = solid(k)
    //StoreInputCode.set(code_);
    //StoreCode3Dview.set({code:code_,show:true,name:k})
    StoreCode3Dview.set({code:solid(k),show:true,name:k})
    //$StoreAlertMsg.name = k
    return 
  }
  const name = n[l-1]
  fetch(`https://db.solidjscad.com/?url=${encodeURI($page.url.origin)}&k=${k}`).then((r)=>{     
 
    r.arrayBuffer().then((v)=>{ 
      const [t,...codes] = (new TextDecoder('utf-8')).decode(v).split("\n======\n") 
      let titles = t.split(",")  
      //let mainCode =  {code:codes.shift(),name:k,show:true}
 
      for (let i in titles){  
        workerPostMessage({code:codes[i],name:titles[i]+"__"+name,show:false})            
      }     
      workerPostMessage({code:codes[0],name:titles[0]+"__"+name,show:true})
      //StoreInputCode.set(codes[0]);
  
    }).catch(e=>{
      $StoreAlertMsg.errMsg=e
      console.log(e)
    })
  }).catch((e)=>{
    $StoreAlertMsg.errMsg=e
    return 
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
    console.log(hash)
    const hashName = hash.startsWith("#")? hash.substring(1).split(":") :hash.split(":")
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
  container.appendChild(el)
  window.addEventListener('resize', ()=>{
    el!.width = window.innerWidth;
    el!.height = window.innerHeight; 
    //console.log("z")
    onWindowResize(el!)				
  });
      
  window.addEventListener("hashchange", (e)=>{ 
    console.log(e)
    //ischange=true
    //window.location.hash
    updataCode(new URL(e.newURL).hash)
  });
  WorkerInit(el)
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
  if (t.show)  $StoreAlertMsg.name = t.name || ""
  else  $StoreAlertMsg.name = ""
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
    //$StoreAlertMsg.name = e.data.name!  
    return 
  }
  if (e.data.start && el){
    startSceneOBJ(el) 
    //ischange=true
  }
  if (e.data.ver){
    $StoreAlertMsg.waitting = true; 
    try{
      //console.log("ver",e.data)
      if (el ){
        //onWindowResize(el,e.data.camera===1?false:true)	
        //console.log(el.width,el.height)
        addSceneOBJ(el,CSG2Three(e.data.ver, {} )) 
        //console.log("mesh",e.data.mesh)
      }else{
        console.log("ver false")
      }
     
    }catch(e:any){
      $StoreAlertMsg.errMsg = e.toString()
    }         
    return
  }            
  //console.log(e.data)
  if (e.data.end){
    $StoreAlertMsg.waitting = false; 
    if (el && e.data.camera)  {
      onWindowResize(el,e.data.camera===1?false:true)	
      //ischange=false
    //  console.log("ver end",e.data.camera===1?false:true)
      //ischange=false
    } 
   
  } 
  if (e.data.name){
    if(e.data.show)$StoreAlertMsg.name = e.data.name     
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
      console.log(k)
      workerPostMessage({code:v,name:k,show:false})
    })
    console.log("hash1",window.location.hash,$StoreAlertMsg.name)
    
    updataCode(window.location.hash?window.location.hash:$StoreAlertMsg.name)
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
      updataCode(window.location.hash?window.location.hash:$StoreAlertMsg.name)

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