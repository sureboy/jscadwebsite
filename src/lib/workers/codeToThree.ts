import {StringToClass} from '$lib/function/storage'
//import {serialize} from "@jscad/stl-serializer"   
import {CSG2Vertices,CSGSides2LineSegmentsVertices,CSG2LineVertices,CSG2Three} from "$lib/function/csg2Three"  
import {regexpGetClass} from "$lib/function/share"  
import pkg from '@jscad/modeling';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
//import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
const {geometries,booleans} = pkg;
import type {CodeToWorker,WorkerMsg} from '$lib/function/share'
import type {Geometry } from '@jscad/modeling/src/geometries/types';
const exporter = new STLExporter();

//import { Scene,Group } from "three"; 

self.onmessage = (e) => {
    //console.log(e)
    handCode(e.data,self)
}
self.addEventListener("connect", (e:any) => { 
    //const port = e.ports[0];
    //console.log(e.ports)
    for (const port of e.ports)  {
        port.onmessage = (e:any) => {
            handCode(e.data,port) 
        };
        //port.start();
    } 
});
let tmpdb:any[]
const getCsgObj = (v:any,back?:Function )=>{
    try{
        if (geometries.geom3.isA(v)){ 
            return CSG2Vertices(v)            
        }
        if (geometries.geom2.isA(v)){ 
            return CSGSides2LineSegmentsVertices(v)                
        }
        if (geometries.path2.isA(v)){         
            return CSG2LineVertices(v);
        }   
    }catch(e:any){ 
        //back(<WorkerMsg>{errMsg:e.toString})
        if (back) back(<WorkerMsg>{errMsg:e.toString(),end:true})
    }      
}
const getCsgObjArray = (db:any[],back:Function)=>{
    try{
        //tmpdb = obj?.main() || []    
        for (const v of db){
            back(<WorkerMsg>{ver:getCsgObj(v,back)})         
        } 
        back(<WorkerMsg>{end:true })
    }catch(e:any){ 
        //back(<WorkerMsg>{errMsg:e.toString})
        back(<WorkerMsg>{errMsg:e.toString(),end:true})
    } 
}
const handCode  = (data:CodeToWorker,port:any)=>{
    if (data.stl&&data.name && tmpdb.length>0){
        //const group = new Group()
        //const scene = new Scene();
 
        let g =getCsgObj(tmpdb.length===1?tmpdb[0]:booleans.union(...tmpdb))
        if (g){
            const req = exporter.parse( CSG2Three(g,{smooth:false}),{binary:true} )  
            port.postMessage(<WorkerMsg>{stl:[req.buffer] ,name:data.name})
        }else{
            port.postMessage(<WorkerMsg>{errMsg:"stl err"})
        }
        return
    }
    if (!data.code)   return
    let vm = data.code.match(regexpGetClass)    
    if (!vm || !vm[1]){
        port.postMessage(<WorkerMsg>{errMsg:"class declare err"})
        return;
    }
    if (data.name !== vm[1]) data.name = vm[1]
    port.postMessage(<WorkerMsg>{name:data.name,code:data.code})
    
    //}
    //console.log(data)
    const obj = StringToClass(data.code,data.name,(e:any)=>{
        port.postMessage(<WorkerMsg>{errMsg:e})
        //Console(e)
    })
    //if(AlertMsg.errMsg){
    //    port.postMessage(<WorkerMsg>{errMsg:AlertMsg.errMsg})
    //}
    if (!obj){
        return
    }
    port.postMessage(<WorkerMsg>{Flist:obj.Flist})
    //console.log(Object.keys(obj))
    //console.log(obj)

    if (!data.show){
        port.postMessage(<WorkerMsg>{end:true})
        return
    }
    //tmpdb = []
    //console.log("clear")
    //scene.clear()
    try{
        const db = obj?.main() || [] 
        if (Array.isArray(db)){
            tmpdb = db
        }else{
            tmpdb = [db]
        }
    }catch(e:any){
        port.postMessage(<WorkerMsg>{errMsg:e.toString(),end:true})
        return
    }
    getCsgObjArray(tmpdb,(v:WorkerMsg)=>{
        //if (v.ver)tmpdb.push(v.ver)
        port.postMessage(v)
    })    
}


