<script lang="ts">

//import libdata from '/assets/data.json' assert { type: 'json' };
import type { PageProps } from './$types';
import List from '$lib/website/List.svelte'
import type {itemType} from '$lib/website/List.svelte'
let { data }: PageProps = $props();


</script> 
<div style="display: block; padding-left: 10px;">
<h1>Examples</h1>
    <List list={data.list.map(l =>{
        (l as itemType).del=()=>{
           if (!window.confirm(`delete ${l.url}?`)){
                    return;
                }
                fetch("/admin?del="+l.url,{
                    headers: {
                        'Content-Type': 'application/json',
                    }}).then(r=>{
                    if (!r.ok){
                        return;
                    }
                    r.json().then(db=>{
                        console.log(db)
                        if (db.msg){
                            window.location.reload();
                        }
                    })
                })
        }
        return l
    })} ></List>
<h1>Temp</h1>
<List list={data.newList.map(l=>{
    l.del = ()=>{
                //console.log(e)
                if (!window.confirm(`delete ${l.url}?`)){
                    return;
                }
                fetch("/admin?k="+l.url,{
                    headers: {
                        'Content-Type': 'application/json',
                    }}).then(r=>{
                    if (!r.ok){
                        return;
                    }
                    r.json().then(db=>{
                        console.log(db)
                        if (db.msg){
                            window.location.reload();
                        }
                    })
                })
            }
    l.save = ()=>{
                fetch("/admin",{
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method:"POST",body:JSON.stringify(l)}).then(r=>{
                    if (!r.ok)
                        return;
                    r.json().then(db=>{
                        console.log(db)
                        if (db.msg){
                           window.location.reload();
                        }
                    })
                })
            }
    return l
})} ></List>
</div>
 