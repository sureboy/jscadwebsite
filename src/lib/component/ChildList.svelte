<script lang="ts">
       import { Drawer,  CloseButton,Modal,Textarea,AccordionItem, Accordion } from 'flowbite-svelte';
       import ChildList from "$lib/component/ChildList.svelte"
       export let inputList:Map<string, any> ;
       export let obj:object;
       export let activateClickOutside:boolean
       export let parent:string
        let  formModal:boolean;
        let helpCode:string;
        let helpTitle:string;
        $: activateClickOutside = !formModal
       //let obj1:any
</script>
<Accordion>
{#each Object.entries(obj) as [key,value]}
{#if typeof(value) == "object" && !Array.isArray(value) }
<AccordionItem   paddingDefault=" p-1" defaultClass="flex items-center justify-between w-full font-medium text-left group-first:rounded-t-xl border-gray-200 dark:border-gray-700" borderClass="" >
       <span  slot="header">{key}</span>
       <ChildList parent={`${parent}.${key}`} bind:activateClickOutside={activateClickOutside} {inputList} obj={value}  ></ChildList>  
 
</AccordionItem>
{:else}
<span class="relative" >
  <button class="p-1 flex items-center justify-between w-full font-medium text-left group-first:rounded-t-xl border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:dark:bg-gray-800"
   on:click={(e) =>{
    formModal=true;
    helpTitle=`${parent}.${key}`
    //console.log(`${parent}.${key}`)
     helpCode=inputList.get(helpTitle)
    
    }}    >
    {key}
 
</button>
</span>
{/if}
      
{/each}
</Accordion>
<Modal size="xl" title="{helpTitle}" bind:open={formModal}   autoclose={false} class="w-full pointer-events-auto">
	<Textarea readonly rows={15} bind:value={helpCode}  spellcheck=false ></Textarea>
  </Modal>