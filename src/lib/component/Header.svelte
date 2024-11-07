<script lang="ts">
  import { page } from '$app/stores';
  //import { t } from '$lib/translations/index';
  //import {mimeType} from "@jscad/stl-serializer"   
  //import { enhance } from '$app/forms';
  import {  QrCodeOutline, TrashBinOutline,  DownloadOutline ,PlusOutline,ChevronDownOutline , BookOpenOutline, FileCodeOutline ,EditOutline,GridPlusOutline,CloseOutline,CloudArrowUpOutline} from 'flowbite-svelte-icons';
  import {  Navbar,  NavLi, NavUl,  NavHamburger,Alert  ,Dropdown, DropdownItem,NavBrand,Spinner,DropdownDivider,Button, Modal,  Checkbox } from 'flowbite-svelte';    
  //import {solidNow} from "$lib/function/share" 
  import {getStoragelist,removeStorage,StoreHelpHidden,StoreInputCode,StoreAlertMsg,StoreCode3Dview,ClassToString,splitTag} from "$lib/function/storage" 
  //import { add } from '@jscad/modeling/src/maths/mat4';
  let formModal = false;
  //let userEmail = ""
  let QrCodeMap:Map<string,string> 
  //console.log($page.url)

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
    <Dropdown     >
      <DropdownItem class="flex items-center  gap-2"  on:click={()=>{  
        StoreCode3Dview.set({code:$StoreInputCode,stl:true,name:$StoreAlertMsg.name})
      }     
    }>STL</DropdownItem>
    <DropdownItem class="flex items-center gap-2" on:click={()=>{
      const file = new File([$StoreInputCode], $StoreAlertMsg.name+".webcad", {
        type: 'text/plain',
      }); 
      let aTag = document.createElement('a'); 
      aTag.download = file.name;
      let href = URL.createObjectURL(file); 
      aTag.href = href;
      aTag.click();
      URL.revokeObjectURL(href); 
    }}>
    CODE
    </DropdownItem>
    <DropdownItem class="flex items-center gap-2"   on:click={()=>{
      formModal = true
      QrCodeMap = ClassToString($StoreInputCode,$StoreAlertMsg.name) 
    }}>
    <QrCodeOutline class="w-4 h-4 me-2" />Url
    </DropdownItem>
    </Dropdown>
    {/if}       
    <NavLi class="flex  items-center  gap-2" href="#"  color="dark" > <GridPlusOutline class="w-6 h-6 ms-2 " />  <ChevronDownOutline class="w-6 h-6 ms-2 " /></NavLi>
    <Dropdown    >
      <DropdownItem class="flex items-center  gap-2" href="#solid1"  ><PlusOutline class="w-4 h-4 me-2" /> </DropdownItem>     
      {#each getStoragelist() as item}
      <DropdownItem class="flex items-center gap-2"  href="#{item}"  > <FileCodeOutline class="w-4 h-4 me-2 " /> {item}</DropdownItem> 
      {/each} 
      <DropdownDivider  />    
 
    </Dropdown>
    <NavLi class="flex  items-center  gap-2" href="#"   color="dark" on:click={()=>{
      StoreHelpHidden.set(false)
    }} ><BookOpenOutline class="w-6 h-6 ms-2 " /> </NavLi>
  </NavUl>   
</Navbar>
<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full pointer-events-auto" >
  <form class="flex flex-col space-y-6" enctype="multipart/form-data" method="POST" action="https://stl.miguotuijian.cn/?url={$page.url.origin}&keyName={$StoreAlertMsg.name}"  >
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white"><CloudArrowUpOutline/></h3> 
    {#each [...QrCodeMap] as [k,v] }
    <Checkbox name="{k}" color="primary"   checked  value={v}>{k}</Checkbox>
    {/each}
    <div class="text-center"> 
    <Button type="submit"   color="alternative" ><QrCodeOutline/></Button> 
    </div>
  </form>
</Modal>

 