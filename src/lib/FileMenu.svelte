<script lang="ts">
    import modeling from '@jscad/modeling';
    import type {windowConfigType,sConfig} from "./function/utils"
    import LoadGzFile ,{mySolidConfig,cleanSolidConfig}  from "./LoadGzFile.svelte";
    import {currentMap}  from "./function/ImportParser"
    //import { onMount } from 'svelte';
    import {CodeWorker} from "./function/worker"
    const { myConfig,solidConfig }: { myConfig: windowConfigType,solidConfig:sConfig } = $props(); 
    const showCaptchaCode = (captchaCode:any[] )=>{
        const lineCorner = modeling.primitives.circle({ radius: 1 })
        const lineSegments:any = []
        captchaCode.forEach((segmentPoints:any) => { // process the line segment
            const corners = segmentPoints.map((point:any) => modeling.transforms.translate(point, lineCorner))
            lineSegments.push(modeling.hulls.hullChain(corners))
        })
        return lineSegments
     
    }
</script>
{#if solidConfig.showMenu!==0}
<details    >
    <summary  style="cursor: pointer;height:48px;text-align: left;line-height: 48px;"  >
        {mySolidConfig.getP()}
    </summary>
    <div  style="color:white;text-align: center;" id="module_list"> 
        {#each currentMap as [f] }
        <a class="btn"  href="/edit#{mySolidConfig.getPathX()+f}" target="_blank"   >  {f}</a>  
        {/each}
        <a class="btn"  href="/edit#{mySolidConfig.configName()}" target="_blank"   >  {mySolidConfig.name}</a>
        <button onclick={(e)=>{
            console.log(e)
            if (!window.confirm(`The current data will be clean!!`)){
                return;
            } 
            cleanSolidConfig(myConfig.files)
        }}>✖</button>
        <button onclick={()=>{
            if (!confirm(`Publicize ${mySolidConfig.getP()}?`))return
            fetch("/code").then(r=>{
                if (!r.ok)return
                r.json().then(db=>{
                    console.log(db)
                    CodeWorker(solidConfig,showCaptchaCode(db.code))
                    setTimeout(() => {
                        const code = prompt("输入验证码")
                        if (!code)return
                        console.log(code)
                        let url = "db.solidjscad.cn"
                        if (window.location.host.endsWith("com")){
                            url = "db.solidjscad.com"
                        }
                        //if (window.location.host.startsw ("solidjscad")){
                        fetch(`//${url}?code=${code}&key=${db.key}`).then(r=>{
                            if (!r.ok)return
                            r.json().then(db=>{
                                console.log(db)
                            })
                        })
                    }, 1000);
                    
                   
                })
            })

/*
            //console.log(window.location.host)
            let url = "db.solidjscad.cn"
            if (window.location.host.startsWith("solidjscad")){
                url = "db."+window.location.host
            }
            console.log(url)
            fetch(`//${url}?k=test`).then(r=>{
                //console.log(v)
                if (!r.ok)return
                console.log(r.headers)
                r.json().then(db=>{
                    console.log(db)
                    CodeWorker(solidConfig,db)
                    const code = prompt("输入验证码")
                    if (!code)return
                    console.log(code)
                })
                
            })
*/
            
        }}>⬆️📁</button>
    </div> 
    <div  style="color:white;text-align: center;" id="module_list"> 
        <LoadGzFile {myConfig} {solidConfig}></LoadGzFile>
    </div> 
</details>

{:else}
<LoadGzFile {myConfig} {solidConfig}></LoadGzFile>
{/if}
 <style>
 
.btn {
    cursor: pointer;
    padding-left: 10px;
    padding-right: 10px;
    color: white;
    display: inline-block;
}

.btn:active {
    color:gray;
    transform: translateY(-1px);
    transition: all 0.1s;
}
 
.btn:hover {
    color:whitesmoke; 
}
 </style>