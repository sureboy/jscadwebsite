<script lang="ts">
  //import { t } from '$lib/translations/index';
  //import {mimeType} from "@jscad/stl-serializer"   
  import { enhance } from '$app/forms';
  import {  QrCodeOutline,EnvelopeSolid, TrashBinOutline,  DownloadOutline ,PlusOutline,ChevronDownOutline , BookOpenOutline, FileCodeOutline ,EditOutline,GridPlusOutline,CloseOutline,CloudArrowUpOutline} from 'flowbite-svelte-icons';
  import {  Navbar,  NavLi, NavUl,  NavHamburger,Alert  ,Dropdown, DropdownItem,NavBrand,Spinner,DropdownDivider,Button, Modal,  Checkbox } from 'flowbite-svelte';    
  //import {solidNow} from "$lib/function/share" 
  import {getStoragelist,removeStorage,StoreHelpHidden,StoreInputCode,StoreAlertMsg,StoreCode3Dview,ClassToString,splitTag} from "$lib/function/storage" 
  import { add } from '@jscad/modeling/src/maths/mat4';
  let formModal = false;
  let userEmail = ""
  let QrCodeMap:Map<string,string> 
 

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
      <DropdownItem class="flex items-center  gap-2"  on:click={()=>{  
        StoreCode3Dview.set({code:$StoreInputCode,stl:true,name:$StoreAlertMsg.name})
      }     
    }>STL</DropdownItem>
  
    <DropdownItem on:click={()=>{
      QrCodeMap = ClassToString($StoreInputCode,$StoreAlertMsg.name)
      console.log(QrCodeMap)
      formModal = true
      //fl.forEach
    }}>
    CODE
    </DropdownItem>
    </Dropdown>
    {/if}       
    <NavLi class="flex  items-center  gap-2" href="#"  color="dark" > <GridPlusOutline class="w-6 h-6 ms-2 " />  <ChevronDownOutline class="w-6 h-6 ms-2 " /></NavLi>
    <Dropdown    >
      <DropdownItem class="flex items-center  gap-2" href="#new"  ><PlusOutline class="w-4 h-4 me-2" /> </DropdownItem>     
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
  <form class="flex flex-col space-y-6" method="POST" action="https://stl.miguotuijian.cn/" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
    console.log(action.search)
   

    if (action.search){
      cancel()
      let c = ""
      formData.forEach((v,k)=>{
        //console.log(k)
        c+=k
        c+=splitTag
        //formData.delete(k)
      })    
      const file = new File([c], $StoreAlertMsg.name+".web3dcad", {
        type: 'text/plain',
      }); 
      let aTag = document.createElement('a'); 
      aTag.download = file.name;
      let href = URL.createObjectURL(file); 
      formElement.action = href
      aTag.href = href;
      aTag.click();
      URL.revokeObjectURL(href); 
      
      return 
    }
    //fetch()
    //const f = new FormData()
    //f.set("k",)
    //formData.set("v",c)
    //formData.add()
      /*
    if (!formData.get("email")){
      cancel()
      return 
    }
    if (action.search==="" && !formData.get("code")){
      cancel()
      return 
    } 
      */
		return async ({ result, update }) => {
      console.log(result)
      //update({invalidateAll:true})
			// `result` is an `ActionResult` object
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
		};
	}} >
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white"><DownloadOutline/></h3>
    <input type="hidden" name = "k" value="{$StoreAlertMsg.name}" />
    {#each [...QrCodeMap] as [k,v] }
    <Checkbox name="{k}" color="primary" disabled="{false}" checked  value={v}>{k}</Checkbox>
    {/each}
    <div class="text-center">
    <Button type="submit" formaction="/#file" color="alternative" ><FileCodeOutline/></Button> 
    <Button type="submit"   color="alternative" ><QrCodeOutline/></Button> 
    </div>
  </form>
</Modal>

 