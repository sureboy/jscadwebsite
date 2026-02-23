<script lang="ts" >
  import { onMount } from 'svelte';
  import {initSolidPage} from './lib/ShowSolid.svelte';
  import {MenuType} from './lib/function/utils'    
  import HandlePage,{ HandleMessage,Direction,solidConfig} from './lib/HandleMessagePage.svelte';
  solidConfig.oldMenu =MenuType.MainMenu|MenuType.Src | MenuType.Camera | MenuType.Gzip | MenuType.Png | MenuType.Stl;//  1 | (1<<1) | (1<<2) | (1<<3);
  


  solidConfig.postMessage = (e:{type:string,path?:string})=>{ 
    console.log("post",e)
    fetch("/api",{
      method:"POST",
      body:JSON.stringify(e),
    }).then(res=>{
      res.json().then(db=>{
        console.log("get",db)
        HandleMessage(db,solidConfig.postMessage)
      })
      
      //console.log(res)
    })
    /*
        if (e.path){
            setTimeout(()=>{
                handleCurrentMsg({
                    name:e.path,
                    db:window.localStorage.getItem(e.path)},
                    solidConfig.postMessage
                )
            }) 
        }*/
    }
  
  const loadedFetch = ()=>{
    fetch("/api",{
      method:"POST",
      headers: {
        "Content-Type": "application/json", 
      },
      body:JSON.stringify({ 
        msg: {direction:Direction.map(v=>{ 
          return v.name}),pageType:solidConfig.workermsg?.pageType||"run"}, 
        type:'loaded'
      })
    }).then(data=>{
      data.json().then(db=>{
        console.log("loaded",db)
        HandleMessage(db,solidConfig.postMessage)
      })
    })
  }
function base64ToArrayBuffer(base64) {
  // 移除可能存在的 data URL 前缀（如果有）
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  // 解码 Base64 为二进制字符串
  const binaryString = atob(base64Data);

  // 创建 Uint8Array 并填充字节
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 返回 ArrayBuffer（或直接返回 bytes 本身）
  return bytes.buffer;
}
  onMount(() => {
    initSolidPage(solidConfig)
    loadedFetch();
    const eventSource = new EventSource('/events');

    eventSource.onmessage = (event) => {
      //console.log("events",event.data)
      const data = JSON.parse(event.data) as {type:number,msg:{name:string,db?:string|ArrayBuffer}}
      if (data.msg.db && typeof data.msg.db ==="string"){
        data.msg.db = base64ToArrayBuffer(data.msg.db)
        //data.msg.db = Buffer.from(data.msg.db,'base64').buffer
      }
      HandleMessage( data ,solidConfig.postMessage)
    };
    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
    };
  })
   
    
  </script> 
<HandlePage  ></HandlePage> 