<script lang="ts">

import type {windowConfigType,sConfig} from "$lib/function/utils"
//import  {GetUpdateFileList} from '$lib/components/CodeEditor.svelte';
import ShowSolid,{    initSolidPage}  from '$lib/ShowSolid.svelte';
import { handleCurrentMsg }  from "$lib/function/ImportParser"
//import LoadGzFile from "$lib/LoadGzFile.svelte";
import FileMenu from "$lib/FileMenu.svelte";
import Menu ,{initMenu} from '$lib/Menu.svelte'
import { runWorker } from "$lib/function/worker";
import { showMenu } from "$lib/LoadGzFile.svelte";
import { onMount } from 'svelte'; 
import {changeSolidConfig,loadSolidConfig,mySolidConfig} from "$lib/function/localdb"

//let { data }: { data: windowConfigType } = $props();
const myConfig:windowConfigType  =$state({
    name:"",
    func:"",
    in:"",
    src:"",
    pageType:"run"
})
 
const solidConfig:sConfig= $state({ showMenu:0,
    postMessage:(e:{type:string,path?:string})=>{
        console.log("listen",e)
        if (e.path){ 
            //requestAnimationFrame(()=>{
            setTimeout(()=>{
                handleCurrentMsg({name:e.path,db:window.localStorage.getItem(e.path)},solidConfig.postMessage)
            }) 
        }
    },
})
 
onMount(()=>{
    initSolidPage(solidConfig)
    //window.localStorage.getItem("")
    initMenu(solidConfig,myConfig)
    loadSolidConfig(solidConfig)
    changeSolidConfig(solidConfig,showMenu) 
    window.addEventListener("storage",(e)=>{
        console.log("storage",e)
        
        if (e.newValue && e.key.startsWith(mySolidConfig.getPathX()) && !e.key.endsWith(mySolidConfig.name)){
            //if (e.key.startsWith(mySolidConfig.getPath()))
            //const name = e.key.split("*")[1]
            handleCurrentMsg({name:e.key.split("*")[1] ,db:e.newValue})
            solidConfig.showMenu=showMenu
            runWorker(solidConfig)
        }else{
            window.location.reload()
        }

    })
   
    
     
})
 
</script>
<svelte:head><title>{myConfig.name||"solidJSCAD"}</title></svelte:head>
<ShowSolid></ShowSolid> 
 
 
<Menu    >
    <FileMenu {myConfig} {solidConfig} ></FileMenu> 
</Menu> 
 
 
 

 
