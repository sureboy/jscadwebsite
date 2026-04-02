import type { RequestHandler } from './$types';  
import {kvdbGet} from '$lib/website/kvdb'
import { error } from '@sveltejs/kit';
import {getMinDateTime} from '$lib/function/utils'
export const GET:RequestHandler=async (e) => {
    //e.platform?.env.solidtmp
    const k = e.url.searchParams.get("k")
    if (!k){
        error(404);
        return;
    }
    const t = parseInt(k,36)
    const now =  Date.now()
    if (t >now  || t<getMinDateTime(now ) ){
      error(404);
        return;
    }
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