import type { RequestHandler } from './$types'; 
import { json } from '@sveltejs/kit';
import {kvdbGet} from '$lib/function/kvdb'
import * as fs from "fs"
import * as path from "path"
import listdb from '$lib/assets/data.json' assert { type: 'json' }; 
export const POST:RequestHandler=async (e) => {
    const db = (await e.request.json()) as {update:number,save:boolean,url:string,title?:string,email?:string,expiration?:number}
    //console.log(db,process.cwd())
    listdb.list.push(db)
    db.save = false
    
    const kvdb = await kvdbGet(db.url)
    db.url = `${db.title||db.url}.solidjscad.gz`
    //console.log(db.url)
    //const gun = zlib.gunzipSync()
    //console.log(new TextDecoder('utf-8').decode(zlib.gunzipSync(await kvdb.arrayBuffer())))
    //const f = new Blob([buf],{ type: 'application/gzip' })
    
    const bufdb = Buffer.from(await kvdb.arrayBuffer())
    fs.writeFileSync(path.join(process.cwd(),"static","assets",db.url),bufdb,  {encoding:'binary'}  )
    fs.writeFileSync(path.join(process.cwd(),"src","lib","assets","data.json"),JSON.stringify(listdb, null, 2) ,'utf8')
    return json({msg:"ok"})
}