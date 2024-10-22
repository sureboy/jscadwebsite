<script lang="ts">
 // import {show3d,saveSolid,showSolidFromString,solidLogo as solidBase, } from "./show3d"; 
 import { browser } from '$app/environment'; 
 import {CSG2Vertices,CSG2Three,CSGSides2LineSegmentsVertices,CSG2LineVertices} from "$lib/function/csg2Three"  
 import {regexpGetClass} from "$lib/function/share"  
 import {solidLogo} from '$lib/function/solidClass'
 import {StoreCode3Dview,StringToClass,saveStorage,initMySolid,StoreAlertMsg} from "$lib/function/storage"
 import {createSceneOBJ,onWindowResize} from "$lib/function/threeScene"
 //import type {solidEditStruct} from '$lib/function/share'
 import { createCanvasElement } from "three";
 import { onMount, onDestroy } from 'svelte'; 
 import pkg from '@jscad/modeling';
const {geometries} = pkg;
 import type {AlertMsgType} from '$lib/function/share'
 import type {Geometry} from '@jscad/modeling/src/geometries/types';
 //StoreCode3Dview.subscribe(Show3DSolid)
 const AlertMsg:AlertMsgType = {waitting:false,errMsg:""}
 const initAlertMsg = ()=>{
  AlertMsg.waitting = false
  AlertMsg.errMsg=""
 }
 //StoreAlertMsg.set(AlertMsg)
 let el: HTMLCanvasElement|null = null;//  = createCanvasElement() ;
 let container:HTMLElement;
 let worker:any
 let mesh:any[] = []
 //const MyWorker = await import('$workers/codeToThree.ts?worker');
 const solidB = new solidLogo()
 const NotWorkerShow = (code:string)=>{
   
  if (!el)return;
  let vm = code.match(regexpGetClass)   
  if (!vm)return;    
  const obje =  StringToClass(code,vm[1],AlertMsg)
  if (!obje)return;
  //console.log(obje?.solid1)
  try{

    obje?.main().forEach((v:Geometry)=>{
      
      if (geometries.geom3.isA(v)){
        mesh.push(CSG2Three(CSG2Vertices(v),{}))
        return;
      }
      if (geometries.geom2.isA(v)){
        mesh.push(CSG2Three(CSGSides2LineSegmentsVertices(v),{}))
        return;
      }
      if (geometries.path2.isA(v)){
        mesh.push(CSG2Three(CSG2LineVertices(v),{}))
        return;
      }
      
    })
    //console.log(mesh)
    createSceneOBJ(el,mesh)
    mesh = []
    saveStorage(vm[1],code)
  }catch(e:any){
    AlertMsg.errMsg = e.toString()
    //console.log(e)
  }
  
 }

    onDestroy(()=>{
      if (worker) {
        worker.terminate();
      }
    })
    onMount(()=>{
      WorkerInit()
      el  =createCanvasElement() ;
      el.width = window.innerWidth;
		  el.height = window.innerHeight;
    
      window.addEventListener('resize', ()=>{
				el!.width = window.innerWidth;
				el!.height = window.innerHeight; 
				onWindowResize(el!)				
			});
      container.appendChild(el)
      /*
      console.log(container,el)
      //const obje =  ((new solidBase()) as solidEditStruct)
      //  console.log(obje)
       // createSceneOBJ(el,CSG2Three(t ,{} ))
       const m:any = []
       solidB.main().forEach((v)=>{
        m.push(CSG2Three(CSG2Vertices(v),{}))
      })
  //console.log(m)
     createSceneOBJ(el,m)
*/
    })
  
    StoreCode3Dview.subscribe((t)=>{
    
      if (worker){
     
        worker.postMessage({code:t, show:true})
      }else{
        //StoreAlertMsg.set(AlertMsg)
        initAlertMsg()
        StoreAlertMsg.set(AlertMsg)
        NotWorkerShow(t)
        AlertMsg.waitting=false 
        StoreAlertMsg.set(AlertMsg)
      }
    })
    const WorkerInit =async()=>{
      if (browser && window.Worker) {
        const MyWorker = await import('$workers/codeToThree.ts?worker');
        worker = new MyWorker.default();
        //mesh =[]
        worker.onmessage = function (e:any) {
          //console.log(e.data)
          initAlertMsg()
          if (e.data.ver){
            AlertMsg.waitting = true;
            //console.log(e.data.ver)
            mesh.push(CSG2Three(e.data.ver,{}))
          }else{
            if (el && mesh.length>0 ){
              createSceneOBJ(el!,mesh)
              mesh = []
            } 
            if (e.data.code && e.data.name){
              saveStorage(e.data.name,e.data.code)
            }
            if (e.data.errMsg){
              AlertMsg.errMsg = e.data.errMsg
            }
            AlertMsg.waitting = false;
          }
          StoreAlertMsg.set(AlertMsg)
          //console.log(e.data.ver)
        };

        initMySolid((v,k)=>{
          worker.postMessage({code:v,name:k,show:false})
        })

      } 
        initMySolid((v,k)=>{
          StringToClass(v,k,AlertMsg)
          //worker.postMessage({code:v,name:k,show:false})
        })
      

    }
</script>
<div bind:this={container}  class=" h-full w-full z-0 absolute top-0 left-0" > 

</div>