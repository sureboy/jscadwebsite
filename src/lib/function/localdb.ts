import {gzipToString,srcStringToFile,
    getDBUrl,clearHash,stringToGzip
} from "./utils"
import type {windowConfigType,sConfig} from "./utils"
import {handleCurrentMsg,cleanCurrentMsg,getCurrent,getCurrentCode}  from "./ImportParser"
import { runWorker } from "./worker";
export const  currentSolidConfigKey = "currentSolidConfig"
export const mySolidConfig:{
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
        if (this.index!==undefined)
            return this.path[this.index]
        else  if (this.path.length>0){
            this.index = this.path.length-1
            return this.getP()
        }else{
            return ""
        }
            
    },
    getPathX:function(){
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
            currentSolidConfigKey,
            JSON.stringify(this),
        )
    }
}
export const cleanSolidConfig = (files?:string[])=>{
    if (!files)return;
    
    window.localStorage.removeItem(mySolidConfig.configName())
    const p = mySolidConfig.getPathX()
    files.forEach((name)=>{
        window.localStorage.removeItem(p+name)
    })
    mySolidConfig.path.splice(mySolidConfig.index,1)
    if (mySolidConfig.path.length===0){
        mySolidConfig.index = undefined
    }else{
        mySolidConfig.index = mySolidConfig.path.length-1
    }
    mySolidConfig.update()
    window.location.reload()
}
export const analysisGzipDB =async (name:string,data:ArrayBuffer )=>{
    let obj:windowConfigType|undefined = undefined
    const v = await gzipToString(data)  
    
    if (!v){
        throw new Error('data err'); 
    }
    mySolidConfig.setPath(name) 
    cleanCurrentMsg()
    const files:string[] = []     
    srcStringToFile(v,(msg)=>{ 
        window.localStorage.setItem(mySolidConfig.getPathX()+msg.name,msg.db) 
        //window.localStorage.setItem( msg.name,msg.db) 
        if (msg.name===mySolidConfig.name){
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
            window.localStorage.setItem(mySolidConfig.configName(),JSON.stringify(obj))
        }else{
            throw new Error('config err'); 
        }
    }
    mySolidConfig.update()
    return obj
}
export const changeSolidConfig = (solidConfig:sConfig,showMenu:number)=>{
    if (window.location.hash){
        const p = window.location.hash.slice(1)
        window.location.hash=""
        clearHash()
        if (p){
            const index =  mySolidConfig.path.indexOf(p)
            if (index>=0){
                mySolidConfig.index = index
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

    if (!mySolidConfig.path){
        return
    }
    const myConf = window.localStorage.getItem(mySolidConfig.configName())
    if (!myConf)return;
    Object.assign(solidConfig.workermsg,JSON.parse(myConf))
    reloadSolidConfig(solidConfig.workermsg.files)
    
    solidConfig.showMenu=showMenu 
    runWorker(solidConfig)
}
const reloadSolidConfig = (files:string[])=>{
    const SolidPath = mySolidConfig.getPathX()
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
export const loadSolidConfig = (solidConfig:sConfig)=>{
    //solidConfig_ = solidConfig
    try{
        Object.assign(
            mySolidConfig,
            JSON.parse(
                window.localStorage.getItem(currentSolidConfigKey) 
            )
        )
    }catch(e){
        return
    }
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
    console.log("csg",csgObj)
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
/**${mySolidConfig.name}*/
${window.localStorage.getItem(mySolidConfig.configName())}
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
