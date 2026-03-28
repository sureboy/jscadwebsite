<script lang="ts">
import type {sConfig} from "$lib/function/utils" 
import {includeImport} from "$lib/function/utils"
import ShowSolid,{initSolidPage}  from '$lib/components/ShowSolid.svelte';
import { handleCurrentMsg }  from "$lib/function/ImportParser" 
import FileMenu from "$lib/website/FileMenu.svelte";
import Menu ,{menuConfig} from '$lib/components/Menu.svelte'
import { runWorker } from "$lib/function/worker";
import { showMenu } from "$lib/website/LoadGzFile.svelte";
import { onMount } from 'svelte'; 
//import aboutUs from '$lib/aboutUs.svelte'
import {
    changeSolidConfig,
    loadLocalDBList,
    currentLocalDBConfig
} from "$lib/website/localdb" 
import {imgStorage,createPng} from "$lib/website/localImg"
const solidConfig:sConfig = $state({ 
    includeImport,
    showAd:true,
    showMenu:0,
    postMessage:(e:{type:string,path?:string})=>{ 
        if (e.path){
            console.log(e.path) 
            //if (solidConfig.includeImport[e.path]){
                setTimeout(()=>{
                    handleCurrentMsg({
                    name: e.path
                    },
                    solidConfig.postMessage
                ).getUri =async ()=>new URL(
                    solidConfig.includeImport[e.path] ||e.path ,
                    new URL(import.meta.url).origin).toString();
                })
                /*
            }else{
                console.log("req",e)
                fetch(e.path).then(res=>{
                    res.arrayBuffer().catch(db=>{
                        handleCurrentMsg({
                            name: e.path,
                            db 
                        },
                        solidConfig.postMessage
                        )
                    })                        
                })
            }  */   
        }
        if (e.type==="end"){
            console.log("show 3d solid module end",currentLocalDBConfig)
            imgStorage.get(currentLocalDBConfig.path).then(v=>{
                console.log(v)
                if (v){return}
                createPng(solidConfig.el,(screenCanvas)=>{
                    screenCanvas.toBlob((db)=>{
                        imgStorage.put(currentLocalDBConfig.path,db)
                        console.log("push",currentLocalDBConfig.path)
                    })
                })
            }).catch(e=>{
                console.log("get err",e)
            })
        }
    },
}) 
const initMenu = ( )=>{
    //solidConfig.isVscode = (window as any).vscode?true:false
    solidConfig.workermsg  = Object.assign(menuConfig,{windowConfig:{
    //port:0,
    name:"",
    func:"",
    in:"",
    src:"",
    //worker:"",
    //includeImport 
    //pageType:"run"
}})
}
onMount(()=>{
    initSolidPage(solidConfig)
    //window.localStorage.getItem("")
    initMenu()
    loadLocalDBList().then((p)=>{
        if (p.path==="new"){
            //newProject()
            return
        }
        changeSolidConfig(solidConfig,showMenu) 
    }) 
    window.addEventListener("storage",(e)=>{
        //console.log("storage",e) 
        if (e.newValue 
            && e.key.startsWith(currentLocalDBConfig.getPathX()) 
            && !e.key.endsWith(currentLocalDBConfig.name)
        ){
            //console.log("save run")
            const name = e.key.split("*")[1]
            handleCurrentMsg({name,db:e.newValue},solidConfig.postMessage)
            
            solidConfig.showMenu=showMenu 
            runWorker(solidConfig) 
        } 
    }) 
})
 
</script>
<svelte:head><title>{solidConfig.workermsg?.windowConfig?.name||"solidJSCAD"}</title></svelte:head>
<ShowSolid></ShowSolid> 
 
 
<Menu  {solidConfig}  >
    <FileMenu {solidConfig} ></FileMenu> 
</Menu> 

 
 
 
 

 
