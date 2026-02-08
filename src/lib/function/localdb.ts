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
export const  currentMySolidKey = "currentSolidConfig"
export const mySolidTmp :{
    name:string ,
    path:string[],
    index?:number,
    update():void,
    configName():string,
    setPath(p:string):void,
    getPathX():string,
    getP():string} = {
    name:"solidjscad.json",
    path:[],
    configName:function(){
        return this.getPathX()+this.name
    },
    getP:function(){
        //return ""
        if (this.index!==undefined && this.index !==null)
            return this.path[this.index]
        else  if (this.path.length>0){
            this.index = this.path.length-1
            return this.getP()
        }else{
            return ""
        }
            
    },
    getPathX:function(){
        //return ""
        const p = this.getP()
        if (p){
            return p+"*"
        }else{
            return ""
        }
    },
    setPath:function(p:string){
        if (this.path.length===0){
            this.path.push(p)
            this.index = 0
            return
        }
        const i = this.path.indexOf(p)
        if (i<0){
            this.index = this.path.length
            this.path.push(p)

        }else{ 
            this.index = i 
        }
    },
    update:function(){
        window.localStorage.setItem(
            currentMySolidKey,
            JSON.stringify(this),
        )
    }
}
export const cleanSolidConfig = ()=>{
    const oldP =  mySolidTmp.getP()
    if (!oldP)return;
    mySolidTmp.path.splice(mySolidTmp.index,1)
    mySolidTmp.index = undefined;
    myStorage.del(oldP)
    window.localStorage.clear()
    mySolidTmp.update()
    window.location.reload()
    /*
    if (!files)return;
    window.localStorage.removeItem(mySolidTmp.configName())
    const p = mySolidTmp.getPathX()
    files.forEach((name)=>{
        window.localStorage.removeItem(p+name)
    })
    mySolidTmp.path.splice(mySolidTmp.index,1)
    if (mySolidTmp.path.length===0){
        mySolidTmp.index = undefined
    }else{
        mySolidTmp.index = mySolidTmp.path.length-1
    }
    mySolidTmp.update()
    window.location.reload()
    */
}
const unzipDB = async(name:string,data:ArrayBuffer)=>{
    const v = await gzipToString(data)  
    if (!v){
        throw new Error('data err'); 
    }
    let obj:windowConfigType|undefined = undefined
    const files:string[] = []  
    cleanCurrentMsg()
    window.localStorage.clear()
    srcStringToFile(v,(msg)=>{ 
        window.localStorage.setItem(mySolidTmp.getPathX()+msg.name,msg.db) 
        //window.localStorage.setItem( msg.name,msg.db) 
        if (msg.name===mySolidTmp.name){
            obj = JSON.parse(msg.db) as windowConfigType
            return
        }
        files.push(msg.name)
        handleCurrentMsg(msg)
    }) 
        if (obj){        
        obj.files=files
    }else{
        const plist = name.split("_")
        if (plist.length>=4){
            const [func,in_,name,date] = plist
            obj =  {func,in:in_,name,date,files}
            window.localStorage.setItem(mySolidTmp.configName(),JSON.stringify(obj))
        }else{
            throw new Error('config err'); 
        }
    }
    
    return obj
}
export const analysisGzipDB =async (name:string,data:ArrayBuffer )=>{
    const oldName = mySolidTmp.getP()
    if (oldName && oldName!==name && window.confirm("Will the current data be overwritten and need to be saved?")){
        const db = await getCodeGzFromLocalStorage() 
        const file = new Blob(db, { type: 'application/gzip' })
        const olddb = await file.arrayBuffer()
        myStorage.put(oldName,olddb)
    }
    mySolidTmp.setPath(name) 
    //cleanCurrentMsg()
    //window.localStorage.clear()
    
    myStorage.put(name,data)

    const obj =  await unzipDB(name,data)
    mySolidTmp.update()
    return obj
     
}
export const changeSolidConfig = (solidConfig:sConfig,showMenu:number)=>{
    if (window.location.hash){
        const p = window.location.hash.slice(1)
        window.location.hash=""
        clearHash()
        if (p){
            const index =  mySolidTmp.path.indexOf(p)
            if (index>=0){
                mySolidTmp.index = index
            }else{
                fetch(`${getDBUrl()}?k=${p}`).then(v=>{
                    v.arrayBuffer().then(db=>{ 
                        analysisGzipDB(p,db).then(obj=>{ 
                            Object.assign(solidConfig.workermsg,obj) 
                            solidConfig.showMenu=showMenu 
                            runWorker(solidConfig)
                            
                        })
                    })
                })
                return
            }
        }
    }
    if (!mySolidTmp.path){
        return
    }
    const myConf = window.localStorage.getItem(mySolidTmp.configName())
    if (!myConf){
        const name = mySolidTmp.getP()
        console.log(name,mySolidTmp)
        myStorage.get(name).then(db=>{
            if (!db)return;
            unzipDB(name,db).then(obj=>{
                Object.assign(solidConfig.workermsg,obj) 
                solidConfig.showMenu=showMenu 
                runWorker(solidConfig)
            })
        })
        return
    };
    Object.assign(solidConfig.workermsg,JSON.parse(myConf))
    reloadSolidConfig(solidConfig.workermsg.files)
    
    solidConfig.showMenu=showMenu 
    runWorker(solidConfig)
}
const reloadSolidConfig = (files:string[])=>{
    const SolidPath = mySolidTmp.getPathX()
    files.forEach((name)=>{
        handleCurrentMsg({
            name ,
            db:window.localStorage.getItem(SolidPath+name)})
    })
    /*
    for (let i=0;i<window.localStorage.length;i++){
        const name = window.localStorage.key(i)
        if (!name || !name.startsWith(SolidPath)){
            continue
        }         
        handleCurrentMsg({
            name:name.split("*")[1],
            db:window.localStorage.getItem(name)})
    }*/
}
export const loadmySolid  = (solidConfig:sConfig)=>{
    //solidConfig_ = solidConfig
    try{
        Object.assign(
            mySolidTmp,
            JSON.parse(
                window.localStorage.getItem(currentMySolidKey) || "{}"
            )
        )
    }catch(e){
        return
    }
}
export const getCodeGzFromLocalStorage =()=>{
    const confStr = window.localStorage.getItem(mySolidTmp.configName())
    if (!confStr)return
    const conf = JSON.parse(confStr) as windowConfigType
    if (!conf.files)return;
    const p = mySolidTmp.getPathX()
    let codeSrc = `
/**${mySolidTmp.name}*/
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
/**${mySolidTmp.name}*/
${window.localStorage.getItem(mySolidTmp.configName())}
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
