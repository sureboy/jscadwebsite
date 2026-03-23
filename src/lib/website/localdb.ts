import {gzipToString,srcStringToFile,
    clearHash,stringToGzip,fetchGZBuffer,includeImport
} from "../function/utils"
import type {mainConfigType,sConfig} from "../function/utils"
import {
    handleCurrentMsg,
    cleanCurrentMsg,
    getCurrent,
    getCurrentCode
}  from "../function/ImportParser"
import { runWorker,getWorkerName } from "../function/worker";
import {IndexedDBStorage} from "./IndexedDBStorage"
export const myStorage = new IndexedDBStorage('solidjscad', 'gzfile');
 
//export const tmpSolidConfig ={tmp:"solidjscad.json",conf:{}}
export const  currentLocalDBConfig:{
    //paths?:string[],
    name:string,
    path?:string,
    configName():string,
    getPathX():string,
} = {
        name:"solidjscad.json",
        configName:function(){
            return this.getPathX()+this.name
        },
        getPathX:function(){ 
            if (this.path){
                return this.path+"*"
            }else{
                return ""
            }
        },
    }
 
export const cleanSolidConfig = ()=>{ 
    if (!currentLocalDBConfig.path)return; 
    myStorage.del(currentLocalDBConfig.path)
    window.localStorage.clear() 
    window.location.reload()
}
const unzipDB = async(name:string,data:ArrayBuffer|Array<any>,solidConfig:sConfig)=>{
    let v=""
    if (Array.isArray(data)){ 
        v = await gzipToString(await new Blob(data).arrayBuffer()) 
    }else{
        v = await gzipToString(data)          
        if (!v ){
            v =new TextDecoder().decode(data)
        }
    }    
    if (!v ){      
        //console.log("gzipTostring err")   
        return
    }
    console.log(v)
    let obj:mainConfigType|undefined = undefined
    //const files:string[] = []  
    currentLocalDBConfig.path =name 
    //currentLocalDBConfig.paths = await myStorage.keys() 
    cleanCurrentMsg() 
    window.localStorage.clear()
    //mySolidTmp.update()
    srcStringToFile(v,(msg)=>{ 
        window.localStorage.setItem(currentLocalDBConfig.getPathX()+msg.name,msg.db) 
        //window.localStorage.setItem( msg.name,msg.db) 
        if (msg.name===currentLocalDBConfig.name){
            obj = JSON.parse(msg.db) as mainConfigType
            return
        }
        //files.push(msg.name)
        handleCurrentMsg(msg,solidConfig.postMessage||undefined)
    }) 
    if (!obj){   
        //cleanSolidConfig()     
      
    }
    
    return obj
}
export const analysisGzipDB =async (name:string,data:ArrayBuffer,solidConfig:sConfig )=>{
    myStorage.put(name,data)
    return await unzipDB(name,data,solidConfig ) 
}
const initName =async ()=>{
    if (window.location.hash){
        const p = window.location.hash.slice(1)
        //window.location.hash=""
        if (/\_|\./.test(p))
            clearHash()
        return p
    }
    if (window.localStorage.length>0){
        return window.localStorage.key(0).split("*")[0]
    }
    const keys = await myStorage.keys()
    if (keys.length>0){
        return keys[0]
    }
    return null
}
const reloadDB =async (solidConfig:sConfig )=>{    
    const name = currentLocalDBConfig.path
    if (!name){ 
        return undefined
    } 
    const confPath = currentLocalDBConfig.configName() 
    const conf  = window.localStorage.getItem(confPath)
    if (conf){ 
        const obj = JSON.parse(conf) as mainConfigType 
        for (let i = 0;i<window.localStorage.length;i++){
            const key = window.localStorage.key(i) 
                handleCurrentMsg({
                    name:key.split("*")[1] ,
                    db:window.localStorage.getItem(key)
                },solidConfig.postMessage) 
        } 
        return obj       
    }else if (window.localStorage.length>0){
        if (window.confirm(`Save the [${window.localStorage.key(0).split("*")[0]}] ?`)){
            const data = await gzipCodeFromLocalStorage()
            if (data){
                myStorage.put(data.path,data.db)
            }
        }
    }
    console.log(name)
    const db = await myStorage.get(name) 
    if (db){ 
        return await unzipDB(name,db,solidConfig)   
    }   
    const data =  await fetchGZBuffer(name)
    if (data)
        return await analysisGzipDB(name,data,solidConfig)     
    return undefined
}

export const changeSolidConfig = (solidConfig:sConfig,showMenu:number)=>{
    reloadDB(solidConfig).then((windowConfig)=>{
        //console.log(obj)
        if (!windowConfig){
            window.alert("not data")
            return
        }
        Object.assign(solidConfig.workermsg.windowConfig,windowConfig,{includeImport}) 
        solidConfig.showMenu=showMenu 
        runWorker(solidConfig)
    })
}
 
export const loadLocalDBList  =async ( )=>{
    //solidConfig_ = solidConfig
    //currentLocalDBConfig.paths = await myStorage.keys() 
    currentLocalDBConfig.path = await initName() 
}
export const gzipCodeFromLocalStorage =async ()=>{
    if (window.localStorage.length===0){
        return
    }
    let path = ""
    let codeSrc = ""
    for (let i=0;i<window.localStorage.length;i++){
        const kn = window.localStorage.key(i)
        const [key,name] = kn.split("*")
        if (!path)path = key
        const src = window.localStorage.getItem(kn)
        codeSrc+=`
/**${name}*/
${src}`
         
    }
    return {db :await stringToGzip(codeSrc),path}
}
 
  
