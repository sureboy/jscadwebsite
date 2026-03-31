<!-- src/routes/+page.svelte -->
<script lang="ts" >
  import {codeFile} from '$lib/website/menuPanel'
  import CodeEditor ,{initEdit} from '$lib/website/CodeEditor.svelte';
  import {newPackageCode} from '$lib/website/LoadGzFile.svelte'
  import { onMount } from 'svelte';
  import {includeImport} from '$lib/function/utils'
  
  onMount(() => {
    let view:any = null
    if (window.location.hash){
      codeFile.title = window.location.hash.slice(1)
      codeFile.value = window.localStorage.getItem(codeFile.title) || ""
      if (codeFile.value){
        codeFile.isLocal=true
        view =initEdit()
      }else{
        const [p,n]= codeFile.title.split("*")
        //includeImport[n] || n
        const fn = includeImport[n]
        if (fn){
          fetch(new URL(
            fn ,
            new URL(import.meta.url).origin).toString()).then(res=>{
              if (!res.ok){
                codeFile.value = newPackageCode
                return
              }
              res.text().then(db=>{
                console.log(db)
                codeFile.value = db
                view = initEdit()
              })
            }
          ).catch(e=>{
            console.error(e)
            codeFile.value = `/**
${newPackageCode}
**/`
            view = initEdit()
          }) 
        }else{
          codeFile.value = `/**
${newPackageCode}
**/`
          view = initEdit()
        }
        
      }
    }
    console.log(window.location.hash)
    //runCode();
    return ()=>{
      if (view){
        view.destroy()
      }
    }
  });
  
</script>
  <svelte:head><title>{codeFile.title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1, height=device-height, user-scalable=yes">
</svelte:head>
<CodeEditor  />
