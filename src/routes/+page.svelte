<script lang="ts"> 
 
	import { onMount } from "svelte";    

  import {show3d,saveSolid,showSolid,solidListKey,removeSolid,
    solidNow,getSolidString,searchSolid} from "$lib/show3d";
  import {  CodeOutline,TrashBinSolid, CloseOutline, DownloadSolid   } from 'flowbite-svelte-icons';
  import { Fileupload, Navbar, NavBrand, NavLi, NavUl, 
    NavHamburger,Alert ,Badge,Listgroup,ListgroupItem,Textarea,Popover,AccordionItem, Accordion } from 'flowbite-svelte';  
  import {serialize,mimeType} from "@jscad/stl-serializer" 
  type Tcolor ="dark" | "form" | "none" | "gray" | "red" | "yellow" | "green" | "indigo" | "purple" | "pink" | "blue" | "light" | "default" | "dropdown" | "navbar" | "navbarUl" | "primary" | "orange" | undefined
 
  let files:FileList|undefined ;
  //let solidList:string=""  
  let TextareaVal:string  
  let modalTitle = ""
  let jscad:HTMLElement;   
  let textareaObj:any;
  let AlertMsg:{color:Tcolor,msg:string,err:any}={color:"dark",msg:"3D Create",err:""}
  let links:any[] = []
  let searchkey:string = ""
  let start:number;
  let startSearch:boolean =false
  let tempVal:string=""
  let regSearchKey = /this\.(\w+)$/

	/** @type {import('./$types').PageData} */
	//export let data:any;
  //console.log(data)



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
    window.localStorage.getItem(solidListKey)?.split(",").forEach(v=>{
      links.push(v)
    })
    
  }
  function Show3DSolid(code:string){
    let val = getSolidString(code)
  //console.log(val)
  if (val){
    try{
      showSolid(val);
      saveSolid(code); 
      AlertMsg.color = "dark" 
      AlertMsg.err=""
    }catch(e){
      
      console.log(e)
      AlertMsg.color = "red"  
      AlertMsg.err = e
    }
  }
  }
  function eventHand(e:any){
    console.log(e)
  }
  onMount(() => {		 
   // new UIEvent("input",)
   //BeforeInput
    //event = new InputEvent("beforeInput",{inputType:"insertText",data:"----",isComposing:true,});
    //textareaObj.addEventListener("beforeinput",eventHand)
    show3d(jscad,[])
    init()
    console.log(solidNow.solid.length,"soldlength")
    window.document.addEventListener(
      "keydown",
      (e) => {       
        if (e.ctrlKey && e.code=="Enter"){
          e.preventDefault();
          Show3DSolid(TextareaVal);
        }
      }
   ) 
  });
  
  
</script>
<div class="z-10 absolute top-0 left-0  w-full" >
<Navbar color="none" >
  <NavBrand href="#" on:click={()=>{ TextareaVal="const option = {\n}";modalTitle=""}}>
    <Alert  color="{AlertMsg.color}" >
      <Badge   rounded color="dark">{AlertMsg.msg}</Badge> 
      {AlertMsg.err}
      {#if TextareaVal}
       <small>Input Ctrl+Enter preview </small>{modalTitle}
        {/if}
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
  
    <NavLi href="#" on:click={()=>{ TextareaVal="\/\/Input Ctrl+enter perview this solid\nconst solid1=class{\n main(){\n return [this.cube({size:20,center:[0,0,200]})]\n};\n}";modalTitle=""}}><CodeOutline/>Edit</NavLi>

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
  {#if startSearch}
  <Listgroup   active >
    {#each searchSolid(searchkey) as item,index}
    <ListgroupItem   >
     <span id="t{index}" class="w-full h-full" > {item[0]}  </span>
    </ListgroupItem>     
    <Popover  triggeredBy="#t{index}">  
    <textarea  spellcheck=false  rows="10" class="w-full h-full" bind:value={item[1]} ></textarea>
    </Popover>  
    {/each}
  </Listgroup>
  {/if}
    
   
<Listgroup   active items={links} let:item class="basis-1/4" on:click={(e) =>{
  console.log(e)
  TextareaVal =window.localStorage.getItem(e.detail)||"";
  modalTitle=e.detail;
  }}>
  {item}
 
</Listgroup>
</div>
<Textarea    placeholder="input Ctrl+Enter View Solid"  on:change={()=>{
 //Show3DSolid(TextareaVal);
}}   on:input={e=>{  
  if (e.data==="."){
    textareaObj = e.target
    start = textareaObj.selectionStart
   
    if (textareaObj.value.substring(start-5,start-1)=="this"){
      startSearch=true
      return
    }
  }
  if (startSearch){
    textareaObj = e.target
    start = textareaObj.selectionStart
    let kl = regSearchKey.exec(textareaObj.value.substring(0,start))
    if (!kl){
      startSearch=false
      return
    }
    if (kl[1]){
      searchkey = kl[1]
     // searchlinks = searchSolid(kl[1])
    }
    
  }

  //poper.style.top = textareaObj.
  console.log("input", e)
  // event.value+=e.data 

}}   on:keydown={(e)=>{
  
   //textareaObj = e.target
  if(e.code==="Escape"){
    startSearch=false
  }
  
  //console.log(textareaObj.data)
  if (e.code==="Tab"){   
    //e.key=" "
    e.preventDefault();  
/*
    //textareaObj = e.target
    //textareaObj.dispatchEvent(event)
  
    if (start>0)return
  
    start = textareaObj.selectionStart    
    textareaObj.value = textareaObj.value.substring(0,start)+"    "+textareaObj.value.substring(start)
    start+=4 
    textareaObj.selectionStart = start  ;
    textareaObj.selectionEnd = start  ;
    */
  }
  //if (e.shiftKey && e.code=="Enter")Show3DSolid(TextareaVal);
}} on:keyup={(e)=>{
  /*
  if (e.code==="Tab"){    
    textareaObj = e.target
    textareaObj.selectionStart = start  ;
    textareaObj.selectionEnd = start  ;
    start = 0   
  }
    */
}} spellcheck=false   rows="10" bind:value={TextareaVal} class="basis-3/4  opacity-80 " > </Textarea>
 
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