<script lang="ts"> 
 
	import { onMount } from "svelte";    

  import {show3d,saveSolid,showSolid,solidListKey,removeSolid,
    solidNow,getSolidString} from "$lib/show3d";
    import type {SearchDataCallback} from "$lib/show3d";
  import {  CodeOutline,TrashBinSolid, CloseOutline, DownloadSolid   } from 'flowbite-svelte-icons';
  import { Fileupload, Navbar, NavBrand, NavLi, NavUl, 
    NavHamburger,Alert ,Badge,Listgroup,ListgroupItem,Textarea,Popover,AccordionItem, Accordion,Input } from 'flowbite-svelte';  
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
	export let data:any;
  //console.log(data.data)
  const searchSolid=(key:string|RegExp,len:number=10)=>{
 console.log(key)
 let li:any[] = []
 if (!key)return li
 searchHelpData( data.data,key,(k:string,v:any)=>{
    li.push([k,v])
    return li.length<len
 })
 return li
}
  function searchHelpData(solid:Map<string,any> ,k_:string|RegExp,callback:SearchDataCallback)  {
  for (const [key, value] of  solid) {
      console.log(`${k_} ${key}: ${typeof(value)}`);
      
      if (key.search(k_)<0) {
          if (typeof(value) == "object"){            
            if (!searchHelpData(value,k_,callback))return
          } 
      }else{
          if (!callback(key,value))return false
      }
      
      
  }
  return false
     
}

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
      init()
      AlertMsg.color = "dark" 
      AlertMsg.err=""
    }catch(e){
      
      console.log(e)
      AlertMsg.color = "red"  
      AlertMsg.err = e
    }
  }
  }
 
  onMount(() => {		 
   // new UIEvent("input",)
   //BeforeInput
    //event = new InputEvent("beforeInput",{inputType:"insertText",data:"----",isComposing:true,});
    //textareaObj.addEventListener("beforeinput",eventHand)
    
    init()
    show3d(jscad,[])
   
    window.document.addEventListener(
      "keydown",
      (e) => {    
       //console.log(e.code)
        if (e.ctrlKey && (e.code=="Enter"||e.code=="KeyS")){
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
  
    <NavLi href="#" on:click={()=>{ 
      modalTitle="solid1"
      TextareaVal=window.localStorage.getItem(modalTitle)||"\/\/Input Ctrl+enter perview this solid\nconst solid1=class{\n main(){\n return [this.cube({size:20,center:[0,0,200]})]\n};\n}";
      
      //console.log(solidNow.solid.length,"soldlength")
      Show3DSolid(TextareaVal);
      }
      }><CodeOutline/>Edit</NavLi>

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
  <Listgroup   >
    {#each searchSolid(searchkey) as item}
    <ListgroupItem   >
      <div class="w-full h-full"><p>{item[1]}</p></div>
      
    </ListgroupItem>     
  
    {/each}
  </Listgroup>
  {/if}
    
   
<Listgroup   active items={links} let:item class="basis-1/4" on:click={(e) =>{
  //console.log(e)
  TextareaVal =window.localStorage.getItem(e.detail)||"";
  modalTitle=e.detail;
  Show3DSolid(TextareaVal);
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
    }  } 
}}   on:keydown={(e)=>{
  
   //textareaObj = e.target
  if(e.code==="Escape"){
    startSearch=false
  }
  
  //console.log(textareaObj.data)
  if (e.ctrlKey &&  e.code=="KeyS") {
    e.preventDefault();   
    Show3DSolid(TextareaVal);
  }
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