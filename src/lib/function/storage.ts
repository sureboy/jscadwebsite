import { writable } from 'svelte/store';
import type {solidEditStruct,AlertMsgType,CodeToWorker} from './share'
import {solidLogo} from './solidClass'

export const StoreInputCode = writable(""); 
export const StoreHelpHidden = writable(true); 
export const StoreOrthographic = writable(false)

export const StoreCode3Dview = writable<CodeToWorker>({code:""});
export const StoreAlertMsg = writable<AlertMsgType>( {waitting:false,errMsg:"",name:""});
export const StoreMyClass = writable<Map<string, any>>(new Map())  
export const solidB = new solidLogo() as solidEditStruct 
export const solid =(name?:string )=> {
  return `const ${name?name:"solid"}=class{\n\/\/Input Ctrl+S perview and save this solid\n main(){\n return [this.cube({size:200,center:[0,0,0]})]\n};\n}`
}
export const Console = console.log
 
 
 
export const StringToClass = (data:string,name:string,errMsg:Function)=>{
   
  //const ns = name.split("__") 
  console.log = function (...message) {
    errMsg(message)
  }  
  if (!name){
    errMsg("name err")
    return;
  }
  let ns = name.split("__").reverse()  
  if (ns.length===0){
    errMsg("name err")
    return
  }
  let _name= ns.pop()
  if (!_name){
    errMsg("name err")
    return
  }
  let sandbox =solidB
  //let fsandbox = solidB
  let FlistName = ["this" ]
  for (let n of ns){
    if (!n)continue
    if (Object.hasOwn(sandbox,n)){
      //fsandbox = sandbox
      sandbox = sandbox[n]
    }else{
      let o = Object.create({})
      sandbox[n] =o
      //fsandbox = sandbox
      sandbox=o
    }
    FlistName.push(n)  
  }
  /*
  if (solidB!==sandbox ){
    Object.assign( solidB,sandbox )
  }
    */
  FlistName.push(_name)
      
  let obj 
  try{     
    obj = eval(`(()=>{${data};return ${name} })()`)      
  }catch(e:any){
    errMsg(e) 
    return null
  }
  const FlistStr =  FlistName.join(".")
  obj.prototype.__proto__ = Object.assign({},solidB,sandbox) 
  const obje = new obj as solidEditStruct 
  let Flist:any[] = []
  Object.getOwnPropertyNames(obj.prototype).forEach((v)=>{
    if (v!=="constructor")
      Flist.push([`${FlistStr}.${v}()`,""])
  })
  Object.getOwnPropertyNames(obje).forEach(v=>{
    Flist.push([`${FlistStr}.${v}`,obje[v]] )
  })
  obje.Flist = Flist 
  obje.Name = _name
  obje.CodeFile = data
  //Console(Flist)
  //fsandbox[_name] = obje
  sandbox[_name] = obje  
  return obje 
}
const classToStringEach = (val:string,f:Function)=>{
  const item = val.matchAll(/(?<=this\.)[\w\$\.]+/g)
  if (!item)return
  const li = new Set<string>()
  let t
  for (const v of item){
    let vs = v[0].split(".")
    vs.pop()    
    if (vs.length===0)continue
    t = vs.reverse().join("__")
    if (li.has(t))continue
    li.add(t)
    f(t)
  }
}
const classObjToStringEach = (obj:solidEditStruct,f:Function)=>{
   
  const item = obj.CodeFile.matchAll(/(?<=this\.)[\w\$\.]+/g)
  if (!item)return
  //const li = new Set<string>()
  //let t
  for (const v of item){
    let vs = v[0].split(".")
    vs.pop()    
    if (!vs.length)continue
    let _obj = obj
    for (let s of vs){   
      _obj  = _obj[s]
      if (!_obj){
        break
        //console.log(s)  
                
      }
    }
    if (_obj && Object.hasOwn(_obj,"CodeFile"))f(_obj,vs.reverse().join("__")) 
    //  else console.log(vs)   
   
  }
}
export const ClassObjToString = (obj:solidEditStruct)=>{
  let fileList:any[] = [obj]
  let titleList:string[]=[obj.Name]
  const f = (o:any,n:string)=>{    
    if (titleList.includes(n))return
    titleList.push(n)
    fileList.push(o)
    classObjToStringEach(o,f)
  }
  classObjToStringEach(obj,f)
  return titleList.join(",")+"\n======\n"+fileList.map(v=>{return v.CodeFile}).join("\n======\n")
}

export const  ClassToString = (c:string,n:string)=>{
  const codelist:Map<string,string> = new Map<string,string>()
  const ns = n.split("__")
  const n_ = ns.shift()
  codelist.set(n_?n_:n,c)
  const key:Map<string,string> =new Map();
  const title = ns.length>0?ns.join("__"):null
  //console.log(title,ns)
  getSolidKey(k=> {
    if (!key.has(k))key.set(k,k)
    if (title && k.indexOf(title))
      key.set(k.split("__")[0],k)
  })   
  if (!key)return codelist;
  const f = (v:string)=>{
    let k = key.get(v)
    if (!k) return    
    if (codelist.has(v))return
    const c_ = window.localStorage.getItem(k)
    if (!c_) return
    codelist.set(v,c_ )
    classToStringEach(c_,f)
  }
  classToStringEach(c,f)
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
