<script lang="ts">
import db from '$lib/assets/data.json' assert { type: 'json' }; 
import List from '$lib/website/List.svelte' 
import type {itemType} from '$lib/website/List.svelte'
import {myStorage} from '$lib/website/localdb'
import {imgStorage} from '$lib/website/localImg'
import ShowAds from '$lib/components/ShowAds.svelte'; 
const getLocalDBList =async ()=>{
    const localList =[] as itemType[]
    const items = db.list.map(l=>l.url) as string[]
    (await myStorage.keys()).forEach((v:string)=>{
        if (!items.includes(v)){
            localList.push({title:v,url:v,del:()=>{
                if (!window.confirm("delete "+v))return;
                myStorage.del(v)
                imgStorage.del(v)
                window.location.reload();
            }}) 
        }
    })
    return localList
}
</script> 
<svelte:head>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4370679297888448"
     crossorigin="anonymous"></script>
</svelte:head>
<div style="display: block; padding:5px 5px 5px 5px;">
<List list={[
    {
        title:"Documents",
        url:"/docs/",
        img:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCI+CiAgPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjEwMCIgeD0iMTAiIHk9IjEwIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiIC8+CiAgPHBhdGggZD0iTTcwIDEwIEw3MCAzMCBMOTAgMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogIDxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSIxMCIgeD0iMjAiIHk9IjMwIiBmaWxsPSIjZTBlMGUwIiByeD0iMiIgLz4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMTAiIHg9IjIwIiB5PSI0NSIgZmlsbD0iI2UwZTBlMCIgcng9IjIiIC8+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjEwIiB4PSIyMCIgeT0iNjAiIGZpbGw9IiNlMGUwZTAiIHJ4PSIyIiAvPgogIDx0ZXh0IHg9IjUwIiB5PSI5MCIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NjY2NiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkRPQzwvdGV4dD4KPC9zdmc+"
    },
    {
        title:"New",
        url:"new",
        img:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+CiAgPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjcwIiB4PSIyMCIgeT0iMTUiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzQ0NCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHJ4PSI0IiAvPgogIDxwYXRoIGQ9Ik02MCAxNSBMNjAgMzUgTDgwIDM1IiBmaWxsPSJub25lIiBzdHJva2U9IiM0NDQiIHN0cm9rZS13aWR0aD0iMS41IiAvPgogIDxjaXJjbGUgY3g9Ijc1IiBjeT0iMjAiIHI9IjgiIGZpbGw9IiM0Y2FmNTAiIHN0cm9rZT0iIzMzOSIgc3Ryb2tlLXdpZHRoPSIxLjIiIC8+CiAgPHBhdGggZD0iTTcyIDIwIEw3OCAyMCBNNzUgMTcgTDc1IDIzIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiAvPgogIDxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI4IiB4PSIzMCIgeT0iNDAiIGZpbGw9IiNlMGUwZTAiIHJ4PSIyIiAvPgogIDxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI4IiB4PSIzMCIgeT0iNTUiIGZpbGw9IiNlMGUwZTAiIHJ4PSIyIiAvPgogIDxyZWN0IHdpZHRoPSIyNSIgaGVpZ2h0PSI4IiB4PSIzMCIgeT0iNzAiIGZpbGw9IiNlMGUwZTAiIHJ4PSIyIiAvPgo8L3N2Zz4="
    }
]}></List>

<List list={db.list} ></List>
{#await getLocalDBList() then localList}
<h1>Local</h1>
   <List list={localList} ></List>  
{/await}
<ShowAds ></ShowAds>
</div>