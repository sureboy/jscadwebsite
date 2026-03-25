import {getCurrent,handleCurrentMsg,objUrlMap,getCurrentCode} from "./ImportParser";
//import type {currentObj} from "./ImportParser"
import {onWindowResize,startSceneOBJ,addSceneOBJ} from "./threeScene" ;
import { CSG2Three } from "./csg2Three";
import type { sConfig,mainConfigType } from './utils';  
import {stringToGzip} from './utils';
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
const consoleLogEnd=`}catch(e){  
  console.error(e)
    self.postMessage({ 
      error:{
            message:e.message,
            stack:e.stack
          },
      end:true
    });
};`;
const getWorkerCode = (config:mainConfigType )=>{
  let indexName = config.in;
  if (!indexName.startsWith("./")){
    indexName = "./"+indexName;
  }
  if (!indexName.endsWith(".js")){
    indexName += ".js";
  }
  //const   csgObjUrl = "./lib/csgChange.js"
  //getCurrent(csgObjUrl,postMessage)
  return  `${consoleLog} 
  const csg = await import( 'csgChange' )
  const src = await import("${indexName}")
  const main = "${config.func}";
  const list = Object.keys(src)
  const module = {list,basename:main?main:list[0]}
  let tmpDB
  self.onmessage = (e)=>{ 
    const {func,options} = e.data
    if ( func){ 
      try{
        tmpDB = src[e.data.func](options)
        if (tmpDB.then){
          tmpDB.then(db=>{
            csg.getCsgObjArray(db,(msg)=>{
              self.postMessage(msg)
            })
          })
        }else{
           csg.getCsgObjArray(tmpDB,(msg)=>{
              self.postMessage(msg)
           })
        }
      }catch(e){
        console.error(e)
        self.postMessage({ 
          error:{
            message:e.message,
            stack:e.stack
          }, 
        });
      }      
    }
  }
  self.postMessage({module})
  try{
    tmpDB = src[module.basename]()
    if (tmpDB.then){
      tmpDB.then(db=>{
        csg.getCsgObjArray(db,(msg)=>{
          self.postMessage(msg)
        })
      })
    }else{
      csg.getCsgObjArray(tmpDB,(msg)=>{
        self.postMessage(msg)
      })
    } 
  }catch(e){
    console.error(e)
    self.postMessage({ 
      error:{
        message:e.message||"",
        stack:e.stack||""
      }, 
    });
  }
${consoleLogEnd}`; 
}
export const getWorkerName = (config?:mainConfigType)=>`./worker.js`
const getBaseUrl =async (conf:sConfig)=>{ 
  const workerUrl = getWorkerName(conf.workermsg.windowConfig)
  const workerObj =await getCurrent(
    workerUrl,
    (e)=>{ 
      if (conf.showAd){
        setTimeout(()=>{
          //const db= getWorkerCode(config)
          handleCurrentMsg({
            name:workerUrl,
            db:getWorkerCode(conf.workermsg.windowConfig )
          },conf.postMessage) 
        }) 
      }else{
        conf.postMessage(e)
        //fetch()
      }
  })
  if (!workerObj.db) {
    const msg = {
      name:workerUrl,
      db:getWorkerCode(conf.workermsg.windowConfig)
    }
    conf.postMessage({type:"src",msg})
    handleCurrentMsg(msg,conf.postMessage) 
  }
  return workerObj.getUri() 
};

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
    conf.worker.postMessage({func:conf.workermsg.windowConfig.func,options});
  }else{
    conf.worker.postMessage({func:conf.workermsg.windowConfig.func});
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
export const HandleMsgToShow = (conf:sConfig,msg:{
  start:boolean,
  ver:any,
  module:any,
  tmpDB:any,
  end:boolean,options:any,log:any,error:any
})=>{

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
    onWindowResize(conf.el!,conf.workermsg?.cameraType||"Perspective" )	;
    if (conf.postMessage){
    conf.postMessage({
      type:'end'
    });}
    conf.showMenu =conf.oldMenu;// 1 | (1<<1) | (1<<2) | (1<<3);

  }
  if (msg.options){
    //console.log("options",msg.options)
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
      /*
      if (msg.error.stack && typeof msg.error.stack === "string"){
        objUrlMap.forEach((v,k)=>{
          msg.error.stack = (msg.error.stack as string).replaceAll(k,path.join(conf.workermsg.windowConfig.src,v))
        })
      }*/
      conf.postMessage({
        type:'error',
        msg:msg.error,
        urlMap:Object.fromEntries(objUrlMap),
      });
    }
  }  
}
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
  //if (!conf.baseUrl){
  conf.baseUrl = await getBaseUrl(conf) ;
  //}
  conf.worker = new Worker(conf.baseUrl,{type: "module"});
  conf.worker.onerror = e=>{
    console.error("error", e, conf.baseUrl );
    if (conf.postMessage){
      conf.postMessage({
        type:'error',
        msg:e.message || "Code syntax error"
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
    //const msg = e.data;
    HandleMsgToShow(conf, e.data)
       
  };  
};
export const getCodeGz =async (solidConfig:sConfig)=>{  
    const current =await getCurrent(
        getWorkerName(solidConfig.workermsg.windowConfig),
        solidConfig.postMessage)  
    console.log(solidConfig.workermsg?.windowConfig)
    let codeSrc = ""
    //solidConfig.workermsg.windowConfig.files = []
    await getCurrentCode( current,(name:string,code:string)=>{ 
        if (solidConfig.includeImport[name]){
            return
        }
        //solidConfig.workermsg.windowConfig.files.push(name)
    codeSrc +=`
/**${name}*/
${code}
`  
    })

    codeSrc +=`
/**solidjscad.json*/
${JSON.stringify(solidConfig.workermsg.windowConfig,null,2)}
`

//console.log("getCodeGz",solidConfig.workermsg.windowConfig)
    const chunks = await stringToGzip(codeSrc)
    return new Blob(chunks, { type: 'application/gzip' });
}