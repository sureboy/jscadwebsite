<script lang="ts" >
  import { Exporter,Exporter3mf} from "../function/threeScene" 
  import {getCodeGz} from "../function/worker"   
  import { MenuType } from "../function/utils";
  import type { sConfig } from '../function/utils';
  import CodeFrom from './CodeFrom.svelte'
  import {createPng} from '../website/localImg'
  import ShowAds from './ShowAds.svelte';

  const { solidConfig }:{ solidConfig:sConfig} = $props();
 
  const downSrcClick = ()=>{
    console.log("down src")
    solidConfig.postMessage({
      type:"downSrc"
    }) 
    return;  
  }
  const getDownFileName = ()=>{
    return `${solidConfig.workermsg.windowConfig.func}_${solidConfig.workermsg.windowConfig.in.split(".").shift()}_${solidConfig.workermsg.windowConfig.name}_${Date.now()}`
  }
  const downPngClick = ()=>{
    //console.log("get png")
    createPng(solidConfig.el,(screenCanvas)=>{
      let aTag = document.createElement('a'); 
      aTag.download = `${getDownFileName()}.png`; //e.detail.name+"_screen.png";
      let href =screenCanvas.toDataURL()
      //console.log(href)
      //screenImgList.push(href)
      aTag.href = href;
      aTag.click();
      //screenImgList.add(href)
      URL.revokeObjectURL(href);  
    })
  }
  const down3MFclick = ()=>{

    Exporter3mf().then(blob=>{
      // const blob = new Blob(data,{ type: mimeType3mf } )
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      console.log(blob,link.href)
      link.download = `${getDownFileName()}.3mf`; 
      link.click();
      URL.revokeObjectURL(link.href); 
    })
    //showDownMsg="waitting down 3mf..." 
    //solidConfig.worker.postMessage({down:"3mf"});
      //serializer3mf(undefined,)
  }
  const downSTLclick = ()=>{
    const res = Exporter() 
    const blob = new Blob([res.buffer as ArrayBuffer], { type: 'application/octet-stream' })
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    //console.log(workermsg)
    link.download = `${getDownFileName()}.stl`; 
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
    link.download = `${getDownFileName()}.solidjscad.gz`; 
    link.click();
    URL.revokeObjectURL(link.href); 
  }
  
</script>
<details    >
    <summary style="cursor:pointer;height:48px;text-align:left;line-height: 48px;" >
       Function
    </summary>
    <div >
      {#if (solidConfig.showMenu & MenuType.Stl )}
      <button style="height:48:px;line-height:48px;cursor: pointer;" onclick="{downSTLclick}" >STL</button>  
      <button style="height:48:px;line-height:48px;cursor: pointer;" onclick="{down3MFclick}" >3MF</button>  
      {/if}
      {#if (solidConfig.showMenu & MenuType.Gzip )}
      <button style="height:48:px;line-height:48px;cursor: pointer;" onclick={downCodeclick} >Gzip</button>      
      {/if}
      {#if (solidConfig.showMenu & MenuType.Src )}
      <button style="height:48:px;line-height:48px;cursor: pointer;" onclick={downSrcClick} >UnGzip</button>      
      {/if}
      {#if (solidConfig.showMenu & MenuType.Png )}
      <button style="height:48:px;line-height:48px;cursor: pointer;" onclick={downPngClick} >Png</button>      
      {/if}
      {#if (solidConfig.showMenu & MenuType.Gzip )}
     
       <CodeFrom {solidConfig} />
      {/if}
  
    </div> 
    <ShowAds {solidConfig}></ShowAds>
</details>


 