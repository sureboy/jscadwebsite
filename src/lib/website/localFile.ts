import {currentMap,getCurrentCode}  from "../function/ImportParser"
import type {currentObj} from "../function/ImportParser"

export function  *getFileList(){ 
    const list = new Set<currentObj>()
    let path = ""
    if (window.localStorage.length>0){
        for (let i=0;i<window.localStorage.length;i++){
            const k = window.localStorage.key(i)
            if (k){
                const [p,name] = k.split("*") 
                if (!path)path = p
                if (currentMap.has(name))
                    list.add(currentMap.get(name))
                yield  [k,name]
            }
        }
    }
    for (const [p,c] of currentMap){
        console.log("show files",p)
        if (!list.has(c)){
            const k = path+"*"+p
            getCurrentCode(c,(name,code)=>{
                window.localStorage.setItem(path+"*"+name,code)
            },list)
            yield  [k,p]
        }
    }

}