<script lang="ts">
//export const ssr = false

import EditorJs , {getValue} from '$lib/component/EditorJs.svelte' 
import View3d ,{screenHandle,loaderSTL,loaderFile} from '$lib/component/View3d.svelte'  
import Header from '$lib/component/Header.svelte';
import Help from '$lib/component/Help.svelte'  
import type { PageData } from './$types'; 
import { StoreAlertMsg} from "$lib/function/storage"   
export let data:PageData;  
</script>
<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="manifest" href="manifest.json" />
  <title>  {$StoreAlertMsg.name?$StoreAlertMsg.name:"solidJSCAD"} </title>
</svelte:head>
<main>
  <div class="z-10 absolute top-0 left-0  w-full  pointer-events-none">
  <Header on:screen={screenHandle} on:stl={loaderSTL} on:file={loaderFile} {getValue} > 
  </Header>
  <EditorJs  inputList={data.data} >
  </EditorJs>
  </div>
</main>
<View3d  > </View3d> 
<Help inputList ={data.data} ></Help>