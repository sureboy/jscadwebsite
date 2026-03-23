<script lang="ts" module >
import ShowSolid  from '../components/ShowSolid.svelte';
import Menu,{menuConfig}  from '../components/Menu.svelte' 
import {HandleMessageClass} from './handleMessage' 
import type { sConfig } from '../function/utils'; 
import {includeImport} from '../function/utils';
export const solidConfig:sConfig=$state( { 
  includeImport,
  //isVscode: (window as any).vscode?true:false,
  showMenu:0,workermsg:menuConfig} ) 
//   this.solidConfig.workermsg = Object.assign( this.menuConfig,{windowConfig:msg.config} )  
export const handleMsg =new HandleMessageClass(solidConfig)

</script>
<svelte:head>
  <title>{solidConfig.workermsg?.windowConfig?.name || ""}</title>
</svelte:head>
<ShowSolid></ShowSolid> 
<Menu {solidConfig}  >{""}</Menu>