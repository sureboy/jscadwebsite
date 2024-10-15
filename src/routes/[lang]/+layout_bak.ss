<script lang="ts">
    import { t, locales, locale } from '$lib/translations';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
  import { Select } from 'flowbite-svelte';
   
  
   // const count = writable(2);
  
    $: ({ route } = $page.data);
console.log($locales, $locale )
  </script>
  
  <a href="/{$locale}">{$t('menu.home')}</a>
  <a href="/{$locale}/about">{$t('menu.about')}</a>
  <br/>
  <br/>
  
  <hr />
  <slot />
  <br />
  <br />
  <br />
  <br />
  <select on:change={(e) => {
   // console.log($page.data)
    
        goto(e.target?.value)
    
    

    }
  }>
    {#each $locales as lc}
      <option value="/{lc}{route}" selected="{lc === $locale}">{$t(`lang.${lc}`)}</option>
    {/each}
  </select>