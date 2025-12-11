<script lang="ts">

import type {windowConfigType,sConfig} from "$lib/function/utils"
//import  {GetUpdateFileList} from '$lib/components/CodeEditor.svelte';
import ShowSolid,{    initSolidPage}  from '$lib/ShowSolid.svelte';
import { handleCurrentMsg }  from "$lib/function/ImportParser"
//import LoadGzFile from "$lib/LoadGzFile.svelte";
import FileMenu from "$lib/FileMenu.svelte";
import Menu ,{initMenu} from '$lib/Menu.svelte'
import { runWorker } from "$lib/function/worker";
import { loadMyConfig } from "$lib/LoadGzFile.svelte";
import { onMount } from 'svelte';

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
            setTimeout(()=>{
                handleCurrentMsg({name:e.path,db:window.localStorage.getItem(e.path)},solidConfig.postMessage)
            },1)
            
        }
    },
})
 
onMount(()=>{
    initSolidPage(solidConfig)
    window.localStorage.getItem("")
    initMenu(solidConfig,myConfig)
    loadMyConfig(solidConfig)
    window.addEventListener("storage",(e)=>{
        console.log(e)
        if (e.key.startsWith(".")){
            handleCurrentMsg({name:e.key,db:e.newValue})
            runWorker(solidConfig)
        }
        
    })
   
    
     
})
 
</script>
<svelte:head><title>{myConfig.name||"solidJSCAD"}</title></svelte:head>
<ShowSolid></ShowSolid> 
 
 
<Menu    >
    <FileMenu {myConfig} {solidConfig} ></FileMenu> 
</Menu> 
 
 
 

 
