<script lang="ts">
    //import modeling from '@jscad/modeling';
    import type {sConfig} from "../function/utils"
    import {currentLocalDBConfig,cleanSolidConfig} from "./localdb"
    import LoadGzFile   from "./LoadGzFile.svelte";
    import {getFileList} from "./localFile"
    //import { onMount } from 'svelte';
    //import {CodeWorker} from "./function/worker"
    const { solidConfig }: { solidConfig:sConfig } = $props();  
    
</script>
{#if solidConfig.showMenu>1}
<details    >
    <summary  style="cursor: pointer;height:48px;text-align: left;line-height: 48px;"  >
        {currentLocalDBConfig.path}
    </summary>
    <div  style="color:white;text-align: center;" id="module_list"> 
        {#each getFileList()  as [k,name] } 
        <a class="btn"  href="/edit#{k}"     >  {name}</a>   
        {/each}
        <button onclick={(e)=>{
            console.log(e)
            if (!window.confirm(`The current data will be clean!!`)){
                return;
            } 
            cleanSolidConfig()
        }}>✖</button>
         
    </div> 
    <div  style="color:white;text-align: center;" id="module_list"> 
        <LoadGzFile  {solidConfig}></LoadGzFile>
    </div> 
</details>

{:else}
<LoadGzFile   {solidConfig}></LoadGzFile>
{/if}
<style> 
.btn {
    cursor: pointer;
    padding-left: 10px;
    padding-right: 10px;
    color: white;
    display: inline-block;
}
.btn:active {
    color:gray;
    transform: translateY(-1px);
    transition: all 0.1s;
} 
.btn:hover {
    color:whitesmoke; 
}
</style>