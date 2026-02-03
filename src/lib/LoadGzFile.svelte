<script lang="ts">
import {gzipToString,srcStringToFile} from "./function/utils"
import type {windowConfigType,sConfig} from "./function/utils"
import {handleCurrentMsg,cleanCurrentMsg}  from "./function/ImportParser"
import { runWorker } from "./function/worker";
import {MenuType,getDBUrl,clearHash} from "./function/utils"
import { addSceneSTL,startSceneOBJ} from "./function/threeScene" 
import {STLLoader} from "three/addons/loaders/STLLoader.js" 
//    import { getOutputFileNames } from "typescript";
const { myConfig,solidConfig }: { myConfig: windowConfigType,solidConfig:sConfig  } = $props(); 
const reader = new FileReader();
const textDecoder = new TextDecoder();

const analysisGzip =async ( fileName:string,data: ArrayBuffer)=>{
      
    //if (!window.confirm(`The current data will be overwritten!!`)){
    //    return;
    //}    
    solidConfig.showMenu=0
    const p = fileName.split(".")[0]
    //mySolidConfig.setPath(p) 
    //const v = await gzipToString(data)  
    //if (!v)return 
    let obj =await analysisGzipDB(p,data) 
    if (!obj)return 
    Object.assign(myConfig,obj) 
    solidConfig.showMenu=showMenu
    runWorker(solidConfig ); 
}

const readfile = (file:File)=>{
    console.log(file )
    reader.onload = (e) => {
        switch (file.type){
            case "text/javascript":
                const msg = {db:textDecoder.decode(e.target.result as ArrayBuffer),name:file.name}
                //console.log("js",msg)
                //solidConfig.showMenu=0
                window.localStorage.setItem(mySolidConfig.getPathX()+msg.name,msg.db)
                handleCurrentMsg(msg)
                if (window.localStorage.getItem(mySolidConfig.configName())){
                    solidConfig.showMenu=showMenu
                    runWorker(solidConfig );
                }
                return
            case "model/stl":
                solidConfig.showMenu=0
                startSceneOBJ(solidConfig.el);
                addSceneSTL(solidConfig.el,new STLLoader().parse(e.target.result as ArrayBuffer));
                solidConfig.showMenu=MenuType.Camera //| MenuType.Stl
                solidConfig.workermsg.options  = undefined
                return
            default:
                if (!file.name.endsWith(".solidjscad.gz")){
                    return
                } 
                analysisGzip(file.name,e.target.result as ArrayBuffer)
                //window.alert(`Not supporting file format '${file.type}'  `)
                //console.log(file.type)
                return
        }
 

    } 
    reader.readAsArrayBuffer(file);
}
</script>
<script lang="ts" module> 
//export const fileList:string[] = $state([])
//let show =$state(false)
export let newPackageCode:string = `import modeling from './lib/modeling.esm.js';
export const main=(opt)=>{
    const option = Object.assign({size:10},opt)
    return [modeling.primitives.cube(option),option]
}`
//let solidConfig_:sConfig
const  currentSolidConfigKey = "currentSolidConfig"
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
    //if (window.location.hash){

    //}
    
    
    //changeSolidConfig(solidConfig) 
}
const analysisGzipDB =async (name:string,data:ArrayBuffer )=>{
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
export const changeSolidConfig = (solidConfig:sConfig)=>{
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
export const showMenu = MenuType.MainMenu | MenuType.Camera | MenuType.Gzip | MenuType.Stl | MenuType.Png

</script>
<select name="cars" id="cars" bind:value={mySolidConfig.index  } onchange={(e)=>{
    const select = e.target as HTMLSelectElement
    //console.log(select.value)
    switch (select.value) {
        case "":
            return;
        case "more":
            window.open("/more");
            return 
        default:
            mySolidConfig.index = Number(select.value)
            mySolidConfig.update()
            window.location.reload()
            return
    }   
}}>
    <option value="">--</option>
    {#each mySolidConfig.path as p,i}
        <option value={i} >{p}</option>
    {/each}
    <option value="more">...more</option>
    
</select>
<input style="height:48:px;line-height:48px;cursor: pointer;"
accept=".stl,.solidjscad.gz"
type="file" onchange={(event)=>{
    const input = event.target as HTMLInputElement;
    console.log(input.files)
    if (input.files.length===0){
        return;
    }
    readfile(input.files[0])
    
}} />
<button onclick={()=>{
    let fileName=""
    if (!myConfig.in){
        fileName="index"    
    }
    fileName= prompt("input file name",fileName)
    if (!fileName){
        return
    }
    if (!fileName.startsWith("./")){
        fileName = "./"+fileName
    }
    if (!fileName.endsWith(".js")){
        fileName += ".js"
    }
    if (!myConfig.in){
        myConfig.in = fileName;
        myConfig.name="SolidJSCAD"
        myConfig.func="main"
        myConfig.date = Date.now().toString()
        myConfig.files = [fileName]
        //[func,in_,name,date]
        mySolidConfig.setPath(
            [
                myConfig.func,
                myConfig.in,
                myConfig.name,
                myConfig.date].join("_")
            )
        window.localStorage.setItem(mySolidConfig.configName(),JSON.stringify(myConfig))
        window.localStorage.setItem(mySolidConfig.getPathX()+fileName,newPackageCode)
        mySolidConfig.update()
    }
     

    //console.log(fileName)
    window.location.href = "/edit#"+mySolidConfig.getPathX()+fileName
    //window.open("/edit#"+mySolidConfig.getPathX()+fileName)

 
}}>+</button>
