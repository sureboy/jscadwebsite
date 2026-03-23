<script lang="ts" > 
import Options from "./OptionsMenu.svelte"
    const {options,name,children}:{options:Object,name:string,children?:any} = $props()
</script>

<details    >
    <summary  style="cursor: pointer;height:48px;text-align: left;line-height: 48px;"  >
{name}
</summary>
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div  style="color:white;text-align: left;" id="Options_list"  > 
  {#each Object.keys(options) as k }
  {@const v = options[k]}
  {@const t = typeof v}
  <div style="padding-left:10px;">
  {#if (t==="object" && !Array.isArray(v))}
    <Options options={v} name={k}></Options>
  {:else}
  <label  >
     {k} 
     {#if (t ==="string")}
     <input name={k} type="text"   bind:value={options[k]} />
     {:else if  (t ==="number")}
     <input name={k} type="number"  bind:value={options[k]} >
     {:else if  (t ==="boolean")}
     <input name={k} type="checkbox"   bind:checked={options[k]}   >
     {:else if  (Array.isArray(v) )}
     <select bind:value={options[k]} name={k} id={k}> 
      {#each v as tv,i }
        <option value={tv}>{JSON.stringify(tv)}</option>
      {/each}
      

     </select>
     {/if}
  </label> 

  {/if}
</div> 
  {/each}
 
</div> 
{@render children?.()}
 
</details>