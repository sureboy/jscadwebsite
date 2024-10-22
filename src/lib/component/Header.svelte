<script lang="ts">
  //import { t } from '$lib/translations/index';
  import {serialize,mimeType} from "@jscad/stl-serializer"   
  import {  TrashBinOutline,  DownloadOutline ,PlusOutline,ChevronDownOutline , BookOpenOutline, FileCodeOutline ,EditOutline,GridPlusOutline,CloseOutline} from 'flowbite-svelte-icons';
  import {  Navbar,  NavLi, NavUl,  NavHamburger,Alert  ,Dropdown, DropdownItem,NavBrand,Banner,Spinner} from 'flowbite-svelte';    
  import {solidNow} from "$lib/function/share" 
  import {getStoragelist,removeStorage,StoreHelpHidden,StoreInputCode,StoreAlertMsg,StoreCode3Dview} from "$lib/function/storage"

  let modalTitle:string; 
 
 
</script>

 
<Navbar color="none"  class="pointer-events-auto" > 
    <NavBrand>
      {#if  $StoreAlertMsg.waitting} <Spinner color="gray" />{:else}3D Create{/if} 
      {#if  $StoreAlertMsg.errMsg}<Alert color="red">{$StoreAlertMsg.errMsg}</Alert>{:else if modalTitle } <Alert color="gray">{modalTitle}</Alert> {/if}
    </NavBrand>
  <NavHamburger />
      <NavUl    > 
    
      {#if modalTitle}
      {#if $StoreInputCode}
      <NavLi class="flex  items-center  gap-2" color="light" href="#{modalTitle}" on:click={()=>{
        StoreCode3Dview.set($StoreInputCode)
        StoreInputCode.set("");
      }}><CloseOutline class="w-6 h-6 ms-2 " />  </NavLi>
      {:else}
      <NavLi class="flex  items-center  gap-2" color="light" href="#{modalTitle}" on:click={()=>{
        StoreInputCode.set(window.localStorage.getItem(modalTitle)||"");
      }}><EditOutline class="w-6 h-6 ms-2 " />  </NavLi>
      {/if}

      <NavLi class="flex  items-center  gap-2"  href="#" on:click={()=>{
        if(confirm("Remove "+modalTitle)){
          removeStorage(modalTitle);StoreInputCode.set(""); 
          modalTitle=""
      }}}><TrashBinOutline class="w-6 h-6 ms-2 " /> </NavLi>
    
      <NavLi class="flex  items-center  gap-2" href="#" on:click={()=>{ 
        const file = new File(serialize({ binary: true }, 
          ...solidNow.solid), modalTitle+".stl", {
          type: mimeType,
        });
        console.log(file)
        let aTag = document.createElement('a'); 
        aTag.download = file.name;
        let href = URL.createObjectURL(file); 
        aTag.href = href;
        aTag.click();
        URL.revokeObjectURL(href); 
        }     
      }><DownloadOutline class="w-6 h-6 ms-2 " /> </NavLi>
      {/if} 
      
      <NavLi class="flex  items-center  gap-2" href="#"  color="dark" > <GridPlusOutline class="w-6 h-6 ms-2 " />  <ChevronDownOutline class="w-6 h-6 ms-2 " /></NavLi>
      <Dropdown    >
        <DropdownItem class="flex items-center  gap-2" href="#" on:click={()=>{ 
          modalTitle="solid1"
          //StoreInputCode.set(window.localStorage.getItem(modalTitle)||"const solid1=class{\n\/\/Input Ctrl+S perview this solid\n main(){\n return [this.cube({size:20,center:[0,0,200]})]\n};\n}")
          //inputCode=
          StoreInputCode.set("const solid1=class{\n\/\/Input Ctrl+S perview this solid\n main(){\n return [this.cube({size:200,center:[0,0,0]})]\n};\n}")
          }}><PlusOutline class="w-4 h-4 me-2" /> </DropdownItem>
     
           {#each getStoragelist() as item}
           <DropdownItem class="flex items-center gap-2"  href="#{item}" on:click={(e) =>{ 
             StoreInputCode.set(window.localStorage.getItem(item)||"");
             modalTitle=item; 
             }} > <FileCodeOutline class="w-4 h-4 me-2 " /> {item}</DropdownItem> 
           {/each} 
      
      </Dropdown>
      <NavLi class="flex  items-center  gap-2" href="#"   color="dark" on:click={()=>{
        StoreHelpHidden.set(false)
      }} ><BookOpenOutline class="w-6 h-6 ms-2 " /> </NavLi>
    </NavUl>
   
  </Navbar>

   