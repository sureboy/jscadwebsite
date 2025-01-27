<script context="module" lang="ts" >

  const loader = new STLLoader();
 let el:HTMLCanvasElement|null; 
 let screenCanvas:HTMLCanvasElement
 let size:any
 let worker:SharedWorker|Worker|null
 const material = new MeshStandardMaterial({
	color: 'gray',
	metalness: 0.5,
	roughness: 0.1,
	transparent: true,  
});
const workerPostMessage = (v:any)=>{
  if (worker){
    if (worker instanceof Worker)
      worker.postMessage(v)
    else
      worker.port.postMessage(v)
  }    
}
const getStrCode = (str:string,name?:string)=>{
  if (!name){
    name = new Date().getTime().toString(36).substring(2);
  }
  //console.log(str,name)
  const decoder = new TextDecoder();
  const decodedData = atob(str)
  const decodedString = decoder.decode(new Uint8Array([...decodedData].map(char => char.charCodeAt(0))));
  const [t,...codes] = decodedString.split("\n======\n") 
  let titles = t.split(",")  
  console.log(t)
  for (let i in titles){  
    
    workerPostMessage({code:codes[i],name:titles[i]+"__"+name,show:false})            
  }     
  workerPostMessage({code:codes[0],name:titles[0]+"__"+name,show:true})
}
 export const screenHandle = (e:any)=>{

    if (!el)return
    const ctx = screenCanvas.getContext("2d")
    //console.log(ctx)
    if (!ctx)return
    const img = new Image()
    img.src = el.toDataURL()
    img.onload = ()=>{
      screenCanvas.width  = img.width
      screenCanvas.height = img.height
      ctx.drawImage(img,0,0)
      const imagedata = ctx.getImageData(0, 0, img.width, img.height)
      let imgData = imagedata.data
      let minX = img.width;
      let minY = img.height;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const index = (y * img.width + x) * 4; 
          const red = imgData[index];
          const green = imgData[index + 1];
          const blue = imgData[index + 2]; 
          if (red === 0 && green === 0 && blue === 0) {
              continue
          } else {
               minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
          }
        }
      }
      const croppedWidth = maxX - minX + 1;
      const croppedHeight = maxY - minY + 1;
      screenCanvas.width = croppedWidth;
      screenCanvas.height = croppedHeight; 
      console.log(minX, minY, maxX, maxY,croppedWidth,croppedHeight)
      ctx.drawImage(img, minX, minY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
      
      let aTag = document.createElement('a'); 
      aTag.download = e.detail.name+"_screen.png";
      let href =screenCanvas.toDataURL()
      //console.log(href)
      aTag.href = href;
      aTag.click();
      //URL.revokeObjectURL(href);  	
 
    }
 
 
  
  
  }
  export const loaderSTL = (e:any)=>{ 
    loader.load(e.detail.uri, function ( object ) { 
      if (el){
        startSceneOBJ(el)
        addSceneOBJ(el,new Mesh(object,material) ) 
        onWindowResize(el)
      }
    });
  }
  export const loaderFile = (e:any)=>{

    //const uri = e.detail.uri
    const file = new FileReader()
    file.onload = (event)=>{
      getStrCode(event.target?.result as string)
    }
    file.readAsText(e.detail.data)
    //console.log(e.detail.data);  
    return
    loader.load(e.detail.uri, function ( object ) { 
    if (el){
      //console.log(object)
      startSceneOBJ(el)
      addSceneOBJ(el,new Mesh(object,material) ) 
      onWindowResize(el)
    }
    //render();

    } );
  }
      
</script>
<script lang="ts"> 
//import {mimeType} from "@jscad/stl-serializer"  
import {CSG2Three} from "$lib/function/csg2Three"   
import { page } from '$app/state';
import {StoreCode3Dview,saveStorage,initMySolid,StoreAlertMsg,StoreMyClass,StoreInputCode,solid,StoreOrthographic} from "$lib/function/storage"
import {onWindowResize,startSceneOBJ,addSceneOBJ} from "$lib/function/threeScene" 
import { createCanvasElement, Mesh,MeshStandardMaterial } from "three";
import { onMount ,onDestroy} from 'svelte';   
import type {CodeToWorker,WorkerMsg} from '$lib/function/share' 
import {  Modal,Spinner ,Button,ButtonGroup } from 'flowbite-svelte';  
import   QRCode  from 'qrcode';   
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { CloudArrowUpOutline,DownloadOutline,QrCodeOutline,CartOutline,StoreOutline } from 'flowbite-svelte-icons';
let container:HTMLElement; 
let qrcode:HTMLElement;
//let mesh:any[] =  []
let formModal=false
let fileModal = false
let fileUpload = {name:"",file:""}
let waitting = false
//let shareUrl = ""
let canvas:HTMLElement;
let remoteName = ""
formModal = true 
waitting = true
let dbUrl = "https://db.solidjscad.com"

const changeDbUrl = async ()=>{
  const dbUrls =new Set([dbUrl,"https://db.solidjscad.com","https://stl.miguotuijian.cn"])
  
  for (const u of dbUrls){
    try{
      await fetch(u+"?p=1") 
       //console.log(res)
       //console.log(u)
       return u
    }catch(e){
      //console.log(e)
    }
    
  }
  return dbUrl
}

//let ischange = false
StoreOrthographic.subscribe(o=>{
  if (el)  onWindowResize(el,true,o)
})

onDestroy(()=>{
  if (worker && worker instanceof Worker) {
    worker.terminate();
  }
})


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
  fetch(`https://db.solidjscad.com/?url=${encodeURI(page.url.origin)}&k=${k}`).then((r)=>{     
 
    r.arrayBuffer().then((v)=>{ 
      getStrCode((new TextDecoder('utf-8')).decode(v),name)
      /*
      const [t,...codes] = (new TextDecoder('utf-8')).decode(v).split("\n======\n") 
      let titles = t.split(",")  
      //let mainCode =  {code:codes.shift(),name:k,show:true}
 
      for (let i in titles){  
        workerPostMessage({code:codes[i],name:titles[i]+"__"+name,show:false})            
      }     
      workerPostMessage({code:codes[0],name:titles[0]+"__"+name,show:true})
      //StoreInputCode.set(codes[0]);
      */
  
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
  workerPostMessage({code:window.localStorage.getItem(oldk),name:oldk,show:true})
  remoteName = "#"+k
  QRCode.toCanvas(canvas, `${page.url.origin}/#${k}`, function (error) {
    if (error) console.error(error)
    else
      qrcode.appendChild(canvas!)    
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
  }  
  formModal=false
  waitting = false
}

onMount(()=>{    
  el = createCanvasElement() ;  
  canvas =document.createElement("canvas")  
  el.width = window.innerWidth;
  el.height = window.innerHeight;
  container.innerHTML=""
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
    type: 'application/sla',
  });
  //console.log(file)
  const aTag = document.createElement('a'); 
  aTag.download = file.name;
  const href = URL.createObjectURL(file); 
  aTag.href = href;
  aTag.click();
  URL.revokeObjectURL(href);  
}
const downCodeFile = (code:string,name:string)=>{
  const file = new File([code],name+".solidjscad", {
    type: 'text/plain',
  }); 
  const aTag = document.createElement('a'); 
  aTag.download = file.name;
  const href = URL.createObjectURL(file); 
  aTag.href = href;
  aTag.click();
  URL.revokeObjectURL(href); 
 
}
StoreCode3Dview.subscribe((t:CodeToWorker)=>{  
  //console.log(t)
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
  if(e.data.file){
    //console.log(e.data.file)
    //downCodeFile(e.data.file,e.data.name!)
    const encoder = new TextEncoder();
    const data = encoder.encode(e.data.file)
    fileUpload.file = btoa(String.fromCharCode(...new Uint8Array(data)));
    fileUpload.name = e.data.name||""
    fileModal = true
    changeDbUrl().then(v=>{dbUrl=v})
    $StoreAlertMsg.waitting = false;
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

<Modal bind:open={fileModal} size="xs" autoclose={false} class="w-full pointer-events-auto" >
  {#if (fileUpload.name)}
  <form class="flex flex-col space-y-6" enctype="multipart/form-data"   method="POST" action="{dbUrl}/?url={page.url.origin}&keyName={fileUpload.name}"  >
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">{fileUpload.name}</h3> 
    <input type="hidden" name="name" value={fileUpload.name} />
    <input type="hidden" name="file" value={fileUpload.file} />
    <div class="text-center"> 
      <ButtonGroup>
    <Button color="alternative" on:click={()=>{
      if(fileUpload.name) downCodeFile(fileUpload.file,fileUpload.name)
    }}  ><DownloadOutline/></Button>
 
  <Button  color="alternative" type="submit" >
    <CloudArrowUpOutline/>
  
  </Button> 
</ButtonGroup>
    </div> 
    </form>
  {/if}
</Modal>
<canvas bind:this={screenCanvas}   style="display:none;"></canvas>