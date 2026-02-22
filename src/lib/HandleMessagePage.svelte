<script lang="ts" module >
import ShowSolid  from './ShowSolid.svelte';
import Menu,{menuConfig}  from './Menu.svelte'

import { runWorker } from "./function/worker";
import {delCurrentMsg,handleCurrentMsg,getCurrent,getCurrentCode}  from "./function/ImportParser"
import type {messageObj} from "./function/ImportParser"
import {gzipToString,srcStringToFile,MenuType} from "./function/utils"
import { addSceneSTL} from "./function/threeScene" 
import {STLLoader} from "three/addons/loaders/STLLoader.js" 
import type { sConfig,workerConfigType,windowConfigType } from './function/utils';

//export const solidConfig:sConfig=$state({ showMenu:1})
export const solidConfig:sConfig=$state( 
  { 
    showMenu:0,setWorkerMsg:(w:workerConfigType)=>{
    solidConfig.workermsg = {...w}
  }}
)
//const myConfig = ((window as any).myConfig as windowConfigType) || null

type  handlePostMsg = (msg:any,postMessage?: (e: {name:string,db:string|ArrayBuffer,open:boolean}) => void)=>void
const del:{name:string,fn:handlePostMsg} = {
  name:"del",
  fn:(msg:{name:string})=> {    
    delCurrentMsg(msg.name);
  }
}
const init:{name:string,fn:handlePostMsg} = {
  name:"init",
  fn:(msg:messageObj&{open:boolean},postMessage?: (e: any) => void) =>{
    handleCurrentMsg(msg,postMessage)
  }
}
const begin:{name:string,fn:handlePostMsg} ={
  name:"begin",
  fn:(msg:{config:windowConfigType} ,
  postMessage?: (e: any) => void) =>{  
    //console.log("begin",msg)
    solidConfig.workermsg  =Object.assign(menuConfig,msg.config )
     
  }
}
const run:{name:string,fn:handlePostMsg} ={
  fn:(msg:messageObj&{open:boolean},
    postMessage?: (e: any) => void) =>{  
      /*
      console.log(msg)
      //const c = msg.db as windowConfigType
      initMenu(
        solidConfig,
        //{func:c.func,in:c.in,name:c.name,src:c.src}
        msg.db as windowConfigType
      ) */
     //console.log("run",solidConfig)
      Object.assign(solidConfig.workermsg,{cameraType:msg.open?solidConfig.workermsg?.cameraType:'' })
      runWorker(solidConfig );    
    },
  name:"run"
}
const getSrc:{name:string,fn:handlePostMsg} = {
  fn:(msg:{name?:string},postMessage?: (e: any) => void) =>{
  //let indexName =msg.name?msg.name: solidConfig.workermsg.in;
/*
    let indexName = solidConfig.workermsg.worker;
    if (!indexName.startsWith("./")){
      indexName = "./"+indexName;
    }
    if (!indexName.endsWith(".js")){
      indexName += ".js";
    }*/
    //console.log("getsrc",solidConfig.workermsg.worker)
    //console.log("getsrc")
    getCurrent(solidConfig.workermsg.worker,postMessage).then(
      current=>{   
        //console.log(current)     
        getCurrentCode(current,(name:string,code:string)=>{
          //console.log("getsrc",name,code);
          postMessage({
            type:"src",
            name,
            code
            //code:new TextEncoder().encode(code)
          }) 
        })
        /*.then(()=>{
          getCurrent("./lib/csgChange.js",postMessage).then(c=>{
            getCurrentCode(c,(name:string,code:string)=>{
              postMessage({
                type:"src",
                name,
                code
                //code:new TextEncoder().encode(code)
              }) 
            }).then(()=>{
              postMessage({
                type:"src"
              }) 
            })
          });
          
        })*/
      })
  },
  name:"getSrc"
}
const gzData:{name:string,fn:handlePostMsg} = {
  fn:(message:{db:ArrayBuffer},postMessage?: (e: any) => void)=>{
   // console.log(message)
  gzipToString(message.db).then(src=>{    
    srcStringToFile(src,(db)=>{  
      //console.log(db.name)  
      if (db.name.endsWith("solidjscad.json")){
        Object.assign(solidConfig.workermsg,JSON.parse(db.db) )
      }else{
        handleCurrentMsg(db) 
      }
    }) 
    console.log(solidConfig)
    runWorker(solidConfig );
  }) 
  },
  name:'gzData'
}
const stlData:{name:string,fn:handlePostMsg} = {
  fn:(message:{db:ArrayBuffer},)=>{
  addSceneSTL(solidConfig.el,new STLLoader().parse(message.db));
    solidConfig.showMenu=MenuType.Camera // | MenuType.Stl
  },
  name:"stlData"
}
export const Direction:{name:string,fn:handlePostMsg}[] =[begin, init, del,run,getSrc,gzData,stlData ] 
const getMsgHandle = (type:number )=>{
  function* getTag  () {
    for (let i = 0; i < Direction.length; i ++) {    
      if ((type & (1<<i)) !==0){
        yield Direction[i]
      }
    }
  }
  return getTag()
}
export const HandleMessage = ( 
  message:{type:number,msg:any},
  postMessage?: (e: any) => void)=>{
    //console.log("messagepost",message)
    for (const type of getMsgHandle(message.type)) {
      //console.log(type.name);
      type.fn(message.msg,postMessage)
    }
} 
</script>
<svelte:head>
  <title>{solidConfig.workermsg?.name || ""}</title>
</svelte:head>
<ShowSolid></ShowSolid> 
<Menu {solidConfig}  >{""}</Menu>