<script lang="ts">
import {gzipToString,srcStringToJsFile} from "$lib/function/utils"
import type {windowConfigType,sConfig} from "$lib/function/utils"
import {handleCurrentMsg}  from "$lib/function/ImportParser"
import { runWorker } from "$lib/function/worker";
import {MenuType} from "$lib/function/utils"
let { myConfig,solidConfig }: { myConfig: windowConfigType,solidConfig:sConfig  } = $props(); 
const reader = new FileReader();
const textDecoder = new TextDecoder();
const readfile = (file:File)=>{
    solidConfig.showMenu=0
    reader.onload = (e) => {
        if (file.name.endsWith(".js")){
            //const textDecoder = new TextDecoder();
            //const resultText = textDecoder.decode(e.target.result as ArrayBuffer);
            
            const msg = {db:textDecoder.decode(e.target.result as ArrayBuffer),name:file.name}
            //console.log("js",msg)
            window.localStorage.setItem(msg.name,msg.db)
            handleCurrentMsg(msg)
            if (window.localStorage.getItem("myconfig")){
                solidConfig.showMenu=showMenu
                runWorker(solidConfig );
            }
            return
        }
        //console.log(e,e.target.result);
        const [func,in_,name] =file.name.split(".")[0].split("_") 
        Object.assign(myConfig,{func,in:in_,name})
        //console.log(myConfig)
        gzipToString(e.target.result as (ArrayBuffer)).then(v=>{
        //    fileList.length = 0
        window.localStorage.clear();
        window.localStorage.setItem("myconfig",JSON.stringify(myConfig))
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
    } 
    reader.readAsArrayBuffer(file);
}
</script>
<script lang="ts" module> 
//export const fileList:string[] = $state([])
//let show =$state(false)
const showMenu = MenuType.MainMenu | MenuType.Camera | MenuType.Gzip | MenuType.Stl | MenuType.Png
export const loadMyConfig = (solidConfig:sConfig)=>{
    const myConf = window.localStorage.getItem("myconfig")
    if (myConf) {
        Object.assign(solidConfig.workermsg,JSON.parse(myConf))
         
        for (let i=0;i<window.localStorage.length;i++){
            const name = window.localStorage.key(i)
            console.log(name,i)
            if (name && name.startsWith(".") ){
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
accept=".solidjscad.gz,.js"
type="file" onchange={(event)=>{
    const input = event.target as HTMLInputElement;
    console.log(input.files)
    if (input.files.length===0){
        return;
    }
    readfile(input.files[0])
    
}} />
 
 

 