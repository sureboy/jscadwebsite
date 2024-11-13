import { writable } from 'svelte/store';
import type {solidEditStruct,AlertMsgType,CodeToWorker} from './share'
import {solidLogo} from './solidClass'

export const StoreInputCode = writable(""); 
export const StoreHelpHidden = writable(true); 

export const StoreCode3Dview = writable<CodeToWorker>({code:""});
export const StoreAlertMsg = writable<AlertMsgType>( {waitting:false,errMsg:"",name:"" });
export const StoreMyClass = writable<Map<string, any>>(new Map())  
export const solidB = new solidLogo() as solidEditStruct 
export const solid =(name?:string )=> {
  return `const ${name?name:"solid"}=class{\n\/\/Input Ctrl+S perview and save this solid\n main(){\n return [this.cube({size:200,center:[0,0,0]})]\n};\n}`
}
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

export const  ClassToString = (c:string,n:string)=>{
  const codelist:Map<string,string> = new Map<string,string>()
  codelist.set(n,c)
  const key:string[] =[];
  getSolidKey(k=> key.push(k) )   
  if (!key)return codelist;
  const item = c.matchAll(/(?<=this\.)[\w\$]+/g)
  if (!item)return codelist
  const li = new Set<string>()
  console.log(item)
  for (const v of item){
  
    console.log(v)
    if (li.has(v[0]))continue
    li.add(v[0]) 
    console.log(v[0])
    if (!key.includes(v[0])) continue
    const c_ = window.localStorage.getItem(v[0])
    if (c_) codelist.set(v[0],c_ )
  }
  return codelist
   
}
const getSolidKey = (f:(key:string)=>void)=>{
  const sl = window.localStorage.length
  for (let i=0;i<sl;i++){ 
    const k = window.localStorage.key(i)
    //if (k==="solidList")window.localStorage.removeItem(k)
    if (!k)continue
    f(k)
  }
}
export const initMySolid = (f:(v:string,k:string)=>void)=>{  
  getSolidKey((k)=>{
    const d = window.localStorage.getItem(k)
    if (!d)return
    f(d,k)
  })
  
}

export const saveStorage = (key:string,value:string)=>{
  window.localStorage.setItem(key, value) 
}

export const getStoragelist = ()=>{ 
  let links:any[] = []
  getSolidKey((v)=>{
    if(v)links.push(v)
  })
  return links 
}

export const removeStorage=(k:string)=>{
  window.localStorage.removeItem(k)

}
