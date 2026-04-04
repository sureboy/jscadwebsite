<script lang="ts">
import db from '$lib/assets/data.json' assert { type: 'json' }; 
import List from '$lib/website/List.svelte' 
import type {itemType} from '$lib/website/List.svelte'
import {myStorage} from '$lib/website/localdb'
import {imgStorage} from '$lib/website/localImg'
import ShowAds from '$lib/components/ShowAds.svelte'; 
  import NavMenu from '$lib/website/NavMenu.svelte';
    import Footer from '$lib/website/Footer.svelte';
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
 
</svelte:head>
<div style="display: block;  "> 
<NavMenu />

<div style=" padding:25px 5px 5px 5px;"> 
<div><h1>SolidJScad </h1>
   
<p> 高性能几何内核 + 模块化编程 + 完整工具链。
从浏览器在线编辑到本地 IDE 插件，让实体建模如编写 JavaScript 一样自然。</p> 
 <p>在 VS Code 扩展商店中搜索 SolidJSCAD ,
    <a href="https://marketplace.visualstudio.com/items?itemName=WeijieZhao.solidjscad" rel="noopener noreferrer" target="_blank">安装 VSCode 插件</a>
,开始本地化建模创作。
</p>
</div>
<h1>实例</h1>
<List list={db.list} ></List>
{#await getLocalDBList() then localList}
{#if localList}
<h1>本地模型</h1>
   <List list={localList} ></List>  
   {/if}
{/await}
<ShowAds ></ShowAds>
</div>

<Footer></Footer> 
</div>