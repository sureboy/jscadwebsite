import type { RequestHandler } from './$types'; 
import { json,error } from '@sveltejs/kit';
import {kvdbGet,kvdbDel} from '$lib/function/kvdb'
import * as fs from "fs"
import * as path from "path"
import listdb from '$lib/assets/data.json' assert { type: 'json' }; 
import type {itemType} from '$lib/List.svelte'
export const POST:RequestHandler=async (e) => {
    const db = (await e.request.json()) as itemType
    //console.log(db,process.cwd()) 
    (listdb.list as itemType[]).push(db)
    db.save = false
    db.img = ""
    
    const kvdb = await kvdbGet(db.url)
    db.url = `${db.title||db.url}.solidjscad.gz` 
    const bufdb = Buffer.from(await kvdb.arrayBuffer())
    fs.writeFileSync(path.join(process.cwd(),"static","assets",db.url),bufdb,  {encoding:'binary'}  )
    fs.writeFileSync(path.join(process.cwd(),"src","lib","assets","data.json"),JSON.stringify(listdb, null, 2) ,'utf8')
    return json({msg:"ok"})
}

export const GET:RequestHandler = async (e)=>{
    const k = e.url.searchParams.get("k")
    if (!k){
        error(404);
        return;
    }
    //await kvdbDel(k)
    return json({msg:"ok",db:await kvdbDel(k)})
}