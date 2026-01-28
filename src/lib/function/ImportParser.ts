//import type { sConfig } from './utils';
import {regexExec} from './utils';
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
//const includeImport = (window as any).includeImport;
/*
Object.keys(includeImport).forEach(k=>{
    currentMap.set(k,{
         
        persons:new Set<currentObj>(),
        name:k,
        getUri:async ()=>{return includeImport[k];}});
});
 */
//console.log(includeImportKeys);

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
/*
const fetchCurrent =async (name:string,src:string,children:Map<string,currentObj>)=>{
    
    if (children.has(name)){
        return children.get(name)
    }
    
    const cur = InitCurrentMap({name})
    children.set(name,cur)
    const srcFile = await fetch( name.replace(/^\.\//,`./${src}/`) )
    reloadCurrent(cur,{
                name ,
                db:await srcFile.text()},
                (e:{type:string,path?:string})=>{
                    fetchCurrent(e.path,src,children)
                    if (e.path){
                        if (!children.has(e.path)) {
                            getCurrentCodeSrc(solidConfig,InitCurrentMap({name:e.path}),back,children)
                        }
                        
                    }
                    
                }
            ) 
}

export const getCurrentCodeSrc =async ( solidConfig:sConfig,src:currentObj,back:(name:string,code:string)=>void,children = new Map<string,currentObj>()) => {
    let code = ""; 
    const waitList = []
    
    if (!src.srcList){
        

        try{
        
            
             //const   reloadCur =  async(cur:currentObj) => {
                const srcFile = await fetch( src.name.replace(/^\.\//,`./${solidConfig.workermsg.src}/`) )
                reloadCurrent(src,{
                    name:src.name,
                    db:await srcFile.text()},
                    (e:{type:string,path?:string})=>{
                        if (e.path){
                            if (!children.has(e.path)) {
                             // reloadCur(InitCurrentMap({name:e.path}))
                             waitList.push(getCurrentCodeSrc(solidConfig,InitCurrentMap({name:e.path}),back,children))
                            }
                            
                        }
                        
                    }
                ) 
            //}
            //await reloadCur(src)
            //console.log("srclist",src.srcList)
            //await getCurrentCodeSrc(solidConfig,src,back,children)

        }catch(e){
            console.error(e)
            return
        }
        //return;
    }
    console.log("getSrc",src.name) 
    children.set(src.name,src);
    for (const _src of src.srcList){
 
        if (typeof _src ==="string"){
            code+=_src;
            continue;
        }
        const ___src =await _src(); 
        //if (!___src.name)console.log(___src);
        if (___src.db){ 
            if (!children.has(___src.name)) {
                await getCurrentCodeSrc(solidConfig,___src,back,children);
            }
            //code+= "./" + ___src.name;   
        }//else{
            code+=  ___src.name;      
        //}    
        
        
    };
    await Promise.all(waitList)
    if (code){
        //console.log(code);
        back(src.name,code);
    }
    
    return
};
//const encoder = new TextEncoder();
 */
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
