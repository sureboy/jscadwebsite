<script lang="ts" >
  import { Exporter} from "./function/threeScene" 
  import {getCodeGz} from "./function/ImportParser"  
  import { MenuType} from "./function/utils";
  import type { sConfig } from './function/utils';
  import CodeFrom from './CodeFrom.svelte'
  const { solidConfig }:{ solidConfig:sConfig} = $props();
 
  const downSrcClick = ()=>{
    console.log("down src")
    solidConfig.postMessage({
          type:"downSrc"
      }) 
      return;
  
  }
  const downPngClick = ()=>{
    console.log("get png")
    const screenCanvas = document.createElement('canvas');
    const ctx = screenCanvas.getContext("2d")
    const img = new Image()
    img.src = solidConfig.el.toDataURL()
    img.onload = ()=>{
    screenCanvas.width  = img.width
    screenCanvas.height = img.height
    ctx.drawImage(img,0,0)
    const imagedata = ctx.getImageData(0, 0, img.width, img.height)
    let imgData = imagedata.data
    let minX = img.width;
    let minY = img.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const index = (y * img.width + x) * 4; 
        const red = imgData[index];
        const green = imgData[index + 1];
        const blue = imgData[index + 2]; 
        if (red === 0 && green === 0 && blue === 0) {
            continue
        } else {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
      }
    }
    const croppedWidth = maxX - minX + 1;
    const croppedHeight = maxY - minY + 1;
    screenCanvas.width = croppedWidth;
    screenCanvas.height = croppedHeight; 
    //console.log(minX, minY, maxX, maxY,croppedWidth,croppedHeight)
    ctx.drawImage(img, minX, minY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
    
    let aTag = document.createElement('a'); 
    aTag.download = `${solidConfig.workermsg.func}_${solidConfig.workermsg.in.split(".").shift()}_${solidConfig.workermsg.name}_${Date.now()}.png`; //e.detail.name+"_screen.png";
    let href =screenCanvas.toDataURL()
    //console.log(href)
    //screenImgList.push(href)
    aTag.href = href;
    aTag.click();
    //screenImgList.add(href)
    URL.revokeObjectURL(href);  	
    URL.revokeObjectURL(img.src); 
  } 
    
  }
  const downSTLclick = ()=>{
    const res = Exporter() 
    const blob = new Blob([res.buffer as ArrayBuffer], { type: 'application/octet-stream' })
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    //console.log(workermsg)
    link.download = `${solidConfig.workermsg.func}_${solidConfig.workermsg.in.split(".").shift()}_${solidConfig.workermsg.name}_${Date.now()}.stl`; 
    link.click();
    URL.revokeObjectURL(link.href); 
  } 

  const downCodeclick = async ()=>{

    const compressedBlob = await getCodeGz(solidConfig)
    if (!compressedBlob){
      console.log("down code err")
      return
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    link.download = `${solidConfig.workermsg.func}_${solidConfig.workermsg.in.split(".").shift()}_${solidConfig.workermsg.name}_${Date.now()}.solidjscad.gz`; 
    link.click();
    URL.revokeObjectURL(link.href); 
  }
  
 
</script>
<details    >
    <summary style="cursor:pointer;height:48px;text-align:left;line-height: 48px;" >
       Download
    </summary>
    <div >
      {#if (solidConfig.showMenu & MenuType.Stl )}
      <button style="height:48:px;line-height:48px;cursor: pointer;" onclick="{downSTLclick}" >STL</button>  
      {/if}
      {#if (solidConfig.showMenu & MenuType.Gzip )}
      <button style="height:48:px;line-height:48px;cursor: pointer;" onclick={downCodeclick} >Gzip</button>      
      {/if}
      {#if (solidConfig.showMenu & MenuType.Src )}
      <button style="height:48:px;line-height:48px;cursor: pointer;" onclick={downSrcClick} >Src</button>      
      {/if}
      {#if (solidConfig.showMenu & MenuType.Png )}
      <button style="height:48:px;line-height:48px;cursor: pointer;" onclick={downPngClick} >Png</button>      
      {/if}
      {#if (solidConfig.showMenu & MenuType.Gzip )}
     
       <CodeFrom {solidConfig} />
      {/if}
    </div>
</details>


 