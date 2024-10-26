import { writable } from 'svelte/store';
import type {solidEditStruct,AlertMsgType,CodeToWorker} from './share'
import {solidLogo} from './solidClass'

//export const StoreWorkerCmd = writable("");

export const StoreInputCode = writable(""); 
export const StoreHelpHidden = writable(true); 

export const StoreCode3Dview = writable<CodeToWorker>({code:""});
export const StoreAlertMsg = writable<AlertMsgType>( {waitting:false,errMsg:"",name:"" });
export const StoreMyClass = writable<Map<string, any>>(new Map())

const solidListKey="solidList"  
export const solidB = new solidLogo() as solidEditStruct 
export const solid1 = "const solid1=class{\n\/\/Input Ctrl+S perview and save this solid\n main(){\n return [this.cube({size:200,center:[0,0,0]})]\n};\n}"
export const StringToClass = (data:string,name:string,msg:AlertMsgType)=>{
  if (!name)return; 
  try{  
    const obj = eval(`(()=>{${data};return ${name}})()`)   
    obj.prototype.__proto__ = solidB 
    const obje = new obj as solidEditStruct 
    let Flist = Object.getOwnPropertyNames(obj.prototype).map((v)=>{
      //if (v!=="constructor")
      return [`this.${name}.${v}()`,""]
    })
    Object.getOwnPropertyNames(obje).forEach(v=>{
      Flist.push([`this.${name}.${v}`,obje[v]] )
    })
    obje.Flist = Flist 
    solidB[name] = obje  
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
  StoreAlertMsg.update( k=>{
    k.name = key
    return k
  })
  window.localStorage.setItem(solidListKey,keylist.join(",") )
}

export const getStoragelist = ()=>{ 
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
