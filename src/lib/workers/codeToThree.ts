import {StringToClass} from '$lib/function/storage'
//import {serialize} from "@jscad/stl-serializer"   
import {CSG2Vertices,CSGSides2LineSegmentsVertices,CSG2LineVertices,CSG2Three} from "$lib/function/csg2Three"  
import {regexpGetClass} from "$lib/function/share"  
import pkg from '@jscad/modeling';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
//import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
const {geometries} = pkg;
import type {CodeToWorker,WorkerMsg,solidEditStruct} from '$lib/function/share'
const exporter = new STLExporter();

import { Scene } from "three"; 

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
let tmpdb:any[] = []
const getCsgDB = (tmpdb:any[])=>{
    
}
const getCsgObj = (db:any[],back:Function)=>{
    try{
        //tmpdb = obj?.main() || []    
        for (const v of db){
            //console.log(v)
            //const v = li[i]        
            if (geometries.geom3.isA(v)){ 
                back(<WorkerMsg>{ver:CSG2Vertices(v)})
                continue;
            }
            if (geometries.geom2.isA(v)){ 
                back(<WorkerMsg>{ver:CSGSides2LineSegmentsVertices(v)})                  
                continue;
            }
            if (geometries.path2.isA(v)){
                //back(CSG2LineVertices(v))
                back(<WorkerMsg>{ver:CSG2LineVertices(v)})               
                continue;
            }        
        } 
        back(<WorkerMsg>{end:true })
    }catch(e:any){ 
        //back(<WorkerMsg>{errMsg:e.toString})
        back(<WorkerMsg>{errMsg:e.toString(),end:true})
    } 
}
const handCode  = (data:CodeToWorker,port:any)=>{
    if (data.stl&&data.name && tmpdb.length>0){
         
        const scene = new Scene();
        getCsgObj(tmpdb,(v:WorkerMsg)=>{
            if (v.ver)scene.add(CSG2Three(v.ver,{}))
            //port.postMessage(v)
        })
        const req = exporter.parse( scene,{binary:true} )  
        port.postMessage(<WorkerMsg>{stl:[req.buffer] ,name:data.name})
        return
        /*
        const da = serialize({ binary: true }, ...tmpdb) 
        //console.log(tmpdb.length)
        //scene.clear()
        //for (const v of tmpdb)
        //scene.add(...tmpdb)
        //const req = exporter.parse( scene, { binary: true })        
        //req.
        port.postMessage(<WorkerMsg>{stl:da ,name:data.name})
        return
        */
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
    tmpdb = obj?.main() || [] 
    getCsgObj(tmpdb,(v:WorkerMsg)=>{
        //if (v.ver)tmpdb.push(v.ver)
        port.postMessage(v)
    })
    
}


