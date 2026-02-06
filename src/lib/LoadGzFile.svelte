<script lang="ts"> 
import type {windowConfigType,sConfig} from "./function/utils"
import {handleCurrentMsg}  from "./function/ImportParser"
import { runWorker } from "./function/worker";
import {MenuType} from "./function/utils"
import { addSceneSTL,startSceneOBJ} from "./function/threeScene" 
import {STLLoader} from "three/addons/loaders/STLLoader.js" 
import {analysisGzipDB,mySolidConfig} from "./function/localdb"
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
