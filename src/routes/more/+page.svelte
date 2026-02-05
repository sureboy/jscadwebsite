<script lang="ts">
import db from '$lib/assets/data.json' assert { type: 'json' }; 
import List from '$lib/List.svelte'
</script> 
<List list={db.list} ></List>