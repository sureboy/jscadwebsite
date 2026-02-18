<script lang="ts" module >
import type { sConfig,windowConfigType,menuConfigType } from './function/utils';
import Options from "./OptionsMenu.svelte"
import DownMenu from "./DownMenu.svelte";
import MainMenu,{moduleInit} from "./MainMenu.svelte"; 
import Camera,{toggleCamera,initView} from "./Camera.svelte"; 
import {onWindowResize,switchView } from "./function/threeScene" 
import { changeWorker,runWorker } from "./function/worker";  
import {cleanCurrentMsg} from "./function/ImportParser";
import {MenuType} from "./function/utils";
//import { onMount } from 'svelte';
// $state(undefined)
export const menuConfig = { 
        cameraType:"Perspective", 
        module:(
            m:{ list: string[];
            basename: string;}
        )=>{ 
            moduleInit(m)
        }
    } as menuConfigType
    /*
export const initMenu = ( myConfig:windowConfigType)=>{
    //solidConfig= solidConfig_
    solidConfig.workermsg  =Object.assign(myConfig, { 
        cameraType:"Perspective", 
        module:(
            m:{ list: string[];
            basename: string;}
        )=>{ 
            moduleInit(m)
        }
    } as menuConfigType) 
}

*/
 
</script>
<script lang="ts">
const {children,solidConfig }:{children:any,solidConfig:sConfig}  = $props(); 
//const {solidConfig}:{solidConfig:sConfig} = $props() 
//solidConfig.workermsg = Object.assign()
const handleView = new Map<string,()=>void>()
handleView.set("camera",()=>{
    solidConfig.workermsg.cameraType = toggleCamera()
    onWindowResize(solidConfig.el!,solidConfig.workermsg.cameraType)
}) 
handleView.set("refresh",()=>{ 
    cleanCurrentMsg()
    runWorker(solidConfig)
}) 
handleView.set("show",()=>{ 
    onWindowResize(solidConfig.el!,solidConfig.workermsg.cameraType)
}) 
</script>
{#if solidConfig}
<div style="position: absolute;left:5px;top:5px;z-index: 11;cursor: pointer;" class="pointer-events-auto" id="camera-toggle">
    {#if children}
    {@render children()}
    {/if}
     
    {#if  (solidConfig.showMenu & MenuType.MainMenu )} 
    <MainMenu   Clickhandle = {(n:string)=>{            
        solidConfig.workermsg.func = n    
        initView()
        //clean old options
        solidConfig.workermsg.options=undefined;
        changeWorker(solidConfig )
        }} ></MainMenu>
    {/if}    
    {#if  (solidConfig.showMenu & MenuType.Camera )}  
    <Camera    Clickhandle={(n)=>{
        console.log(n)
        if (handleView.has(n)){
            handleView.get(n)();
        } else{
            switchView(n)  
        }           
    }} ></Camera>
    {/if}   
    {#if  ((solidConfig.showMenu >>2 )!==0 )}   
    <DownMenu {solidConfig} ></DownMenu>  
    {/if} 
    {#if (solidConfig.workermsg?.options)} 
    <Options name="Options" options={solidConfig.workermsg.options} >
    <div style="padding-left:20px;" ><input type="submit" onclick={(e)=>{
        initView()
        changeWorker(solidConfig )
    }}/></div>    
    </Options>
    
    {/if}
</div>
{/if}