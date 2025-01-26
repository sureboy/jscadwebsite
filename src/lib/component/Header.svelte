<script lang="ts">
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';
  import { GridSolid,WindowsSolid, PrinterOutline,  PlayOutline,  TrashBinOutline,  DownloadOutline ,PlusOutline,ChevronDownOutline , BookOpenOutline, FileCodeOutline ,EditOutline,GridPlusOutline,CloudArrowUpOutline, FileImageOutline} from 'flowbite-svelte-icons';
  import { Input, Navbar,Alert  ,Dropdown, DropdownItem,Spinner,DropdownDivider,Button, ButtonGroup} from 'flowbite-svelte';   
  import {StoreOrthographic,getStoragelist,removeStorage,StoreHelpHidden,StoreInputCode,StoreAlertMsg,StoreCode3Dview} from "$lib/function/storage"   
 
 
  let inputRCode = ""
  //export let elCanvas:HTMLCanvasElement|null
  export let getValue:(name?:string)=>string 
 
  const dispatch = createEventDispatcher();

  function screenHandle() {
    dispatch('screen', {
      name: $StoreAlertMsg.name
    });
  }
  function loaderStlHandle(uri:string) {
    dispatch('stl', {
      uri
    });
  }
  function loaderFileHandle(data:File) {
    dispatch('file', {
      data
    });
  }
  function inputFile(){
    let x = document.createElement("INPUT") as HTMLInputElement;
    x.setAttribute("type", "file");    
    x.addEventListener('change', function() {      
      if (x.files && x.files.length) {
        const f = x.files[0]
        console.log(f,f.name)
       
        if (f.name.endsWith("stl")){
          let uri = URL.createObjectURL(f)
          loaderStlHandle(uri)    
          URL.revokeObjectURL(uri)      
        }else if (f.name.endsWith("gcode")){
          //let uri = 
          let aTag = document.createElement('a'); 
          aTag.target="_blank"
          aTag.href ='/view#'+URL.createObjectURL(f);
          aTag.click();
          //URL.revokeObjectURL(uri)
        }else if (f.name.endsWith("solidjscad")){
          loaderFileHandle(f)
        }
        
      }               
    })
    x.click()
  }
  
</script>
 
<Navbar color="none" fluid class="pointer-events-auto" >  
    <ButtonGroup  size="sm"  >
      <Button     color="light" id="start" >{#if $StoreAlertMsg.name} {#if window.innerWidth>window.innerHeight}{$StoreAlertMsg.name} {:else}<p class="truncate max-w-20">{$StoreAlertMsg.name.split("__")[0]}</p>{/if} {:else} <GridPlusOutline  /> {/if}<ChevronDownOutline   /> </Button>
      <Dropdown >    
        <DropdownItem     class="flex items-center  gap-2" >
          <Input type="text"   id="inputR"  bind:value={inputRCode}   on:keydown={(e)=>{
            if (e.code === "Enter" ){
              document.getElementById("plus")?.click()
              document.getElementById("start")?.click()
            }
          }} > </Input><Button id="plus"  size="sm"  on:click={()=>{
            if (!inputRCode){
              inputFile()
              return
            }else if (!inputRCode.startsWith("#")) inputRCode="#"+inputRCode
            let aTag = document.createElement('a'); 
            aTag.href = inputRCode;
            aTag.click();   
            document.getElementById("start")?.click()
            inputRCode=""
          }}><PlusOutline class="w-4 h-4 me-2" /></Button> 
        </DropdownItem>     
        {#each getStoragelist() as item}
        <DropdownItem   class="flex items-center gap-2" >
          <ButtonGroup  size="sm"  >
        <Button href="#{item}"  on:click={(e)=>{ 
          document.getElementById("start")?.click()
        }}><FileCodeOutline class="w-4 h-4 me-2 " />{item} </Button>
          <Button  on:click={(e)=>{
            if(confirm("Remove "+item)){
              removeStorage(item); 
              document.getElementById("start")?.click()
              //location.reload()
          }}}><TrashBinOutline  class="w-4 h-4 me-2 " /> </Button>
          </ButtonGroup>
        </DropdownItem> 
        {/each} 
        <DropdownDivider  />    
        <DropdownItem  class="flex items-center gap-2"><a class="w-full h-full" target="_blank" href="https://solidjscad.zaddone.com/" >
          <BookOpenOutline class="w-4 h-4 me-2 " /></a>
        </DropdownItem>
      </Dropdown>
    {#if $StoreAlertMsg.name}   
    {#if $StoreInputCode} 
      <Button    href="#{$StoreAlertMsg.name}"  color="light" on:click={()=>{
        //dispatch('viewCode');$page.url
        if ($StoreAlertMsg.name !== $page.url.hash.substring(1)) return
        //console.log(e,$page.url.hash)
        StoreCode3Dview.set({code:getValue(),show:true ,camera:false})   
        StoreInputCode.set("");   
      }}><PlayOutline   /> </Button>
     
    {:else}
      <Button   href="#{$StoreAlertMsg.name}" color="light"   on:click={()=>{
        StoreInputCode.set(window.localStorage.getItem($StoreAlertMsg.name)||"");
      }}><EditOutline   /> </Button>
    {/if}
 
<Button color="light"  ><DownloadOutline  />  <ChevronDownOutline  /></Button>
  <Dropdown     >
      <DropdownItem class="flex items-center  gap-2"  on:click={()=>{  
         
        //$StoreAlertMsg.waitting = true
        StoreCode3Dview.set({code:"",show:true,stl:true,name:$StoreAlertMsg.name})
      }     
    }><PrinterOutline class="w-4 h-4 me-2" />STL</DropdownItem>
    <DropdownItem class="flex items-center gap-2" on:click={()=>{
      StoreCode3Dview.set({code:getValue($StoreAlertMsg.name),show:true, file:true,name:$StoreAlertMsg.name})
      return
      const file = new File([getValue($StoreAlertMsg.name)], $StoreAlertMsg.name+".solidjscad", {
        type: 'text/plain',
      }); 
      let aTag = document.createElement('a'); 
      aTag.download = file.name;
      let href = URL.createObjectURL(file); 
      aTag.href = href;
      aTag.click();
      URL.revokeObjectURL(href); 
    }}><FileCodeOutline class="w-4 h-4 me-2" />
    CODE
    </DropdownItem>
    <DropdownItem class="flex items-center gap-2" on:click={()=>{
      screenHandle()
    }}>
    <FileImageOutline class="w-4 h-4 me-2" />
    PNG
    </DropdownItem>
 
  </Dropdown>
   
    <Button color="light" size="sm"  on:click={()=>{
       $StoreOrthographic  = !$StoreOrthographic
 
    }}>
    {#if $StoreOrthographic }
      <WindowsSolid class="w-4 h-4 me-2"/> 
      {:else}
      <GridSolid class="w-4 h-4 me-2" />
    {/if}
    {#if window.innerWidth>window.innerHeight}
    Ctrl+k
    {/if}
     
    </Button> {/if}  
  </ButtonGroup>
   
  {#if  $StoreAlertMsg.waitting} <Spinner color="gray" />{/if}
  {#if  $StoreAlertMsg.errMsg}<Alert color="red">{@html $StoreAlertMsg.errMsg}</Alert>{/if}
</Navbar>
 
 