<script lang="ts">

import Header from '$lib/component/Header.svelte';
import EditorJs from '$lib/component/EditorJs.svelte' 
import View3d from '$lib/component/View3d.svelte'  
import Help from '$lib/component/Help.svelte'  
import type { PageData } from './$types';
 
export let data:PageData; 

</script>

<main>
  <div class="z-10 absolute top-0 left-0  w-full  pointer-events-none">
    <Header  > </Header>

    <EditorJs   inputList={data.data}  >

    </EditorJs>
  </div>


</main>
<View3d  > </View3d> 
<Help inputList ={data.data} ></Help>