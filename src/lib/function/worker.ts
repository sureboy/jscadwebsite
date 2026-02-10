import {getCurrent} from "./ImportParser";
import {onWindowResize,startSceneOBJ,addSceneOBJ} from "./threeScene" ;
import { CSG2Three } from "./csg2Three";
import type { sConfig } from './utils';

const consoleLog = `
const originalLog = console.log;
console.log = (...e)=>{
originalLog(e)
  self.postMessage({ 
    log: e
  });
} 
try{
`;
const consoleLogEnd=`}catch(error){        
    console.error(error)
    self.postMessage({ 
    error:error.stack,
    end:true
    });
};`;
//let _worker: Worker|null; 
//let baseUrl:string;
//let oldMenu:number = 0;
const getBaseUrl =async (config:{in:string,func:string,src:string },postMessage?:(e:any)=>void)=>{
 

  let indexName = config.in;

  if (!indexName.startsWith("./")){
    indexName = "./"+indexName;
  }
  if (!indexName.endsWith(".js")){
    indexName += ".js";
  }
  let csgObjUrl = "./lib/csgChange.js";
  if (!postMessage){
    csgObjUrl = `./${config.src}/lib/csgChange.js`;
    const li = indexName.split("/");
    indexName = [li[0], config.src,...li.slice(1)].join("/");
  }
  const csgObj = await getCurrent(csgObjUrl,postMessage);

  const csgUri = await csgObj.getUri();
  const indexObj = await getCurrent(indexName,postMessage);
 
  const indexuri = await indexObj.getUri();
  const src = `
  ${consoleLog} 
  const csg = await import( '${csgUri}' )
  const src = await import("${indexuri}")
  const main = "${config.func}";
  const list = Object.keys(src)
  const module = {list,basename:main?main:list[0]}
  self.onmessage = (e)=>{
    const {func,options,code} = e.data
    if ( func){ 
      csg.getCsgObjArray(src[e.data.func](options),(msg)=>{
        self.postMessage(msg)
      }) 
    }
    if (code){
      csg.getCsgObjArray(code,(msg)=>{
        self.postMessage(msg)
      })
    }
  }
  self.postMessage({module})
  csg.getCsgObjArray(src[module.basename](),(msg)=>{
  self.postMessage(msg)
}) 
${consoleLogEnd} `; 
//console.log(src);
  return URL.createObjectURL(
    new Blob([src],{type:'application/javascript'}));
};
/*
export const runWorkerInVscode = (el:HTMLCanvasElement,message:workerConfigType )=>{
    
    runWorkerBase(el,message,vscode.postMessage);
      vscode.postMessage({
        type:'start'
      });
   
};
*/
export const changeWorker = (conf:sConfig  )=>{
  if (!conf.worker){
    runWorker(conf);
    return;
  }
  if (conf.postMessage){
    conf.postMessage({
      type:'start'
    });
  }
  
  conf.showMenu = 1; 
  if (conf.workermsg.options){
    const options =JSON.parse( JSON.stringify(conf.workermsg.options));
    console.log("up options",options)
    conf.workermsg.options=undefined;
    conf.worker.postMessage({func:conf.workermsg.func,options});
  }else{
    conf.worker.postMessage({func:conf.workermsg.func});
  }
};

export const CodeWorker = (conf:sConfig,code:any  )=>{
  if (!conf.worker){
    //runWorker(conf);
    return;
  }
  if (conf.postMessage){
    conf.postMessage({
      type:'start'
    });
  }
  console.log("code worker")
  conf.worker.postMessage({code});
};
export const runWorker =async ( conf:sConfig  )=>{
  if (conf.worker){
    conf.worker.terminate();
    conf.worker = null;
    URL.revokeObjectURL(conf.baseUrl);
    conf.baseUrl = undefined;
    
  }
  if (!conf.oldMenu){
    conf.oldMenu = conf.showMenu;
  }
  if (conf.postMessage){
    conf.postMessage({
      type:'start'
    });
  }
  
  conf.showMenu = 1;
  if (!conf.baseUrl){
    conf.baseUrl = await getBaseUrl({
      func:conf.workermsg.func,
      src:conf.workermsg.src||"",
      in:conf.workermsg.in
    },conf.postMessage) ;
  }
  //const baseUrl =await getBaseUrl(message,postMessage);

  conf.worker = new Worker(conf.baseUrl,{type: "module"});
  //console.log(worker)  
  conf.worker.onerror = e=>{
    console.error("error", e );
    if (conf.postMessage){
      conf.postMessage({
        type:'error',
        msg:"Code syntax error"
      });
    }
  };
  conf.worker.onmessageerror = e=>{
    console.error("messageErr",e);
    if (conf.postMessage){
      conf.postMessage({
        type:'error',
        msg:e.data
      });
    }
  };
  
  conf.worker.onmessage = function(e) {
    
    const msg = e.data;
    //message.msg = msg;
    //console.log(e,msg);
    if (msg.start ){
      try{
        startSceneOBJ(conf.el);
      }catch(err){
        console.error(err);
        if (conf.postMessage){
        conf.postMessage({
          type:'initError',
          msg:err.error
        });}
      }
      
    }
    if (msg.ver){
      addSceneOBJ(conf.el, CSG2Three(msg.ver,{}) );
      //console.log("update",(Date.now()-tmpDate) /1000)
    }
    if (msg.module){
      conf.workermsg.module(msg.module);
    }
    if (msg.end ){

      //console.log("cameraType",conf.workermsg.cameraType);
      onWindowResize(conf.el!,conf.workermsg.cameraType )	;
      if (conf.postMessage){
      conf.postMessage({
        type:'end'
      });}
      conf.showMenu =conf.oldMenu;// 1 | (1<<1) | (1<<2) | (1<<3);

    }
    if (msg.options){
      console.log("options",msg.options)
      conf.workermsg.options =msg.options //Object.assign(conf.workermsg.options||{},msg.options);
      //console.log(msg.options);
    }
    if (msg.log){
      if (conf.postMessage){
      conf.postMessage({
        type:'log',
        msg:msg.log
      });
    }
    }
    if (msg.error){
      if (conf.postMessage){
      conf.postMessage({
        type:'error',
        msg:msg.error
      });}
    }    
  };  
};