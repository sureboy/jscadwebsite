<script lang="ts" module >
import { createCanvasElement } from "three";
import {onWindowResize } from "./function/threeScene" 
import type { sConfig } from './function/utils';

let container:HTMLElement;  

export const initSolidPage = (solidConfig:sConfig)=>{
    solidConfig.el = createCanvasElement() ;   
    solidConfig.el.width = document.body.clientWidth;
    solidConfig.el.height = document.body.clientHeight;
    container.innerHTML=""
    container.appendChild(solidConfig.el)  
    window.addEventListener('resize', ()=>{
      solidConfig.el!.width = document.body.clientWidth;
      solidConfig.el!.height = document.body.clientHeight; 
      onWindowResize(solidConfig.el!,solidConfig.workermsg.cameraType)
    });   
}
</script>


<div bind:this={container}  style="position: absolute;left:0;top:0;z-index: 1;" > 
</div> 


 
