import type { PageServerLoad } from './$types';  
import {kvdbList} from '$lib/function/kvdb'
import db from '$lib/assets/data.json' assert { type: 'json' }; 
const items = db.list.map(l=>l.url.split(".")[0])
export const load: PageServerLoad = async ({ params,url,platform }) => { 
    const list:any[] = [...db.list]
    for await (const key of kvdbList() ) {
        //console.log(key.name);
        if (!items.includes(key.name)){
            //console.log(key.name);
            list.push(Object.assign(key.metadata||{},{
                expiration:key.expiration||undefined,
                url: key.name,
                update: parseInt(key.name,32) ,
                save:true}))
        }
    } 
    return {list};
};
