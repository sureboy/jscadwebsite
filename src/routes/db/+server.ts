import type { RequestHandler } from './$types';  
import {kvdbGet} from '$lib/function/kvdb'
 
export const GET:RequestHandler=async (e) => {
    //e.platform?.env.solidtmp
    const k = e.url.searchParams.get("k")
    let value:ArrayBuffer
    if (e.platform && e.platform.env.solidtmp){
        value = await e.platform.env.solidtmp.get(k,"arrayBuffer")
        //console.log("solidtmp")
    }else{
        const kvdb= await kvdbGet(k)
        value =await kvdb.arrayBuffer()
        //console.log("api")
    }
    const blob = new Blob([value], { type: 'application/gzip' });

    return new Response(blob, {
        headers: {
        'Content-Type': 'application/gzip'
        }
    });
}