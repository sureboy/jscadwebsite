import type { PageServerLoad } from './$types'; 
import db from '$lib/assets/data.json' assert { type: 'json' }; 

 
export const load: PageServerLoad = async ({ params,url }) => {
   
    
    
    let uri = "https://db.solidjscad.cn?list=1"
    const cursor = url.searchParams.get("cursor")
    if (cursor){
        uri +="&cursor="+cursor
    }
    const r = await fetch(uri) 
    if (!r.ok){
        return {msg:"nothing"}
    }
    const _db =await  r.json() as {cacheStatus?:any,keys?:{name:string,expiration?:number,metadata?:any}[],list_complete:boolean,cursor:string}
    const items = db.list.map(l=>l.title)
    _db.keys.forEach(v=>{
        if (!items.includes(v.name))
        db.list.push({title:v.name,img:""})
    })
    return {db:db};
};