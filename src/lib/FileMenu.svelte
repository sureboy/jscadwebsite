<script lang="ts">
    //import modeling from '@jscad/modeling';
    import type {windowConfigType,sConfig} from "./function/utils"
    import {currentLocalDBConfig,cleanSolidConfig} from "./function/localdb"
    import LoadGzFile   from "./LoadGzFile.svelte";
    import {currentMap}  from "./function/ImportParser"
    //import { onMount } from 'svelte';
    //import {CodeWorker} from "./function/worker"
    const { myConfig,solidConfig }: { myConfig: windowConfigType,solidConfig:sConfig } = $props(); 
 
</script>
{#if solidConfig.showMenu!==0}
<details    >
    <summary  style="cursor: pointer;height:48px;text-align: left;line-height: 48px;"  >
        {currentLocalDBConfig.path}
    </summary>
    <div  style="color:white;text-align: center;" id="module_list"> 
        {#each currentMap as [f] }
        <a class="btn"  href="/edit#{currentLocalDBConfig.getPathX()+f}" target="_blank"   >  {f}</a>  
        {/each}
        <a class="btn"  href="/edit#{currentLocalDBConfig.configName()}" target="_blank"   >  {currentLocalDBConfig.name}</a>
        <button onclick={(e)=>{
            console.log(e)
            if (!window.confirm(`The current data will be clean!!`)){
                return;
            } 
            cleanSolidConfig()
        }}>✖</button>
         
    </div> 
    <div  style="color:white;text-align: center;" id="module_list"> 
        <LoadGzFile {myConfig} {solidConfig}></LoadGzFile>
    </div> 
</details>

{:else}
<LoadGzFile {myConfig} {solidConfig}></LoadGzFile>
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