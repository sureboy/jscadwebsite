import type { sConfig } from './utils'; 
import { stringToGzip,mySolidConfig,regexExec } from "./utils";
export type messageObj = {
    name:string,
    db?:ArrayBuffer | string
}
type currentObj = { 
    url?:string;
    persons:Set<currentObj>;
    //code?: string; 
    srcList?:((()=>Promise<currentObj> )|string)[]
    getUri:()=>Promise<string>;
    //toString:()=>string;
    //children?:Set<currentObj>;
    //update?:()=>void;
    //reload?:(db:AllowSharedBufferSource)=>void;
 
} & messageObj
type importType = {
    moduleName:string,
    startPosition:number,
    endPosition:number,
    //fullImport:string,
    obj:currentObj,
}
export const currentMap = new Map<string,currentObj>();
const waitGetMap = new Map<string,(c:currentObj)=>void>();

const  importParser = (code:string)=> {
    const regex = /import\s*(?:(?:(?:\w+|\*\s*as\s*\w+|\{[^}]*\})\s+from\s+)?['"]([^'"]+)['"]|['"]([^'"]+)['"])/g;
    const imports:importType[] = [];
    regexExec(code,regex,(match,i)=>{
        //console.log(match,match[0].length,i);
        const moduleName = match[1] || match[2];

        const quoteIndex = Math.max(
            match[0].indexOf("'"),
            match[0].indexOf('"')
        );
        const startPosition = match.index + quoteIndex + 1;
        
        imports.push({
            moduleName:moduleName,//.startsWith(".")?moduleName.split("/").pop():moduleName ,
            startPosition: startPosition,
            endPosition: startPosition + moduleName.length,
            // fullImport: match[0]
        } as importType);
    });
   
    //console.log(imports);
    return imports;
};
 
export const getCurrentCode =async ( src:currentObj,back:(name:string,code:string)=>void,children = new Set<currentObj>()) => {
    let code = "";    
    children.add(src);
    if (!src.srcList){
        return;
    }
    for (const _src of src.srcList){ 
        if (typeof _src ==="string"){
            code+=_src;
            continue;
        }
        const ___src =await _src();

         
        //if (!___src.name)console.log(___src);
        if (___src.db){
            
            if (!children.has(___src)) {
               
                await getCurrentCode(___src,back,children);
            }
            //code+= "./" + ___src.name;   
        }//else{
            code+=  ___src.name;      
        //}    
        
        
    };
    if (code){
        //console.log(code);
        back(src.name,code);
    }
};
 
export const getCurrent = (name:string,reqMessage?:(e:{type:"req",path:string})=>void )=>{
    return new Promise<currentObj>((resolve, reject)=>{
        /*
        if (!name.startsWith("./")){
            if (includeImport[name]){
                name = includeImport[name];
            }
        }*/
        if (currentMap.has(name)){
            resolve(currentMap.get(name)!);
            return ;
        }
        if (!reqMessage ){
            console.log("not reqmsg",name);
            resolve(InitCurrentMap({name}));
            //reject("Found Not");
            return;
        }
        
        reqMessage({type:"req",path:name});
        const t = setTimeout(()=>{
            
            waitGetMap.delete(name);
            resolve(InitCurrentMap({name}));
        }, 2000);
        waitGetMap.set(name,(c:currentObj)=>{
            clearTimeout(t);
            resolve(c);
            
            
            waitGetMap.delete(name);
        });
        
    });
    
    //return getMsg(name);

    //return currentMap.has(name)?currentMap.get(name):name;
    

     
};
const decoder = new TextDecoder();
const updateCurrent = (c:currentObj)=>{
    //console.log("update",c.name);
    if (!c.url){
        return;
    }
    URL.revokeObjectURL(c.url);
    c.url = '';
    
    c.persons.forEach((p:currentObj)=>{
        updateCurrent(p);
    });
};
const reloadCurrent = (c:currentObj,msg:messageObj,postMessage?:(e:any)=>void)=>{
    updateCurrent(c);

    //this.code = ;
    //this.src = [];
    c.srcList = [];
    if (!msg.db){
        return;
    }
    let src = "";
    if (typeof msg.db ==="string"){
        src = msg.db;
    }else if ( msg.db instanceof ArrayBuffer){
        src = decoder.decode(msg.db);
    }else{
        console.log(msg,typeof msg.db);
        return;
    }
    //src = (typeof msg.db ==="string")?msg.db: decoder.decode(msg.db);
    let tmpEndPos:number = 0;
   

    //let indexPos = 0;
    importParser(src).forEach(p=>{
        c.srcList!.push( src.slice(tmpEndPos,p.startPosition) );
        c.srcList!.push( ()=>getCurrent(p.moduleName,postMessage) );
        tmpEndPos = p.endPosition;
    });
    c.srcList.push( src.slice(tmpEndPos) ); 
};
const toStringCurrent =async (c:currentObj)=>{
    //console.log(new URL(import.meta.url).origin);
    if (c.url){
        return c.url;
    }
    if (!c.srcList){
        return new URL(c.name,new URL(import.meta.url).origin).toString();
    }
    let code ="";
    for (const src of c.srcList){ 
        if (typeof src ==="string"){
            code+=src;
        }else{
            const obj =await src();
            code += await obj.getUri();
            if (typeof obj !=="string" && obj.persons){
                obj.persons.add(c);
            }
        }
    };
    if (!code){
        //return c.name;
        return new URL(c.name,new URL(import.meta.url).origin).toString();
    }
    
    c.url = URL.createObjectURL(new Blob([code],{type:'application/javascript'}));
    //console.log(code);
    return c.url;  
};
const InitCurrentMap = (v:messageObj)=>{
    // v.code = decoder.decode(v.db)
    const cur = {
        persons:new Set<currentObj>(),
        getUri:async ()=>{
            return toStringCurrent(cur);            
        },        
        ...v
    } as currentObj;
    return cur;
};
export const delCurrentMsg = (name:string)=>{
    currentMap.delete(name);
};
export const cleanCurrentMsg = ()=>{
    currentMap.clear();
};
 
export const handleCurrentMsg =(message:messageObj,postMessage?:(e:any)=>void)=>{
    if (!message.name){         
        return;
    }  
    let cur:currentObj;
    if (!currentMap.has(message.name)){
        cur = InitCurrentMap(message);
        currentMap.set(message.name,cur);

    }else{
        cur = currentMap.get(message.name)!;        
    }
    reloadCurrent(cur,message,postMessage);
    if (waitGetMap.has(message.name)){
        waitGetMap.get(message.name)!(cur);  
    }
};
  const postSrcMsg = (solidConfig:sConfig,e:{ path?:string})=>{
      if (e.path){
        fetch( 
          e.path.replace(/^\.\//,`./${solidConfig.workermsg.src}/`) )
          .then(f=>{
            f.text().then(db=>{
              handleCurrentMsg({name:e.path,db},(e)=>{
                postSrcMsg(solidConfig,e)
            })
            })
          })
      }
  }
export const getCodeGz =async (solidConfig:sConfig)=>{
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
    const csgObj = await getCurrent("./lib/csgChange.js",(e)=>{
            postSrcMsg(solidConfig,e)
        });
    console.log("csg",csgObj)
    //handleCurrentMsg({name:indexName},postSrcMsg)
    const current =await getCurrent(indexName,(e)=>{
            postSrcMsg(solidConfig,e)
        })  
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
    const chunks = await stringToGzip(codeSrc)
    return new Blob(chunks, { type: 'application/gzip' });
}