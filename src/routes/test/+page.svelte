<script lang="ts">
import {IndexedDBStorage} from "$lib/function/IndexedDBStorage"
import { onMount } from 'svelte'; 
 
onMount(()=>{
    const myStorage = new IndexedDBStorage('solidjscad', 'gzfile', 1);
    //myStorage.
    myStorage.put("t1",{obj:true}).then(()=>{
        console.log("put ok")
        myStorage.get("t1").then(v=>{
            console.log(v)
        })
    })

})
</script>