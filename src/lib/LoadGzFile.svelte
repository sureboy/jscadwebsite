<script lang="ts">
import {gzipToString,srcStringToJsFile} from "./function/utils"
import type {windowConfigType,sConfig} from "./function/utils"
import {handleCurrentMsg}  from "./function/ImportParser"
import { runWorker } from "./function/worker";
import {MenuType} from "./function/utils"
import { addSceneSTL,startSceneOBJ} from "./function/threeScene" 
import {STLLoader} from "three/addons/loaders/STLLoader.js" 
//    import { getOutputFileNames } from "typescript";
let { myConfig,solidConfig }: { myConfig: windowConfigType,solidConfig:sConfig  } = $props(); 
const reader = new FileReader();
const textDecoder = new TextDecoder();

const readfile = (file:File)=>{
    solidConfig.showMenu=0
    console.log(file.type )
    reader.onload = (e) => {
        switch (file.type){
            case "application/gzip":
                const [func,in_,name] =file.name.split(".")[0].split("_")  
                gzipToString(e.target.result as (ArrayBuffer)).then(v=>{ 
                    const myConfigStr = JSON.stringify(Object.assign(myConfig,{func,in:in_,name}))
                    window.localStorage.clear();
                    window.localStorage.setItem(myConfigFileName,myConfigStr)
                    srcStringToJsFile(v,(msg)=>{
                        //console.log(msg.name)
                        window.localStorage.setItem(msg.name,msg.db)
                        //fileList.push(msg.name)

                        handleCurrentMsg(msg)
                    })
                    //console.log(fileList) 
                    //show=true
                    solidConfig.showMenu=showMenu
                    runWorker(solidConfig );
                })
                return
            case "text/javascript":
                const msg = {db:textDecoder.decode(e.target.result as ArrayBuffer),name:file.name}
                //console.log("js",msg)
                window.localStorage.setItem(msg.name,msg.db)
                handleCurrentMsg(msg)
                if (window.localStorage.getItem(myConfigFileName)){
                    solidConfig.showMenu=showMenu
                    runWorker(solidConfig );
                }
                return
            case "model/stl":
                startSceneOBJ(solidConfig.el);
                  addSceneSTL(solidConfig.el,new STLLoader().parse(e.target.result as ArrayBuffer));
                  solidConfig.showMenu=1<<2
                  solidConfig.workermsg.options  = undefined
            default:
                console.log(file.type)
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
 
export const myConfigFileName:string = "solidjscad.json"
export const showMenu = MenuType.MainMenu | MenuType.Camera | MenuType.Gzip | MenuType.Stl | MenuType.Png
export const loadMyConfig = (solidConfig:sConfig)=>{
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

</script>

<input style="height:48:px;line-height:48px;cursor: pointer;"
 
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
        window.localStorage.setItem(myConfigFileName,JSON.stringify(myConfig))
        window.localStorage.setItem(fileName,newPackageCode)
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



 