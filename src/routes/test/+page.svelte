<script lang="ts">
import {IndexedDBStorage} from "$lib/function/IndexedDBStorage"
import { onMount } from 'svelte'; 
 
onMount(()=>{
    const myStorage = new IndexedDBStorage('solidjscad', 'gzfile', 1);
    //myStorage.

})
</script>