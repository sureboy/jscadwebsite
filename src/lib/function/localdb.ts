import {gzipToString,srcStringToFile,
    getDBUrl,clearHash,stringToGzip
} from "./utils"
import type {windowConfigType,sConfig} from "./utils"
import {
    handleCurrentMsg,
    cleanCurrentMsg,
    getCurrent,
    getCurrentCode
}  from "./ImportParser"
import { runWorker } from "./worker";
import {IndexedDBStorage} from "$lib/function/IndexedDBStorage"
const myStorage = new IndexedDBStorage('solidjscad', 'gzfile', 1);
//export const tmpSolidConfig ={tmp:"solidjscad.json",conf:{}}
export const  currentLocalDBConfig:{
    paths?:string[],
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
const unzipDB = async(name:string,data:ArrayBuffer)=>{
    const v = await gzipToString(data)  
    if (!v){
        throw new Error('data err'); 
    }
    let obj:windowConfigType|undefined = undefined
    const files:string[] = []  
    currentLocalDBConfig.path =name 
    currentLocalDBConfig.paths = await myStorage.keys() 
    cleanCurrentMsg() 
    window.localStorage.clear()
    //mySolidTmp.update()
    srcStringToFile(v,(msg)=>{ 
        window.localStorage.setItem(currentLocalDBConfig.getPathX()+msg.name,msg.db) 
        //window.localStorage.setItem( msg.name,msg.db) 
        if (msg.name===currentLocalDBConfig.name){
            obj = JSON.parse(msg.db) as windowConfigType
            return
        }
        files.push(msg.name)
        handleCurrentMsg(msg)
    }) 
    if (obj){        
        if (!obj.files)obj.files=files
    }else{
        const plist = name.split("_")
        if (plist.length>=4){
            const [func,in_,name,date] = plist
            obj =  {func,in:in_,name,date,files}
            window.localStorage.setItem(currentLocalDBConfig.configName(),JSON.stringify(obj))
        }else{
            throw new Error('config err'); 
        }
    }
    
    return obj
}
export const analysisGzipDB =async (name:string,data:ArrayBuffer )=>{
    const oldName = currentLocalDBConfig.path
    if (oldName && oldName!==name && window.confirm("Will the current data be overwritten and need to be saved?")){
        const db = await getCodeGzFromLocalStorage() 
        const file = new Blob(db, { type: 'application/gzip' })
        //const olddb = await file.arrayBuffer()
        myStorage.put(oldName,await file.arrayBuffer())
    } 
    myStorage.put(name,data)
    return await unzipDB(name,data) 
}
const initName =async ()=>{
    if (window.location.hash){
        const p = window.location.hash.slice(1)
        //window.location.hash=""
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
const reloadDB =async ( )=>{
    
    const name = currentLocalDBConfig.path
    if (!name){ 
        return null
    }

    const SolidPath =currentLocalDBConfig.getPathX()// name +"*"
    const confPath =currentLocalDBConfig.configName()// SolidPath+currentLocalDBConfig.name
    const conf  = window.localStorage.getItem(confPath)
    if (conf){
        //console.log(conf)
        const obj = JSON.parse(conf) as windowConfigType
        obj.files.forEach((name)=>{
            handleCurrentMsg({
                name ,
                db:window.localStorage.getItem(SolidPath+name)})
        })
        return obj       
    }
    const db = await myStorage.get(name) 
    if (db){
        return await unzipDB(name,db)  
    }
    const req =await fetch(`${getDBUrl()}?k=${name}`)
    if (req.ok){
        return await analysisGzipDB(name,await req.arrayBuffer()) 
    } 
    return null
    
}
export const changeSolidConfig = (solidConfig:sConfig,showMenu:number)=>{
    reloadDB().then((obj)=>{
        console.log(obj)
        if (!obj)return
        Object.assign(solidConfig.workermsg,obj) 
        solidConfig.showMenu=showMenu 
        runWorker(solidConfig)
    })
    
}
 
export const loadLocalDBList  =async (solidConfig:sConfig)=>{
    //solidConfig_ = solidConfig
    currentLocalDBConfig.path =await initName()
    currentLocalDBConfig.paths = await myStorage.keys() 
   
}
export const getCodeGzFromLocalStorage =()=>{
    const confStr = window.localStorage.getItem(currentLocalDBConfig.configName())
    if (!confStr)return
    const conf = JSON.parse(confStr) as windowConfigType
    if (!conf.files)return;
    const p = currentLocalDBConfig.getPathX()
    let codeSrc = `
/**${currentLocalDBConfig.name}*/
${confStr}
` 
    conf.files.forEach((name)=>{
        const code = window.localStorage.getItem(p+name)
        codeSrc +=`
/**${name}*/
${code}
`
    })
    return stringToGzip(codeSrc)
}
export const getCodeGz =async (solidConfig:sConfig)=>{
    if (!window.CompressionStream || !window.DecompressionStream) {
        return
    }
    //const res = Exporter()  
    let indexName = solidConfig.workermsg.in;
    if (!indexName.startsWith("./")){
    indexName = "./"+indexName;
    }
    if (!indexName.endsWith(".js")){
    indexName += ".js"
    }
    //handleCurrentMsg({name:"./lib/csgChange.js"},postSrcMsg)
    const csgObj = await getCurrent("./lib/csgChange.js",(e)=>{
            postSrcMsg(solidConfig,e)
        });
    //console.log("csg",csgObj)
    //handleCurrentMsg({name:indexName},postSrcMsg)
    const current =await getCurrent(indexName,(e)=>{
            postSrcMsg(solidConfig,e)
        })  
    //console.log(current)
    let codeSrc = ""
    await getCurrentCode( csgObj,(name:string,code:string)=>{
    codeSrc +=`
/**${name}*/
${code}
`        //codeList.push(code)
    })
    await getCurrentCode( current,(name:string,code:string)=>{
    codeSrc +=`
/**${name}*/
${code}
`        //codeList.push(code)
//console.log(name)
    })
    codeSrc +=`
/**${currentLocalDBConfig.name}*/
${window.localStorage.getItem(currentLocalDBConfig.configName())}
` 
    const chunks = await stringToGzip(codeSrc)
    return new Blob(chunks, { type: 'application/gzip' });
}
const postSrcMsg = (solidConfig:sConfig,e:{ path?:string})=>{
    if (e.path){
    fetch( 
        e.path.replace(/^\.\//,`./${solidConfig.workermsg.src}/`) )
        .then(f=>{
        f.text().then(db=>{
            handleCurrentMsg({name:e.path,db},(e)=>{
            postSrcMsg(solidConfig,e)
        })
        })
        })
    }
}
