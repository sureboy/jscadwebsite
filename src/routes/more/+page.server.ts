import type { PageServerLoad } from './$types'; 
import {list} from '$lib/function/kvdb'
import db from '$lib/assets/data.json' assert { type: 'json' }; 
 
export const load: PageServerLoad = async ({ params,url,platform }) => {
   
    
    //const _db  = await platform.env.solidtmp.list()
    /*
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
    */
    const items = db.list.map(l=>l.title)
   //const req = list()
   //(await req).getNextPage
   const opt:{cursor?:string} = {}
   const cursor = url.searchParams.get("cursor")
    if (cursor){
        opt.cursor = cursor// +="&cursor="+cursor
    }
    const _db =await platform.env.solidtmp.list(opt)
    _db.keys.forEach(key=>{
        if (!items.includes(key.name)){
            db.list.push({title:key.name,img:""})
        }
    })
    //for await (const key of list() ) {
        //console.log(key.name);
        
    //}
    //(await req).hasNextPage()
    return {db:db};
};