<script lang="ts">
import db from '$lib/assets/data.json' assert { type: 'json' }; 
import List from '$lib/List.svelte' 
import type {itemType} from '$lib/List.svelte'
import {myStorage} from '$lib/function/localdb'

const getLocalDBList =async ()=>{
    const localList =[] as itemType[]
    const items = db.list.map(l=>l.url) as string[]
    (await myStorage.keys()).forEach((v:string)=>{
        if (!items.includes(v)){
            localList.push({title:v,url:v}) 
        }
    })
    return localList
}
</script> 
<div style="display: block; padding-left: 10px;">
<h1>Examples</h1>
<List list={db.list} ></List>
{#await getLocalDBList() then localList}
<h1>Local</h1>
   <List list={localList} ></List>  
{/await}
</div>