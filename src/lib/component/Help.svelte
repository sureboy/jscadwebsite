<script lang="ts">
    //import { t } from '$lib/translations/index';
    import { Drawer,  CloseButton,Modal,Textarea,AccordionItem, Accordion } from 'flowbite-svelte';
    import { InfoCircleSolid,  } from 'flowbite-svelte-icons';
    import { sineIn } from 'svelte/easing';
    import { StoreHelpHidden,solidB} from "$lib/function/storage"
    import ChildList from "$lib/component/ChildList.svelte"
    //import {solidBase} from '$lib/function/solidClass'
    //const solidTemplate = new solidBase()
    export let inputList:Map<string, any> ;
    let activateClickOutside = true;
    let backdrop = true;
   // let helpTitle:string
    //let formModal:boolean = false
   // let helpCode:string
    
    let transitionParamsRight = {
      x: 320,
      duration: 200,
      easing: sineIn
    };
   // $: activateClickOutside = !formModal
  </script>
  
 
  
  <Drawer {activateClickOutside} {backdrop} placement="right" width="w-120" transitionType="fly" transitionParams={transitionParamsRight} bind:hidden={$StoreHelpHidden} id="sidebar6">
    <div class="flex items-center">
      <h5 id="drawer-label" class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
        <InfoCircleSolid class="w-5 h-5 me-2.5" /> 
      </h5>
      <CloseButton on:click={() => ($StoreHelpHidden = true)} class="mb-4 dark:text-white" />
    </div> 
 
    <ChildList parent={"this"} bind:activateClickOutside={activateClickOutside} obj={solidB} {inputList}  />
 
    
  
  </Drawer>
 