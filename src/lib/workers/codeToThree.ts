import {StringToClass} from '$lib/function/storage'
//import {serialize} from "@jscad/stl-serializer"   
import {serializeBinary} from "$lib/function/CSGToStlb"   
import { CSG } from 'three-csg-ts';
import {CSG2Vertices,CSGSides2LineSegmentsVertices,CSG2LineVertices,CSG2Three,CSG2ThreeArray} from "$lib/function/csg2Three"  
import {regexpGetClass} from "$lib/function/share"  
import pkg from '@jscad/modeling';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import {
    Group   
} from "three"; 
//const group = new Group()
//group
//import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
const {geometries,booleans,utils} = pkg;
import type {CodeToWorker,WorkerMsg} from '$lib/function/share'
//import type {Geometry } from '@jscad/modeling/src/geometries/types';
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
        for (let i=0;i<db.length;i++){
            back(<WorkerMsg>{ver:getCsgObj(db[i],back),index:i})         
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
      
        const db  = serializeBinary(tmpdb,{})
        port.postMessage(<WorkerMsg>{stl:db ,name:data.name})
        return
       
        try{    
            const  g  = tmpdb.length===1?getCsgObj(tmpdb[0]):getCsgObj(booleans.union(...tmpdb))             
            const req = exporter.parse( CSG2Three(g!,{}),{binary:true} )  
            port.postMessage(<WorkerMsg>{stl:[req.buffer] ,name:data.name},[req.buffer])
        }catch(e){
            console.log(e)
            return
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
        const db = obj?.main() 
        
        if (Array.isArray(db)){
            tmpdb = utils.flatten(db)
        }else{
            tmpdb = [db]
        }
       

    }catch(e:any){
        port.postMessage(<WorkerMsg>{errMsg:e.toString(),end:true})
        return
    }
    //group.clear()
    port.postMessage(<WorkerMsg>{start:true})
    getCsgObjArray(tmpdb,(v:WorkerMsg)=>{
        //if (v.ver){
            //tmpdb[v.index!] = v.ver
            //v.mesh = CSG2ThreeArray(v.ver)
        //}       
        port.postMessage(v)
    })    
}


