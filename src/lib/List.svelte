<script lang="ts">

//import libdata from '/assets/data.json' assert { type: 'json' };
//import type { PageProps } from './$types';
let { list }: { list:{img?:string,title:string,metadata:string,save?:boolean}[]}  = $props();
 

</script>
<svelte:head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>
 
<div class="gallery"> 
{#each  list as item,k }
 <figure  >
    {#if item.img}
    <img src={item.img} alt="{item.title}" width="800" height="600"/>
    {/if}
    <figcaption>
        <h3>{item.title}</h3>
        <p>{item.metadata}</p>
        <a href="/#{item.title}" target="_blank" >查看</a>
        {#if item.save}
            <button  onclick={(e)=>{

            }}>save</button>
        {/if}
    </figcaption>
</figure>
{/each} 
</div>
 
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
        
    
    /* 图片网格布局 - 使用CSS Grid，原生支持 */
    .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
        max-width: 1400px;
        margin-left: auto;
        margin-right: auto;
    }
    
    figure {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }
    
    figure:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
    
    img {
        width: 100%;
        height: 250px;
        object-fit: cover;
        display: block;
        border-bottom: 1px solid #eee;
    }
    
    figcaption {
        padding: 15px;
        text-align: center;
    }
    
    figcaption h3 {
        margin-bottom: 8px;
        color: #2c3e50;
    }
    
    figcaption p {
        color: #666;
        font-size: 0.9rem;
    }
    
        
    
    /* 响应式设计 */
    @media (max-width: 768px) {
        .gallery {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
        
        
    }
    
    @media (max-width: 480px) {
        .gallery {
            grid-template-columns: 1fr;
        }
        
        
    }
</style>