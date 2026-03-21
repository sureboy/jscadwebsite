<script lang="ts"> 
import type {windowConfigType,sConfig} from "./function/utils"
import {handleCurrentMsg,cleanCurrentMsg}  from "./function/ImportParser"
import { runWorker } from "./function/worker";
import {MenuType} from "./function/utils"
import { addSceneSTL,startSceneOBJ} from "./function/threeScene" 
import {STLLoader} from "three/addons/loaders/STLLoader.js" 
import {
    myStorage,
    analysisGzipDB,
    currentLocalDBConfig,
    gzipCodeFromLocalStorage} from "./function/localdb"
//    import { getOutputFileNames } from "typescript";
const { solidConfig }: {  solidConfig:sConfig  } = $props(); 
   //const myConfig = solidConfig.workermsg.windowConfig
let addClick:HTMLButtonElement;
const analysisGzip =async ( fileName:string,data: ArrayBuffer)=>{    
    solidConfig.showMenu=0
    const p = fileName.split(".")[0] 
    let windowConfig =await analysisGzipDB(p,data,solidConfig) 
    if (!windowConfig)return 
    Object.assign(solidConfig.workermsg,{windowConfig}) 
    solidConfig.showMenu=showMenu
    runWorker(solidConfig ); 
} 
const readfile = (file:File)=>{
    //console.log(file )
    const reader = new FileReader();
    const textDecoder = new TextDecoder();
    reader.onload = (e) => {
        switch (file.type){
            case "text/javascript":
                const msg = {db:textDecoder.decode(e.target.result as ArrayBuffer),name:file.name}
                //console.log("js",msg)
                //solidConfig.showMenu=0
                window.localStorage.setItem(currentLocalDBConfig.getPathX()+msg.name,msg.db)
                handleCurrentMsg(msg)
                if (window.localStorage.getItem(currentLocalDBConfig.configName())){
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
export let newPackageCode:string = `import modeling from '@jscad/modeling';
import  manifold from 'manifold-3d';
const Manifold = await  manifold()
Manifold.setup()
export const manifold_main= (opt)=>{   
  const option = Object.assign({size:2},opt);   
  const box = Manifold.Manifold.cube(option.size,true);    
  const sphere = Manifold.Manifold.sphere(1.2, 48);     
  const sphereTranslated = sphere.translate([0.8, 0.8, 0.8]); 
  const result = box.subtract(sphereTranslated);
  const meshData = result.getMesh();
  const vertices= meshData.vertProperties;
  const indices = meshData.triVerts;   
  box.delete();
  sphere.delete();
  sphereTranslated.delete();
  result.delete();
  return [{vertices,indices},option]
}
export const main=(opt)=>{
  const option = Object.assign({size:10},opt)
  return [modeling.primitives.cube(option),option]
}`
export const showMenu = MenuType.MainMenu | MenuType.Camera | MenuType.Gzip | MenuType.Stl | MenuType.Png

</script>
<select name="cars" id="cars"   onchange={(e)=>{
    const select = e.target as HTMLSelectElement
    //console.log(select.value)
    switch (select.value) {
        case "":
            return;
        case "new":
            gzipCodeFromLocalStorage().then(data=>{
                if (data){
                    myStorage.put(data.path,data.db)
                }
            })       
            cleanCurrentMsg() 
            window.localStorage.clear()
            solidConfig.workermsg.windowConfig = undefined
            addClick.click();
            return;
        case "more":
            window.open("/more");
            return 
        default:
            //mySolidTmp.index = Number(select.value)
            //mySolidTmp.update()
            //currentLocalDBConfig.path = select.value 
            //history.replaceState(null, null, '#'+select.value);
            window.location.hash = select.value
            //changeSolidConfig(solidConfig,showMenu)
            //console.log(mySolidTmp)
            window.location.reload()
            return
    }   
}}>
    <option value="">--</option>
    <option value="new">New project</option>
    {#await myStorage.keys() then paths }
        
   
        
    
    {#each paths as p}
        <option value={p} >{p}</option>
    {/each}
    {/await}
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
<button bind:this={addClick} onclick={()=>{
    //let fileName=""
    //const myConfig = solidConfig.workermsg.windowConfig
  
    const fileName= prompt("input file name",solidConfig.workermsg.windowConfig?"":"index")
    if (!fileName){
        return
    }
    let file_n = fileName
    if (!file_n.startsWith("./")){
        file_n = "./"+file_n
    }
    if (!file_n.endsWith(".js")){
        file_n += ".js"
    }
    if (!solidConfig.workermsg.windowConfig){

        const myConfig = solidConfig.workermsg.windowConfig = {
            in : fileName,
            name:"SolidJSCAD",
            func:"main",
            date : Date.now().toString(),
            //files : [file_n],
            includeImport:{
            "@jscad/modeling": "./lib/modeling.esm.js",
            "csgChange": "./lib/csgChange.js",
            "manifold-3d":"./lib/manifold/manifold.js"
            }
        }
        
        //[func,in_,name,date]
        currentLocalDBConfig.path = [
                myConfig.func,
                myConfig.in,
                myConfig.name,
                myConfig.date].join("_")
            
        window.localStorage.setItem(currentLocalDBConfig.configName(),JSON.stringify(myConfig,null,2))
        window.localStorage.setItem(currentLocalDBConfig.getPathX()+file_n,newPackageCode)
        //mySolidTmp.update()
    }
     

    //console.log(fileName)
    window.location.href = "/edit#"+currentLocalDBConfig.getPathX()+file_n
    //window.open("/edit#"+currentLocalDBConfig.getPathX()+fileName)

 
}}>+</button>
