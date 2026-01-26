<script lang="ts">
import {gzipToString,srcStringToJsFile} from "./function/utils"
import type {windowConfigType,sConfig} from "./function/utils"
import {handleCurrentMsg,cleanCurrentMsg}  from "./function/ImportParser"
import { runWorker } from "./function/worker";
import {MenuType} from "./function/utils"
import { addSceneSTL,startSceneOBJ} from "./function/threeScene" 
import {STLLoader} from "three/addons/loaders/STLLoader.js" 
//    import { getOutputFileNames } from "typescript";
const { myConfig,solidConfig }: { myConfig: windowConfigType,solidConfig:sConfig  } = $props(); 
const reader = new FileReader();
const textDecoder = new TextDecoder();

const analysisGzip = (file:File,data: ArrayBuffer)=>{
    if (!file.name.endsWith(".solidjscad.gz")){
        return
    }    
    //if (!window.confirm(`The current data will be overwritten!!`)){
    //    return;
    //}    
    solidConfig.showMenu=0
    const p = file.name.split(".")[0]
    mySolidConfig.setPath(p)
    const [func,in_,name,date] = p.split("_")  
    gzipToString(data).then(v=>{ 
        
        cleanCurrentMsg()
        const files:string[] = []
        
        //myConfig.files=[]
        srcStringToJsFile(v,(msg)=>{ 
            window.localStorage.setItem(mySolidConfig.getPathX()+msg.name,msg.db) 
            //window.localStorage.setItem( msg.name,msg.db) 
           
            files.push(msg.name)
            handleCurrentMsg(msg)
        }) 
        const obj =  {func,in:in_,name,date,files}
        Object.assign(myConfig,obj)
        mySolidConfig.update()
        //const myConfigStr = JSON.stringify(obj)
        //console.log("----",myConfig.func,myConfig.date)
        //window.localStorage.clear();
        window.localStorage.setItem(mySolidConfig.configName(),JSON.stringify(obj))
        solidConfig.showMenu=showMenu
        runWorker(solidConfig );
    })
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
                analysisGzip(file,e.target.result as ArrayBuffer)
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
    
    if (!mySolidConfig.path){
        return
    }
    changeSolidConfig(solidConfig) 
}
const changeSolidConfig = (solidConfig:sConfig)=>{
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
        fileName="./index.js"    
    }
    fileName= prompt("input file name",fileName)
    if (!fileName){
        return
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
     
    if (!fileName.startsWith("./")){
        fileName = "./"+fileName
    }
    if (!fileName.endsWith(".js")){
        fileName += ".js"
    }
    console.log(fileName)
    window.open("/edit#"+mySolidConfig.getPathX()+fileName)

 
}}>+</button>


 