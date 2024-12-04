<script lang="ts">
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';
  import {  PlayOutline, QrCodeOutline, TrashBinOutline,  DownloadOutline ,PlusOutline,ChevronDownOutline , BookOpenOutline, FileCodeOutline ,EditOutline,GridPlusOutline,CloudArrowUpOutline} from 'flowbite-svelte-icons';
  import {  Navbar,Alert  ,Dropdown, DropdownItem,Spinner,DropdownDivider,Button, Modal,  Checkbox ,ButtonGroup} from 'flowbite-svelte';   
  import {getStoragelist,removeStorage,StoreHelpHidden,StoreInputCode,StoreAlertMsg,StoreCode3Dview,ClassToString} from "$lib/function/storage"   
  let formModal = false; 
  //let waitting = false
  let QrCodeMap:Map<string,string> 
  
  //export let elCanvas:HTMLCanvasElement|null
  export let getValue:(name?:string)=>string 
 
  const dispatch = createEventDispatcher();

  function screenHandle() {
    dispatch('message', {
      name: $StoreAlertMsg.name
    });
  }
</script>
 
<Navbar color="none" fluid class="pointer-events-auto" >  
    <ButtonGroup  size="sm"  >
      <Button     color="light" id="start" > <GridPlusOutline  />  <ChevronDownOutline   /></Button>
      <Dropdown    >    
        <DropdownItem class="flex items-center  gap-2" href="#new"  ><PlusOutline class="w-4 h-4 me-2" /> </DropdownItem>            
        {#each getStoragelist() as item}
        <DropdownItem class="flex items-center gap-2"    href="#{item}" on:click={(e)=>{
          //console.log(e.target?.blur())
          document.getElementById("start")?.click()
        }}><FileCodeOutline class="w-4 h-4 me-2 " />{item} 
          <Button  on:click={(e)=>{
            e.stopPropagation()
            if(confirm("Remove "+item)){
              removeStorage(item); 
              document.getElementById("start")?.click()
              //location.reload()
          }}}><TrashBinOutline  class="w-4 h-4 me-2 " /> </Button>
        </DropdownItem> 
        {/each} 
        <DropdownDivider  />    
        <DropdownItem  class="flex items-center gap-2"  on:click={(e)=>{
          StoreHelpHidden.set(false)
        }}>
          <BookOpenOutline class="w-4 h-4 me-2 " />
        </DropdownItem>
      </Dropdown>
    {#if $StoreAlertMsg.name}   
    {#if $StoreInputCode} 
      <Button    href="#{$StoreAlertMsg.name}"  color="light" on:click={()=>{
        //dispatch('viewCode');$page.url
        if ($StoreAlertMsg.name !== $page.url.hash.substring(1)) return
        //console.log(e,$page.url.hash)
        StoreCode3Dview.set({code:getValue(),show:true,name:$StoreAlertMsg.name})   
        StoreInputCode.set("");   
      }}><PlayOutline   /><p class="truncate max-w-20">{$StoreAlertMsg.name}</p></Button>
     
    {:else}
      <Button   href="#{$StoreAlertMsg.name}" color="light"   on:click={()=>{

        StoreInputCode.set(window.localStorage.getItem($StoreAlertMsg.name)||"");
      }}><EditOutline   />  <p class="truncate max-w-20">{$StoreAlertMsg.name}</p></Button>
    {/if}
 
<Button color="light"  ><DownloadOutline  />  <ChevronDownOutline  /></Button>
  <Dropdown     >
      <DropdownItem class="flex items-center  gap-2"  on:click={()=>{  
         
        //$StoreAlertMsg.waitting = true
        StoreCode3Dview.set({code:"",stl:true,name:$StoreAlertMsg.name})
      }     
    }>STL</DropdownItem>
    <DropdownItem class="flex items-center gap-2" on:click={()=>{
      const file = new File([getValue($StoreAlertMsg.name)], $StoreAlertMsg.name+".webcad", {
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
    <DropdownItem class="flex items-center gap-2" on:click={()=>{
      screenHandle()
    }}>
    PNG
    </DropdownItem>
    <DropdownItem class="flex items-center gap-2"   on:click={()=>{
      formModal = true
      QrCodeMap = ClassToString(getValue($StoreAlertMsg.name),$StoreAlertMsg.name) 
    }}>
    <QrCodeOutline class="w-4 h-4 me-2" />Url </DropdownItem>

  </Dropdown>
 
   {/if}    
    </ButtonGroup>
  
  {#if  $StoreAlertMsg.waitting} <Spinner color="gray" />{/if}
  {#if  $StoreAlertMsg.errMsg}<Alert color="red">{$StoreAlertMsg.errMsg}</Alert>{/if}
</Navbar>
<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full pointer-events-auto" >
   
  <form class="flex flex-col space-y-6" enctype="multipart/form-data"   method="POST" action="https://db.solidjscad.com/?url={$page.url.origin}&keyName={$StoreAlertMsg.name}"  >
    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white"><CloudArrowUpOutline/></h3> 
    {#each [...QrCodeMap] as [k,v] }
    <Checkbox name="{k}" color="primary" readonly="{k==$StoreAlertMsg.name}"  checked  value={v}>{k}</Checkbox>
    {/each}
    <div class="text-center"> 
    <Button type="submit"   color="alternative"  ><QrCodeOutline/></Button> 
    </div>
  </form>
 
</Modal>

 