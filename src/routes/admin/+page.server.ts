import type { PageServerLoad } from './$types';  
import {kvdbList} from '$lib/function/kvdb'
import db from '$lib/assets/data.json' assert { type: 'json' }; 
const items = db.list.map(l=>l.update)
export const load: PageServerLoad = async ({ params,url,platform }) => { 
    const newList:any[] = []
    for await (const key of kvdbList() ) {
        //console.log(key.name);
        const update = parseInt(key.name,32)
        if (!items.includes(update)){
            //console.log(key.name);
            newList.push(Object.assign(key.metadata||{},{
                expiration:key.expiration||undefined,
                url: key.name,
                update  ,
                save:true}))
        }else{
            console.log("same",key)
        }
    }  
    return {list:db.list,newList};
};
