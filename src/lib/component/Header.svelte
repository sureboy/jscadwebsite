<script lang="ts">
  //import { t } from '$lib/translations/index';
  //import {mimeType} from "@jscad/stl-serializer"   
  import { enhance } from '$app/forms';
  import { EnvelopeSolid, TrashBinOutline,  DownloadOutline ,PlusOutline,ChevronDownOutline , BookOpenOutline, FileCodeOutline ,EditOutline,GridPlusOutline,CloseOutline,CloudArrowUpOutline} from 'flowbite-svelte-icons';
  import {Helper, ButtonGroup, Navbar,  NavLi, NavUl,  NavHamburger,Alert  ,Dropdown, DropdownItem,NavBrand,Spinner,DropdownDivider,Button, Modal, Label, Input, Checkbox } from 'flowbite-svelte';    
  //import {solidNow} from "$lib/function/share" 
  import {getStoragelist,removeStorage,StoreHelpHidden,StoreInputCode,StoreAlertMsg,StoreCode3Dview} from "$lib/function/storage" 
  let formModal = false;
  let userEmail = ""
 

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
      <DropdownDivider class="w-4 h-4 me-2 " />    
      <DropdownItem class="flex items-center gap-2"  href="#" on:click={(e)=>{
        (formModal = true)
      }}  ><CloudArrowUpOutline/></DropdownItem> 
    </Dropdown>
    <NavLi class="flex  items-center  gap-2" href="#"   color="dark" on:click={()=>{
      StoreHelpHidden.set(false)
    }} ><BookOpenOutline class="w-6 h-6 ms-2 " /> </NavLi>
  </NavUl>   
</Navbar>
<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full pointer-events-auto" >
  <form class="flex flex-col space-y-6" method="POST" action="/login" use:enhance={({ formElement, formData, action, cancel, submitter }) => {
		// `formElement` is this `<form>` element
		// `formData` is its `FormData` object that's about to be submitted
		// `action` is the URL to which the form is posted
		// calling `cancel()` will prevent the submission
		// `submitter` is the `HTMLElement` that caused the form to be submitted
    if (!formData.get("email")){
      cancel()
      return 
    }
    if (action.search==="" && !formData.get("code")){
      cancel()
      return 
    }

    console.log(formElement)
    console.log(formData.get("email"))
    console.log(action)

		return async ({ result, update }) => {
      console.log(result)
      //update({invalidateAll:true})
			// `result` is an `ActionResult` object
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
		};
	}} >
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Sign in/up to our services</h3>
    <Input name="email" bind:value={userEmail} type="email" placeholder="yourName@company.com" size="lg">
      <EnvelopeSolid slot="left" class="w-6 h-6" />
    </Input>
    <ButtonGroup class="w-full">   
      <Input name="code" type="tel" placeholder="code" />
      <Button color="primary" type="submit"  formaction="/login?/check" >Send</Button>
    </ButtonGroup> 
 
      <!-- The following line controls and configures the Turnstile widget. -->
      <div class="cf-turnstile" data-sitekey="0x4AAAAAAAylaNvRnI0kTugj" data-theme="light" ></div>
      <!-- end. -->
 
    <Helper class="mt-2">After click [send] botton open your Email get code than input here</Helper>

    <Button type="submit" class="w-full1">Login to your account</Button> 
  </form>
</Modal>

<svelte:head>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js"  defer></script>
</svelte:head>