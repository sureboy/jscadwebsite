<script lang="ts">
  //import { t } from '$lib/translations/index';
  //import {mimeType} from "@jscad/stl-serializer"   
  import {  TrashBinOutline,  DownloadOutline ,PlusOutline,ChevronDownOutline , BookOpenOutline, FileCodeOutline ,EditOutline,GridPlusOutline,CloseOutline} from 'flowbite-svelte-icons';
  import {  Navbar,  NavLi, NavUl,  NavHamburger,Alert  ,Dropdown, DropdownItem,NavBrand,Spinner,DropdownDivider} from 'flowbite-svelte';    
  //import {solidNow} from "$lib/function/share" 
  import {getStoragelist,removeStorage,StoreHelpHidden,StoreInputCode,StoreAlertMsg,StoreCode3Dview} from "$lib/function/storage" 

</script>
 
<Navbar color="none"  class="pointer-events-auto" > 
  <NavBrand>
    {#if  $StoreAlertMsg.waitting} <Spinner color="gray" />{:else}3D Create{/if} 
    {#if  $StoreAlertMsg.errMsg}<Alert color="red">{$StoreAlertMsg.errMsg}</Alert>{:else if $StoreAlertMsg.name } <Alert color="gray">{$StoreAlertMsg.name}</Alert> {/if}
  <slot></slot>
  </NavBrand>
  <NavHamburger />
    <NavUl>     
    {#if $StoreAlertMsg.name}
    {#if $StoreInputCode}
    <NavLi class="flex  items-center  gap-2" color="light" href="#{$StoreAlertMsg.name}" on:click={()=>{
      StoreCode3Dview.set({code:$StoreInputCode,show:true})
      StoreInputCode.set("");
    }}><CloseOutline class="w-6 h-6 ms-2 " />  </NavLi>
    {:else}
    <NavLi class="flex  items-center  gap-2" color="light" href="#{$StoreAlertMsg.name}" on:click={()=>{
      StoreInputCode.set(window.localStorage.getItem($StoreAlertMsg.name)||"");
    }}><EditOutline class="w-6 h-6 ms-2 " />  </NavLi>
    {/if}
    <NavLi class="flex  items-center  gap-2"  href="#" on:click={()=>{
      if(confirm("Remove "+$StoreAlertMsg.name)){
        removeStorage($StoreAlertMsg.name);StoreInputCode.set(""); 
        $StoreAlertMsg.name=""
    }}}><TrashBinOutline class="w-6 h-6 ms-2 " /> </NavLi>
  
    <NavLi class="flex  items-center  gap-2" href="#"  ><DownloadOutline class="w-6 h-6 ms-2 " />  <ChevronDownOutline class="w-6 h-6 ms-2 " /></NavLi>
    <Dropdown    >
      <DropdownItem class="flex items-center  gap-2" href="#"   on:click={()=>{  
        StoreCode3Dview.set({code:$StoreInputCode,stl:true,name:$StoreAlertMsg.name})
      }     
    }>STL</DropdownItem>
    <DropdownItem class="flex items-center  gap-2" href="#" on:click={()=>{  
      const file = new File([$StoreInputCode], $StoreAlertMsg.name+".webcad", {
        type: 'text/plain',
      }); 
      let aTag = document.createElement('a'); 
      aTag.download = file.name;
      let href = URL.createObjectURL(file); 
      aTag.href = href;
      aTag.click();
      URL.revokeObjectURL(href); 
    }} >CODE</DropdownItem>
    </Dropdown>
    {/if}       
    <NavLi class="flex  items-center  gap-2" href="#"  color="dark" > <GridPlusOutline class="w-6 h-6 ms-2 " />  <ChevronDownOutline class="w-6 h-6 ms-2 " /></NavLi>
    <Dropdown    >
      <DropdownItem class="flex items-center  gap-2" href="#new"  ><PlusOutline class="w-4 h-4 me-2" /> </DropdownItem>     
      {#each getStoragelist() as item}
      <DropdownItem class="flex items-center gap-2"  href="#{item}"  > <FileCodeOutline class="w-4 h-4 me-2 " /> {item}</DropdownItem> 
      {/each} 
      <DropdownDivider />    
    </Dropdown>
    <NavLi class="flex  items-center  gap-2" href="#"   color="dark" on:click={()=>{
      StoreHelpHidden.set(false)
    }} ><BookOpenOutline class="w-6 h-6 ms-2 " /> </NavLi>
  </NavUl>   
</Navbar>

   