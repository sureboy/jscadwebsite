<script lang="ts" module >
import ShowSolid  from './ShowSolid.svelte';
import Menu,{menuConfig}  from './Menu.svelte' 
import {HandleMessageClass} from './function/handleMessage' 
import type { sConfig } from './function/utils'; 
export const solidConfig:sConfig=$state( { showMenu:0,workermsg:menuConfig} ) 
//   this.solidConfig.workermsg = Object.assign( this.menuConfig,{windowConfig:msg.config} )  
export const handleMsg =new HandleMessageClass(solidConfig)

</script>
<svelte:head>
  <title>{solidConfig.workermsg?.windowConfig?.name || ""}</title>
</svelte:head>
<ShowSolid></ShowSolid> 
<Menu {solidConfig}  >{""}</Menu>