<script lang="ts" >
  import QRCode from 'qrcode';
  import modeling from '@jscad/modeling';
  import { Exporter} from "./function/threeScene" 
  import {handleCurrentMsg,getCurrent,getCurrentCode} from "./function/ImportParser"  
  import  {mySolidConfig}  from "./LoadGzFile.svelte";
  import { MenuType,getDBUrl } from "./function/utils";
  import type { sConfig } from './function/utils';
  import {CodeWorker} from "./function/worker"
  const { solidConfig }:{ solidConfig:sConfig} = $props();
  const showCaptchaCode = (captchaCode:any[] )=>{
      const lineCorner = modeling.primitives.circle({ radius: 1 })
      const lineSegments:any = []
      captchaCode.forEach((segmentPoints:any) => { // process the line segment
          const corners = segmentPoints.map(
            (point:any) => modeling.transforms.translate(point, lineCorner))
          lineSegments.push(modeling.hulls.hullChain(corners))
      })
      return lineSegments
    
  }
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
  const postSrcMsg = (e:{ path?:string})=>{
      if (e.path){
        fetch( 
          e.path.replace(/^\.\//,`./${solidConfig.workermsg.src}/`) )
          .then(f=>{
            f.text().then(db=>{
              handleCurrentMsg({name:e.path,db},postSrcMsg)
            })
          })
      }
  }
  const getCodeGz =async ()=>{
    if (!window.CompressionStream || !window.DecompressionStream) {
      return
    }
      //const res = Exporter()  
      let indexName = solidConfig.workermsg.in;
      if (!indexName.startsWith("./")){
        indexName = "./"+indexName;
      }
      if (!indexName.endsWith(".js")){
        indexName += ".js"
      }
      //handleCurrentMsg({name:"./lib/csgChange.js"},postSrcMsg)
      const csgObj = await getCurrent("./lib/csgChange.js",postSrcMsg);
      console.log("csg",csgObj)
      //handleCurrentMsg({name:indexName},postSrcMsg)
      const current =await getCurrent(indexName,postSrcMsg)  
      //console.log(current)
      let codeSrc = ""
      await getCurrentCode( csgObj,(name:string,code:string)=>{
        codeSrc +=`
/**${name}*/
${code}
`        //codeList.push(code)
      })
      await getCurrentCode( current,(name:string,code:string)=>{
        codeSrc +=`
/**${name}*/
${code}
`        //codeList.push(code)
//console.log(name)
      })
      codeSrc +=`
/**${mySolidConfig.name}*/
${window.localStorage.getItem(mySolidConfig.configName())}
`

      
      console.log("codeSrc",codeSrc)
      const chunks = await stringToGzip(codeSrc)
      return new Blob(chunks, { type: 'application/gzip' });
  }
  let showInputCode:{key?:string,QRUrl?:string,value?:string,url?:string } = $state({})
  const checkInputCode =async ( )=>{
  
    fetch(`/code?code=${showInputCode.value}&key=${showInputCode.key}`,{
    method: "POST",body:await getCodeGz() }).then(r=>{
      if (!r.ok)return
      r.json().then(db=>{
        if (!db.k){
          alert(JSON.stringify(db))
          return
        }
        showInputCode.url =`${window.location.protocol}//${window.location.host}#${db.k}`
        QRCode.toDataURL(showInputCode.url, {
          width: 200, 
          color: {
            dark: '#3b82f6',
            light: '#ffffff'
          }
        }).then(qrDataUrl=>{
          showInputCode.QRUrl = qrDataUrl
          showInputCode.key = undefined
        });
        console.log(db)
      })
    }).finally(()=>{
      showInputCode.value=""
      showInputCode.key=""
    })
  }
  const uploadCodeClick = ()=>{
    //console.log(Date.now().toString(36))
    if (!confirm(`warning!!! The [${mySolidConfig.getP()}] will be uploaded to the server cloud.`))return
    fetch(`/code?${Date.now().toString()}`).then(r=>{
      if (!r.ok)return
      r.json().then(db=>{
        //console.log(db)
        CodeWorker(solidConfig,showCaptchaCode(db.code))
        showInputCode.key = db.key 
      })
    }) 
  }
  const downCodeclick = async ()=>{

    const compressedBlob = await getCodeGz()
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
  const stringToGzip= async (src:string)=>{
    const originalBytes = new TextEncoder().encode(src);
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(originalBytes);
        controller.close();
      }
    });
    const compressionStream = new CompressionStream('gzip');
    const compressedStream = readableStream.pipeThrough(compressionStream);

    // 4. 从压缩流中读取数据块
    const reader = compressedStream.getReader();
    const chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); // value 是 Uint8Array 类型的数据块
    }
    return chunks 
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
      <button  style="height:48:px;line-height:48px;cursor: pointer;" onclick={uploadCodeClick}>Share</button> 
        {#if showInputCode.key}
        <input maxlength="8" type="text" bind:value={showInputCode.value} placeholder="Input Code" onkeydown={(e)=>{
          if (e.key==="Enter" && showInputCode.value.length===8){
            checkInputCode()
          }
        }}>
        {/if}
        {#if showInputCode.url}
        <p><a style="color:white" href={showInputCode.url} target="_blank" >{showInputCode.url}</a></p>
        {/if}
        {#if showInputCode.QRUrl}
        <p><img src="{showInputCode.QRUrl}" alt="qr" /></p>
        {/if}
      {/if}
    </div>
</details>


 