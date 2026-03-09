<script lang="ts">

//import libdata from '/assets/data.json' assert { type: 'json' };
import type { PageProps } from './$types';
import List from '$lib/List.svelte'
let { data }: PageProps = $props();


</script> 
<div style="display: block; padding-left: 10px;">
<h1>Examples</h1>
    <List list={data.list} ></List>
<h1>Temp</h1>
<List list={data.newList} ></List>
</div>
 