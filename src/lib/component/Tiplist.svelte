<script lang="ts" > 
    import { Modal,Textarea } from 'flowbite-svelte';
    import type {SearchDataCallback} from "$lib/function/share";
    import { DotsHorizontalOutline } from 'flowbite-svelte-icons';
	//import {StoreInputList,StoreInputKey,StoreOutputKey} from './store'

	export let inputList:Map<string, any>;
	export let inputKey:string;
	export let inputOutKey:string;
  let helpCode:string = ""
  let formModal = false;
  let helpTitle:string=""
  const searchSolid=(key:string,len:number=30)=>{	
		let li:any[] = []
		if (!key)return li
		searchHelpData(inputList,key,(k:string,v:any)=>{
			li.push([k,v])
			return li.length<len
		})
		if (li.length==0){

		}
		return li
	}	
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
</script>

{#if inputKey}
<ol>
{#each searchSolid(inputKey) as item}
<li class="relative" >
<a  href="#top"  on:click={(e) =>{ 
    inputOutKey = item[0]
   // console.log(inputOutKey);
}} >   {item[0]} </a> 
   <a  href="#top"    on:click={(e) =>{
    console.log(item[1])
    formModal=true;
    helpCode=item[1]
    helpTitle=item[0]
    }} class="absolute right-1"  >
    <DotsHorizontalOutline   />
 
</a>
</li>  
{/each}
</ol>
{/if}

<Modal size="xl" title="{helpTitle}" bind:open={formModal}  autoclose outsideclose  class="w-full">
	<Textarea rows={15} bind:value={helpCode}  spellcheck=false ></Textarea>
  </Modal>

