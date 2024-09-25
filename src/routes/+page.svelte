<script lang="ts"> 
 
	import { onMount } from "svelte";    
//import type {solidBase} from '$lib/solidClass'
//import {solidBase} from '$lib/solidClass'
  import {show3d,saveSolid,showSolid,solidListKey,removeSolid,
    solidNow,getSolidString,solidLogo as solidBase,updateOptions} from "$lib/show3d";
  import type {SearchDataCallback} from "$lib/show3d";
  import {  CodeOutline,TrashBinSolid, CloseOutline, DownloadSolid   } from 'flowbite-svelte-icons';
  import { Fileupload, Navbar, NavBrand, NavLi, NavUl, Modal,
    NavHamburger,Alert ,Badge,Listgroup,ListgroupItem,Textarea } from 'flowbite-svelte';  
  import {serialize,mimeType} from "@jscad/stl-serializer"  
  type Tcolor ="dark" | "form" | "none" | "gray" | "red" | "yellow" | "green" | "indigo" | "purple" | "pink" | "blue" | "light" | "default" | "dropdown" | "navbar" | "navbarUl" | "primary" | "orange" | undefined
  //type base = solidBase
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
  let helpCode:string = ""
  let formModal = false;
  let helpTitle:string=""
  //let startSearch:boolean =false
  //let tempVal:string=""
  let regSearchKey = /this\.(?:\w*\.?)*$/
  //let base:solidBase|null=null

	/** @type {import('./$types').PageData} */
	export let data:any;
  //console.log(data.data)
const searchSolid=(key:string,len:number=2000)=>{
 console.log(key)
 //let keylist = key.split(".")
 //keylist.shift()
 let li:any[] = []
 if (!key)return li
 searchHelpData( data.data,key,(k:string,v:any)=>{
    li.push([k,v])
    return li.length<len
 })
 if (li.length==0){

 }
 return li
}
 
//const base = class extends solidBase{} 
//console.log(base)
 
function searchHelpData(solid:Map<string,any> ,k_:string,callback:SearchDataCallback)  {
  for (const [key, value] of  solid) {
      //console.log(`${k_} ${key}: ${typeof(value)}`);
      if (key.startsWith(k_)){
        if (!callback(key,value))return 
      } else{
        let ks = k_.split(".").pop()
        if (ks){
          if (key.search(ks)>0)if (!callback(key,value))return 
        }
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
      if(v)links.push(v)
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
    //const logo = 
    //console.log(solidBase)
    show3d(jscad,[])
    updateOptions((new solidBase).main())
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
  {#if searchkey}
  <Listgroup  active >
    {#each searchSolid(searchkey) as item}
    <ListgroupItem  on:click={(e) =>{
      console.log(item[1])
      formModal=true;
      helpCode=item[1]
      helpTitle=item[0]
      }} >
     {item[0]} 
    </ListgroupItem>     
    {/each}
  </Listgroup>
  {/if}
<Listgroup   active   class="basis-1/4" >
  {#each links as item}
  <ListgroupItem current={modalTitle==item} on:click={(e) =>{
    //console.log(e)
    TextareaVal =window.localStorage.getItem(item)||"";
    modalTitle=item;
    Show3DSolid(TextareaVal);
    }} >{item}</ListgroupItem> 
  {/each}
  
 
</Listgroup>
</div>
<Textarea    placeholder="input Ctrl+Enter View Solid"     on:input={e=>{
    textareaObj = e.target
    start = textareaObj.selectionStart
    let kl = regSearchKey.exec(textareaObj.value.substring(0,start))
    if (!kl)  searchkey=""; 
    else{
      //let keylist = kl[0].split(".")
      //keylist.shift()
      //console.log(keylist)
      if (kl[0])  searchkey =kl[0];
      else  searchkey=".";  
      //console.log(searchkey)
    }
  }}   on:keydown={(e)=>{ 
  if (e.ctrlKey &&  e.code=="KeyS") {
    e.preventDefault();   
    Show3DSolid(TextareaVal);
  }
  if (e.code==="Tab"){
    e.preventDefault();
  }
  }} 
    spellcheck=false   rows="10" bind:value={TextareaVal} class="basis-3/4  opacity-80 " > </Textarea>
 
</div>


{/if}
</div>
<Modal size="xl" title="{helpTitle}" bind:open={formModal}  autoclose outsideclose  class="w-full">
  <Textarea rows="15" bind:value={helpCode} ></Textarea>
</Modal>

<div id="jscad" bind:this={jscad} class=" h-full w-full z-0 absolute top-0 left-0" ></div>  

<style lang="postcss">
 
  #jscad{ 
        margin: 0;
        outline: 1px solid black;
      }
 

</style>