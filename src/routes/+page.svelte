<script lang="ts">


import EditorJs , {getValue} from '$lib/component/EditorJs.svelte' 
import View3d ,{screenHandle} from '$lib/component/View3d.svelte'  
import Header from '$lib/component/Header.svelte';
import Help from '$lib/component/Help.svelte'  
import type { PageData } from './$types'; 
export let data:PageData;  
</script>
<svelte:head>
  <link rel="manifest" href="manifest.json" />
  <title>solidJSCAD</title>
</svelte:head>
<main>
  <div class="z-10 absolute top-0 left-0  w-full  pointer-events-none">
  <Header on:message={screenHandle}  {getValue} > 
  </Header>
  <EditorJs  inputList={data.data} >
  </EditorJs>
  </div>
</main>
<View3d  > </View3d> 
<Help inputList ={data.data} ></Help>