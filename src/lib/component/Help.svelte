<script lang="ts">
    import { t } from '$lib/translations/index';
    import { Drawer, Listgroup, CloseButton,Modal,Textarea } from 'flowbite-svelte';
    import { InfoCircleSolid,  } from 'flowbite-svelte-icons';
    import { sineIn } from 'svelte/easing';
    import { StoreHelpHidden} from "$lib/function/storage"
    export let inputList:Map<string, any> ;
    let helpTitle:string
    let formModal:boolean = false
    let helpCode:string
    
    let transitionParamsRight = {
      x: 320,
      duration: 200,
      easing: sineIn
    };
  </script>
  
 
  
  <Drawer placement="right" width="w-120" transitionType="fly" transitionParams={transitionParamsRight} bind:hidden={$StoreHelpHidden} id="sidebar6">
    <div class="flex items-center">
      <h5 id="drawer-label" class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
        <InfoCircleSolid class="w-5 h-5 me-2.5" />{$t('header.help',{default:"Help"})}
      </h5>
      <CloseButton on:click={() => (StoreHelpHidden.set(true))} class="mb-4 dark:text-white" />
    </div>
    <div   class=" flex items-center overflow-auto h-[90vh] ">
    <ol> 
        {#each [...inputList] as [key,value]}
     
        <li class="relative" >
        <a  href="#top"  on:click={(e) =>{
            formModal=true;
            helpCode=value
            helpTitle=key
            }}    >
            {key}
         
        </a>
        </li>  
        {/each}
        </ol>
        <div>
  </Drawer>
  <Modal size="xl" title="{helpTitle}" bind:open={formModal}  autoclose outsideclose  class="w-full">
	<Textarea rows={15} bind:value={helpCode}  spellcheck=false ></Textarea>
  </Modal>