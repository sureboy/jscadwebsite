import type { RequestHandler } from './$types'; 
import { json,error } from '@sveltejs/kit';
import {kvdbGet,kvdbDel} from '$lib/website/kvdb'
import * as fs from "fs"
import * as path from "path"
import listdb from '$lib/assets/data.json' assert { type: 'json' }; 
import type {itemType} from '$lib/website/List.svelte'
export const POST:RequestHandler=async (e) => {
    const db = (await e.request.json()) as itemType 
    (listdb.list as itemType[]).push(db) 
    const kvdb = await kvdbGet(db.url)
    db.title =  `${db.title||db.url}.solidjscad.gz` 
    const bufdb = Buffer.from(await kvdb.arrayBuffer())
    fs.writeFileSync(path.join(process.cwd(),"static","assets",db.url),bufdb,  {encoding:'binary'}  )
    fs.writeFileSync(path.join(process.cwd(),"src","lib","assets","data.json"),JSON.stringify(listdb, null, 2) ,'utf8')
    return json({msg:"ok"})
}

export const GET:RequestHandler = async (e)=>{
    const k = e.url.searchParams.get("k")
    if (!k){
        const del = e.url.searchParams.get("del")
        if (del){
            listdb.list = listdb.list.filter(l=>{
                if (l.url===del){
                    fs.rmSync(path.join(process.cwd(),"static","assets",l.url))
                    return false
                }else{
                    return true
                }
                               //return l.title !==del
            })
        fs.writeFileSync(path.join(process.cwd(),"src","lib","assets","data.json"),JSON.stringify(listdb, null, 2) ,'utf8')
            return json({msg:"ok" })
        }
        error(404);
        return;
    }
    //await kvdbDel(k)
    return json({msg:"ok",db:await kvdbDel(k)})
}