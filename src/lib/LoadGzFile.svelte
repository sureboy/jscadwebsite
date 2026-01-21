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
    
    if (!window.confirm(`The current data will be overwritten!!`)){
        return;
    }
    
    solidConfig.showMenu=0
    mySolidConfig.path = file.name.split(".")[0]
    const [func,in_,name,date] = mySolidConfig.path.split("_")  
    gzipToString(data).then(v=>{ 
        const myConfigStr = JSON.stringify(Object.assign(myConfig,{func,in:in_,name,date}))
        //window.localStorage.clear();
        window.localStorage.setItem(mySolidConfig.configName(),myConfigStr)
        cleanCurrentMsg()
        srcStringToJsFile(v,(msg)=>{ 
            window.localStorage.setItem(mySolidConfig.getPath()+msg.name,msg.db) 
            //window.localStorage.setItem( msg.name,msg.db) 
            handleCurrentMsg(msg)
        }) 
        window.localStorage.setItem(currentSolidConfigKey,mySolidConfig.path)
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
                window.localStorage.setItem(mySolidConfig.getPath()+msg.name,msg.db)
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
const  currentSolidConfigKey = "currentSolidConfig"
export const mySolidConfig:{name:string ,path:string,configName:()=>string,getPath:()=>string} = {
    name:"solidjscad.json",
    path:"",
    configName:function(){
        return this.getPath()+this.name
    },
    getPath:function(){
        return this.path+"*"
    }
}
export const loadSolidConfig = (solidConfig:sConfig)=>{
    mySolidConfig.path = window.localStorage.getItem(currentSolidConfigKey) ||""
    if (!mySolidConfig.path){
        return
    } 
    const myConf = window.localStorage.getItem(mySolidConfig.configName())
    if (!myConf)return;
    Object.assign(solidConfig.workermsg,JSON.parse(myConf))
    for (let i=0;i<window.localStorage.length;i++){
        const name = window.localStorage.key(i)
        if (!name || !name.startsWith(mySolidConfig.getPath())){
            continue
        }
         
        handleCurrentMsg({name:name.split("*")[1],db:window.localStorage.getItem(name)})
        //console.log(name,i)
        //if (name && myConfigFileName !== name ){
            //fileList.push(name)
            
        //}
    }
    solidConfig.showMenu=showMenu
    runWorker(solidConfig)

}
export const showMenu = MenuType.MainMenu | MenuType.Camera | MenuType.Gzip | MenuType.Stl | MenuType.Png
/*
export const loadSolidConfig_bak = (solidConfig:sConfig)=>{
    const myConf = window.localStorage.getItem(myConfigFileName)
    if (myConf) {
        Object.assign(solidConfig.workermsg,JSON.parse(myConf))
         
        for (let i=0;i<window.localStorage.length;i++){
            const name = window.localStorage.key(i)
            console.log(name,i)
            if (name && myConfigFileName !== name ){
                //fileList.push(name)
                handleCurrentMsg({name,db:window.localStorage.getItem(name)})
            }
        }
        solidConfig.showMenu=showMenu
        runWorker(solidConfig)
    }
}
*/
</script>

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
        //[func,in_,name,date]
        mySolidConfig.path = [myConfig.func,myConfig.in,myConfig.name,myConfig.date].join("_")
        window.localStorage.setItem(mySolidConfig.configName(),JSON.stringify(myConfig))
        window.localStorage.setItem(mySolidConfig.getPath()+fileName,newPackageCode)
    }
     
    if (!fileName.startsWith("./")){
        fileName = "./"+fileName
    }
    if (!fileName.endsWith(".js")){
        fileName += ".js"
    }
    const link = document.createElement('a');
    link.href = "/edit#"+fileName
    link.target="_blank"
    link.click()
}}>+</button>

<button onclick={(e)=>{
    console.log(e)
    window.open("/templates");
}}>...</button>