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
const myConfig:windowConfigType  = $state({
    port:0,
    name:"",
    func:"",
    in:"",
    src:"",
    pageType:"run"
}) 
const solidConfig:sConfig = $state({ 
    showMenu:0,
    postMessage:(e:{type:string,path?:string})=>{ 
        if (e.path){
            setTimeout(()=>{
                handleCurrentMsg({
                    name:e.path,
                    db:window.localStorage.getItem(e.path)},
                    solidConfig.postMessage
                )
            }) 
        }
    },
}) 
const initMenu = (myConfig:windowConfigType)=>{
    solidConfig.workermsg  =Object.assign(myConfig,menuConfig)
}
onMount(()=>{
    initSolidPage(solidConfig)
    //window.localStorage.getItem("")
    initMenu(myConfig)
    loadLocalDBList(solidConfig).then(()=>{
        changeSolidConfig(solidConfig,showMenu) 
    }) 
    window.addEventListener("storage",(e)=>{
        console.log("storage",e) 
        if (e.newValue 
            && e.key.startsWith(currentLocalDBConfig.getPathX()) 
            && !e.key.endsWith(currentLocalDBConfig.name)
        ){
            handleCurrentMsg({name:e.key.split("*")[1] ,db:e.newValue})
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
 
 
 

 
