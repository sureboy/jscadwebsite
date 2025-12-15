<script lang="ts">
    import type {windowConfigType,sConfig} from "./function/utils"
    import LoadGzFile ,{myConfigFileName}  from "./LoadGzFile.svelte";
    import {currentMap}  from "./function/ImportParser"
    //import { onMount } from 'svelte';
    const { myConfig,solidConfig }: { myConfig: windowConfigType,solidConfig:sConfig } = $props(); 
    
</script>
{#if solidConfig.showMenu!==0}
<details    >
    <summary  style="cursor: pointer;height:48px;text-align: left;line-height: 48px;"  >
        {myConfig.in}
    </summary>
    <div  style="color:white;text-align: center;" id="module_list"> 
        {#each currentMap as [f] }
        <a class="btn"  href="/edit#{f}" target="_blank"   >  {f}</a>  
        {/each}
        <a class="btn"  href="/edit#{myConfigFileName}" target="_blank"   >  {myConfigFileName}</a>
    </div> 
    <div  style="color:white;text-align: center;" id="module_list"> 
     <button onclick={()=>{
    if (window.prompt(`Input '${myConfig.name}' clear all data?`)===myConfig.name){
        window.localStorage.clear()
        window.location.reload();
    }}}>↻</button>   <LoadGzFile {myConfig} {solidConfig}></LoadGzFile>
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