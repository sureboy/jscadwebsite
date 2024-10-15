import {StringToClass} from '$lib/function/storage'
import {CSG2Vertices} from "$lib/function/csg2Three"  
import {regexpGetClass} from "$lib/function/share" 
import type {AlertMsgType} from '$lib/function/share'
const AlertMsg:AlertMsgType = {waitting:false,errMsg:""}
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
    handCode(e.data)

}
 

const handCode  = (data:{code:string,name?:string,show:boolean})=>{
    if (!data.name){
        let vm = data.code.match(regexpGetClass)    
        if (!vm || !vm[1]){
            self.postMessage({errMsg:"class declare err"})
            return;
        }
        data.name = vm[1]
    }
    //console.log(data)
    const obj = StringToClass(data.code,data.name,AlertMsg)
    if (!obj){
        if(AlertMsg.errMsg){
            self.postMessage(AlertMsg)
        }
        return
    }
    if (!data.show)return
    try{
        const li = obj?.main() || []    
        for (const i in li){
            //console.log(v)
            self.postMessage({ver:CSG2Vertices(li[i])})
        }
        self.postMessage(data)
    }catch(e:any){
        AlertMsg.errMsg = e.toString()
        self.postMessage(AlertMsg)
    }
}


