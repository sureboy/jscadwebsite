<script lang="ts" module>
let menu:HTMLElement
let tmpDiv:HTMLButtonElement 
let solidName:HTMLElement;
export const moduleInit = (modulelist:{list:string[],basename:string} )=>{
    menu.innerHTML="" 
    solidName.textContent = modulelist.basename 
    //console.log("change Main name",solidName)
    modulelist.list.forEach(m=>{
       const div = tmpDiv.cloneNode(true)
       div.textContent = m;
       menu.appendChild(div)
    }) 
}
</script>
<script lang="ts" > 
  let {Clickhandle}:{Clickhandle:(name:string)=>void} = $props()
</script>
 
<details    >
    <summary bind:this={solidName} style="cursor: pointer;height:48px;text-align: left;line-height: 48px;"  >
...
</summary>
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div  style="color:white;text-align: center;" id="module_list" bind:this={menu}    onclick="{(e)=>{
  const button = (e.target  as HTMLInputElement).closest('button');
      //console.log(button.textContent)
      if (button.textContent==="..."){
        return;
      } 
      //solidName="...."
      //solidName = button.textContent
      solidName.textContent =button.textContent;
      Clickhandle(button.textContent);
}}" > 
  <button bind:this={tmpDiv}  style="height:48:px;line-height:48px;cursor: pointer;" >
    ...
  </button> 
</div> 
</details>
 