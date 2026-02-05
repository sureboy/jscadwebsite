<script lang="ts">

//import libdata from '/assets/data.json' assert { type: 'json' };
import type { PageProps } from './$types';
import List from '$lib/List.svelte'
let { data }: PageProps = $props();
 

</script> 
<List list={data.db.list} ></List>