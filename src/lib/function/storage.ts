import { writable } from 'svelte/store';
import type {solidEditStruct,AlertMsgType} from './share'
import {solidLogo} from './solidClass'


export const StoreInputCode = writable(""); 
export const StoreHelpHidden = writable(true); 

export const StoreCode3Dview = writable("");
export const  StoreAlertMsg = writable<AlertMsgType>( {waitting:false,errMsg:"3D Create" })

const solidListKey="solidList"  
export const solidB = new solidLogo() as solidEditStruct
//export const MySolid:Record<string,solidEditStruct> = {}
export const StringToClass = (data:string,name:string,msg:AlertMsgType)=>{
  if (!name)return;
  //console.log(data)
  try{  
    const obj = eval(`(()=>{${data};return ${name}})()`)  
    obj.prototype.__proto__ = solidB
    //console.log(obj)
    //MySolid[name] = obj
    const obje = new obj as solidEditStruct
    //Object.assign(obj,MySolid) 
    //obj.my=MySolid
    //console.log(obj,obje,solidB)
    solidB[name] = obje 
    //MySolid[name] = obj
    return obje 
  }catch(e:any){
    msg.errMsg = e.toString()  
    console.log(e)
    return null
  }
}
export const initMySolid = (f:(v:string,k:string)=>void)=>{
    window.localStorage.getItem(solidListKey)?.split(",").forEach(v=>{
        if (!v)return
        const data = window.localStorage.getItem(v)
        if (!data)return
        
        f(data!,v)      
      

    })
}

export const saveStorage = (key:string,value:string)=>{
  window.localStorage.setItem(key, value)
  let keylist = window.localStorage.getItem(solidListKey)?.split(",") ||[]
  if (keylist.includes(key)){
    return
  }
  keylist.push(key)

  window.localStorage.setItem(solidListKey,keylist.join(",") )
 }

export const getStoragelist = ()=>{
    //solidList =  window.localStorage.getItem(solidListKey)!
    //showSolid(solidList) 
    let links:any[] = []
    window.localStorage.getItem(solidListKey)?.split(",").forEach(v=>{
      if(v)links.push(v)
    })   
   return links 
 }

 export const removeStorage=(k:string)=>{
    window.localStorage.removeItem(k)
    let funcName  = new Set()
    window.localStorage.getItem(solidListKey)?.split(',').forEach(v=>{    
      if (v&&window.localStorage.getItem(v))funcName.add(v)
    })
    window.localStorage.setItem(solidListKey,funcName.size>0?Array.from(funcName).join(","):"")
  }
