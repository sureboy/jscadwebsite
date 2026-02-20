 
import {  regexExec } from "./utils"; 
export type messageObj = {
    name:string,
    db?:ArrayBuffer | string | any
}
type currentObj = { 
    url?:string;
    persons:Set<currentObj>;
    srcList:((()=>Promise<currentObj> )|string)[]
    getUri:()=>Promise<string>;

} & messageObj
type importType = {
    moduleName:string,
    startPosition:number,
    endPosition:number,
    obj:currentObj,
}
export const currentMap = new Map<string,currentObj>();
const waitGetMap = new Map<string,(c:currentObj)=>void>();

const  importParser = (code:string)=> {
    const regex = /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)|import\s*\(?\s*['"]([^'"]+)/g;
    const imports:importType[] = [];
    regexExec(code,regex,(match,i)=>{ 
        const moduleName = match[1] || match[2] ;
        const quoteIndex = Math.max(
            match[0].indexOf("'"),
            match[0].indexOf('"')
        );
        const startPosition = match.index + quoteIndex + 1;        
        imports.push({
            moduleName:moduleName,//.trim(),
            startPosition: startPosition,
            endPosition: startPosition + moduleName.length,
        } as importType);
    });
    return imports;
};
 
export const getCurrentCode =async ( src:currentObj,back:(name:string,code:string)=>void,children = new Set<currentObj>()) => {
    let code = "";    
    children.add(src);
 
    for (const _src of src.srcList){ 
        if (typeof _src ==="string"){
            code+=_src;
            continue;
        }
        const ___src =await _src();
        if (___src.db){
            
            if (!children.has(___src)) {
               
                await getCurrentCode(___src,back,children);
            } 
        } 
        code+=  ___src.name;  
    };
    if (code){
        back(src.name,code);
    }
};
 
export const getCurrent = (name:string,reqMessage?:(e:{type:"req",path:string})=>void )=>{
    return new Promise<currentObj>((resolve, reject)=>{
        if (currentMap.has(name)){
            resolve(currentMap.get(name)!);
            return ;
        }
        if (!reqMessage ){
            console.log("not reqmsg",name);
            resolve(InitCurrentMap({name})); 
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
    let tmpEndPos:number = 0; 
    importParser(src).forEach(p=>{
        c.srcList!.push( src.slice(tmpEndPos,p.startPosition) );
        c.srcList!.push( ()=>getCurrent(p.moduleName,postMessage) );
        tmpEndPos = p.endPosition;
    });
    c.srcList.push( src.slice(tmpEndPos) ); 
};
const toStringCurrent = async (c:currentObj)=>{
    //console.log(new URL(import.meta.url).origin);
    if (c.url){
        return c.url;
    }
    if (c.srcList.length===0){
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
        srcList:[]   ,   
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
 
export const handleCurrentMsg =(
    message:messageObj,
    postMessage?:(e:any)=>void
)=>{
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
        waitGetMap.get(message.name)(cur);  
    }
};
