<script lang="ts">
import db from '$lib/assets/data.json' assert { type: 'json' }; 
import List from '$lib/website/List.svelte' 
import type {itemType} from '$lib/website/List.svelte'
import {myStorage} from '$lib/website/localdb'
import {imgStorage} from '$lib/website/localImg'
import ShowAds from '$lib/components/ShowAds.svelte'; 
const getLocalDBList =async ()=>{
    const localList =[] as itemType[]
    //const items = db.list.map(l=>l.url) as string[]
    (await myStorage.keys()).forEach((v:string)=>{
        //if (!items.includes(v)){
            localList.push({title:v,url:v,del:()=>{
                if (!window.confirm("delete "+v))return;
                myStorage.del(v)
                imgStorage.del(v)
                window.location.reload();
            }}) 
        //}
    })
    return localList
}
</script> 
<svelte:head>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4370679297888448"
     crossorigin="anonymous"></script>
</svelte:head>
<div style="display: block; padding:25px 5px 5px 5px;">
<List list={[
    {
        title:"帮助文档",
        url:"/docs/",
        img:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTIwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCI+CiAgPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjEwMCIgeD0iMTAiIHk9IjEwIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiNjY2NjY2MiIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiIC8+CiAgPHBhdGggZD0iTTcwIDEwIEw3MCAzMCBMOTAgMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiAvPgogIDxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSIxMCIgeD0iMjAiIHk9IjMwIiBmaWxsPSIjZTBlMGUwIiByeD0iMiIgLz4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iMTAiIHg9IjIwIiB5PSI0NSIgZmlsbD0iI2UwZTBlMCIgcng9IjIiIC8+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjEwIiB4PSIyMCIgeT0iNjAiIGZpbGw9IiNlMGUwZTAiIHJ4PSIyIiAvPgogIDx0ZXh0IHg9IjUwIiB5PSI5MCIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NjY2NiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkRPQzwvdGV4dD4KPC9zdmc+"
    },
    {
        title:"开始",
        url:"/",
        img:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+CiAgPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQ4IiB4PSIyMCIgeT0iMjAiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzMzMyIgcng9IjQiIHJ5PSI0IiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNjAiIHI9IjUiIGZpbGw9IiM1NTUiLz4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNCIgeD0iMzAiIHk9IjQ4IiBmaWxsPSIjY2NjIiByeD0iMiIvPgogIDxjaXJjbGUgY3g9Ijc1IiBjeT0iNzAiIHI9IjEwIiBmaWxsPSIjNGNhZjUwIiBzdHJva2U9IiMzMzkiLz4KICA8cG9seWdvbiBwb2ludHM9IjcyLDcwIDc4LDcwIDc1LDY0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg=="
    },
    {
        title:"新建",
        url:"new",
        img:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+CiAgPHBvbHlsaW5lIHBvaW50cz0iMjAsNDAgMjAsMjAgNDAsMjAiIHN0cm9rZT0iIzQ0NCIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8cmVjdCB4PSIxNSIgeT0iMjUiIHdpZHRoPSI3MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjNDQ0IiBzdHJva2Utd2lkdGg9IjEuNSIgcng9IjQiLz4KICA8Y2lyY2xlIGN4PSI3NSIgY3k9IjUwIiByPSIxMiIgZmlsbD0iIzRjYWY1MCIgc3Ryb2tlPSIjMzM5IiBzdHJva2Utd2lkdGg9IjEuMiIvPgogIDxwYXRoIGQ9Ik03MiA1MCBMNzggNTAgTTc1IDQ3IEw3NSA1MyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPHJlY3QgeD0iMzAiIHk9IjQwIiB3aWR0aD0iMzAiIGhlaWdodD0iNCIgZmlsbD0iI2UwZTBlMCIgcng9IjIiLz4KICA8cmVjdCB4PSIzMCIgeT0iNTUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0IiBmaWxsPSIjZTBlMGUwIiByeD0iMiIvPgogIDxyZWN0IHg9IjMwIiB5PSI3MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjQiIGZpbGw9IiNlMGUwZTAiIHJ4PSIyIi8+Cjwvc3ZnPg=="
    }
]}></List>

<List list={db.list} ></List>
{#await getLocalDBList() then localList}
<h1>Local</h1>
   <List list={localList} ></List>  
{/await}
<ShowAds ></ShowAds>
</div>