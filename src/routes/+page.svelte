<script lang="ts">
import type {windowConfigType,sConfig} from "$lib/function/utils" 
import ShowSolid,{initSolidPage}  from '$lib/ShowSolid.svelte';
import { handleCurrentMsg }  from "$lib/function/ImportParser" 
import FileMenu from "$lib/FileMenu.svelte";
import Menu ,{menuConfig} from '$lib/Menu.svelte'
import { runWorker } from "$lib/function/worker";
import { showMenu } from "$lib/LoadGzFile.svelte";
import { onMount } from 'svelte'; 
import {
    changeSolidConfig,
    loadLocalDBList,
    currentLocalDBConfig
} from "$lib/function/localdb" 
import {imgStorage,createPng} from "$lib/function/localImg"
const myConfig:windowConfigType  = $state({
    port:0,
    name:"",
    func:"",
    in:"",
    src:"",
    worker:"",
    files:[]
    //pageType:"run"
}) 
const solidConfig:sConfig = $state({ 
    showMenu:0,
    postMessage:(e:{type:string,path?:string})=>{ 
        if (e.path){
            const db = window.localStorage.getItem(e.path)
            if (db){
                setTimeout(()=>{ 
                    handleCurrentMsg({
                        name:e.path,
                        db},
                        solidConfig.postMessage
                    )
                }) 
            }else if ( solidConfig.workermsg.windowConfig.includeImport ){
                const p = solidConfig.workermsg.windowConfig.includeImport[e.path]
                if (p){
                    fetch(p).then(res=>{
                        if (!res.ok){
                            return
                        }
                        res.arrayBuffer().then(db=>{
                            handleCurrentMsg({
                                name:e.path,
                                db},
                                solidConfig.postMessage
                            )
                        })
                    })
                }
            }
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
const initMenu = (windowConfig:windowConfigType)=>{
    solidConfig.workermsg  = Object.assign(menuConfig,{windowConfig})
}
onMount(()=>{
    initSolidPage(solidConfig)
    //window.localStorage.getItem("")
    initMenu(myConfig)
    loadLocalDBList().then(()=>{
        changeSolidConfig(solidConfig,showMenu) 
    }) 
    window.addEventListener("storage",(e)=>{
        console.log("storage",e) 
        if (e.newValue 
            && e.key.startsWith(currentLocalDBConfig.getPathX()) 
            && !e.key.endsWith(currentLocalDBConfig.name)
        ){
            handleCurrentMsg({name:e.key.split("*")[1] ,db:e.newValue},solidConfig.postMessage)
            solidConfig.showMenu=showMenu
            runWorker(solidConfig) 
        } 
    }) 
})
 
</script>
<svelte:head><title>{myConfig.name||"solidJSCAD"}</title></svelte:head>
<ShowSolid></ShowSolid> 
 
 
<Menu  {solidConfig}  >
    <FileMenu {myConfig} {solidConfig} ></FileMenu> 
</Menu> 
 
 
 

 
