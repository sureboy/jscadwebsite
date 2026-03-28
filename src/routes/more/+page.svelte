<script lang="ts">
import db from '$lib/assets/data.json' assert { type: 'json' }; 
import List from '$lib/website/List.svelte' 
import type {itemType} from '$lib/website/List.svelte'
import {myStorage} from '$lib/website/localdb'
import ShowAds from '$lib/components/ShowAds.svelte'; 
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
<svelte:head>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4370679297888448"
     crossorigin="anonymous"></script>
</svelte:head>
<div style="display: block; padding-left: 10px;">
<h2><a style="color:white;" href="/docs/"  >Documents</a></h2>
<List list={db.list} ></List>
{#await getLocalDBList() then localList}
<h1>Local</h1>
   <List list={localList} ></List>  
{/await}
<ShowAds ></ShowAds>
</div>