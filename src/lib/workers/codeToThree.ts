import {StringToClass} from '$lib/function/storage'
import {serialize} from "@jscad/stl-serializer"   
import {CSG2Vertices,CSGSides2LineSegmentsVertices,CSG2LineVertices} from "$lib/function/csg2Three"  
import {regexpGetClass} from "$lib/function/share"  
import pkg from '@jscad/modeling';
const {geometries} = pkg;
import type {AlertMsgType,CodeToWorker,WorkerMsg} from '$lib/function/share'
const AlertMsg:AlertMsgType = {waitting:false,errMsg:"",name:""}
//import type {csgObj} from "$lib/function/csg2Three"  

//const base  = new solidBase()
//const solidClassMap:Map<string,solidEditStruct>= new Map()
/*
const initSolid = ()=>{

    //solidClassMap.set("solidBase",new solidBase())
    const namelist = localStorage.getItem(solidListKey)?.split(',')
    namelist?.forEach((v)=>{
      //const code = window.localStorage.getItem(v)||""
      //const obje =Object.create(eval(window.localStorage.getItem(v)||"").prototype) 
      const obj =  eval(localStorage.getItem(v)||"")
      obj.prototype.__proto__ = base
     
      const obj_ = Object.create(obj.prototype)
      obj_._my=solidClassMap
      solidClassMap.set(v, obj_)
      //stringCodeToObj(window.localStorage.getItem(v),v)
      
    })

} 
initSolid()
*/
//const regexpGetClass = /^\s*const\s+(\w+)\s*=\s*class(?=\s+extends\s+(\w+))?\s*\{/ 
self.onmessage = (e) => {
    //console.log(e)
    handCode(e.data,self)
}
self.addEventListener("connect", (e:any) => { 
   // const port = e.ports[0];
    for (const port of e.ports)  {
        port.onmessage = (e:any) => {
            handCode(e.data,port) 
            };
        port.start();
    } 
});
  
const handCode  = (data:CodeToWorker,port:any)=>{
    //self = port
    //console.log(data)
    if (!data.name ){
        if (!data.code)   return
        let vm = data.code.match(regexpGetClass)    
        if (!vm || !vm[1]){
            port.postMessage(<WorkerMsg>{errMsg:"class declare err"})
            return;
        }
        data.name = vm[1]
    }
    //console.log(data)
    const obj = StringToClass(data.code,data.name,AlertMsg)
   
    if (!obj){
       
        if(AlertMsg.errMsg){
            port.postMessage(<WorkerMsg>{errMsg:AlertMsg.errMsg})
        }
        return
    }
    port.postMessage(<WorkerMsg>{Flist:obj.Flist})
    //console.log(Object.keys(obj))
    //console.log(obj)
    if (data.stl&&data.name){
        //const da = serialize({ binary: true }, ...obj?.main()) 
        port.postMessage(<WorkerMsg>{stl:serialize({ binary: true }, 
            ...obj?.main()),name:data.name})
        return
    }
    if (!data.show)return
    try{
        const li = obj?.main() || []    
        for (const i in li){
            //console.log(v)
            const v = li[i]
            try{
                if (geometries.geom3.isA(v)){
                    port.postMessage(<WorkerMsg>{ver:CSG2Vertices(v)})
                    continue;
                }
                if (geometries.geom2.isA(v)){
                    port.postMessage(<WorkerMsg>{ver:CSGSides2LineSegmentsVertices(v)})                  
                    continue;
                }
                if (geometries.path2.isA(v)){
                    port.postMessage(<WorkerMsg>{ver:CSG2LineVertices(v)})               
                    continue;
                }
            }catch(e:any){
                port.postMessage(<WorkerMsg>{errMsg:e.toString})
            }
            //self.postMessage({ver:CSG2Vertices(li[i])})
        }
        port.postMessage(<WorkerMsg>data)
    }catch(e:any){
        //AlertMsg.errMsg = e.toString()
        port.postMessage(<WorkerMsg>{errMsg:e.toString()})
    }
}


