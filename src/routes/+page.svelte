<script lang="ts"> 
 
	import { onMount } from "svelte";    
  import {show3d,saveSolid,showSolid,solidListKey,removeSolid,solidNow,getSolidParent} from "$lib/show3d";
  import {  CodeOutline,TrashBinSolid, CloseOutline, DownloadSolid ,FileCodeSolid ,PlaySolid } from 'flowbite-svelte-icons';
  import { Fileupload, Navbar, NavBrand, NavLi, NavUl, NavHamburger,Alert ,Badge,Listgroup,Kbd } from 'flowbite-svelte';  
  import {serialize,mimeType} from "@jscad/stl-serializer" 
  type Tcolor ="dark" | "form" | "none" | "gray" | "red" | "yellow" | "green" | "indigo" | "purple" | "pink" | "blue" | "light" | "default" | "dropdown" | "navbar" | "navbarUl" | "primary" | "orange" | undefined

  let files:FileList|undefined ;
  let solidList:string=""  
  let TextareaVal:string  
  let modalTitle = ""
  let jscad:HTMLElement;   
  let AlertMsg:{color:Tcolor,msg:string,err:any}={color:"dark",msg:"3D Create",err:""}
  let links:any[] = []

  $:if(files ){    
    let stlUrl = window.URL.createObjectURL(files[0])
    console.log(stlUrl) 
    fetch(stlUrl).then(res=>{ 
      files=undefined
      res.text().then(val=>{
        saveSolid(val)
        //showSolid() 
        //solidList =  window.localStorage.getItem(solidListKey)!
        init()
      }) 
    }) 
  }
  function init(){
    //solidList =  window.localStorage.getItem(solidListKey)!
    //showSolid(solidList) 
    links = []
    window.localStorage.getItem(solidListKey)!.split(",").forEach(v=>{
      links.push(v)
    })
    
  }
  
  onMount(() => {		 
    
    show3d(jscad,[])
    init()
    console.log(solidNow.solid.length,"soldlength")
  });
  
</script>
<div class="z-10 absolute top-0 left-0  w-full" >
<Navbar color="none" >
  <NavBrand href="#" on:click={()=>{ TextareaVal="const option = {\n}";modalTitle=""}}>
    <Alert  color="{AlertMsg.color}" >
      <Badge   rounded color="dark">{AlertMsg.msg}</Badge> 
      {AlertMsg.err?AlertMsg.err:modalTitle}
        
    </Alert>

  </NavBrand>
  <NavHamburger  />
  <NavUl > 
    {#if modalTitle}
    <NavLi  href="#" on:click={()=>{
      if(confirm("Remove "+modalTitle)){
      removeSolid(modalTitle);TextareaVal ="";init(); modalTitle=""
    }}}><TrashBinSolid/>Remove {modalTitle}</NavLi>
 
    <NavLi href="#" on:click={()=>{ 
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
    }><DownloadSolid/>STL</NavLi>
    {/if}
  
    <NavLi href="#" on:click={()=>{ TextareaVal="const solid1=class{\nstatic main(){\n return [cube({size:20,center:[0,0,200]})]\n};\n}";modalTitle=""}}><CodeOutline/>Edit</NavLi>

    {#if TextareaVal}
    <NavLi href="#" on:click={()=>{ saveSolid(TextareaVal);TextareaVal ="";}} ><CloseOutline/>Close</NavLi>  
    {/if}

  
  </NavUl>
  <div class="flex md:order-2">
    <Fileupload tabindex="1" id="multiple_files" multiple bind:files />
  </div> 

</Navbar>

{#if TextareaVal }

<div class="flex flex-row">
  <div class="basis-1/4 max-h-80 overflow-auto " >
   
<Listgroup   active items={links} let:item class="basis-1/4" on:click={(e) =>{
  TextareaVal =window.localStorage.getItem(e.detail)||"";
  modalTitle=e.detail;
  showSolid(getSolidParent(TextareaVal));
  
  }}>
  {item}
</Listgroup>
</div>
<textarea tabindex="0" rows="10" bind:value={TextareaVal} class="basis-2/4  opacity-80 " on:blur={()=>{
  console.log(solidNow.solid.length,"soldlength")
   if (solidNow.solid.length>0)return;
   showSolid(getSolidParent(TextareaVal));
}} on:change={()=>{
  //console.log("change")
  
  let val = getSolidParent(TextareaVal)
  console.log(val)
  if (val){
    try{
      showSolid(val);
      saveSolid(TextareaVal); 
      AlertMsg.color = "dark" 
      AlertMsg.err=""
    }catch(e){
      
      console.log(e)
      AlertMsg.color = "red"  
      AlertMsg.err = e
    }
  }
}}  ></textarea>
</div>
{/if}
</div>

 

<div id="jscad" bind:this={jscad} class=" h-full w-full z-0 absolute top-0 left-0" ></div>
  

<style lang="postcss">
 
  #jscad{ 
        margin: 0;
        outline: 1px solid black;
      }
 

</style>