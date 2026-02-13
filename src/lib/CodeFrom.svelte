<script lang="ts">
import QRCode from 'qrcode';
import modeling from '@jscad/modeling'; 
import { currentLocalDBConfig,getCodeGz } from "./function/localdb";
import type { sConfig } from './function/utils';
import {CodeWorker} from "./function/worker" 
const { solidConfig }:{ solidConfig:sConfig} = $props();
let showInputCode:{
    key?:string,
    QRUrl?:string,
     code?:string,email?:string,
     //expiration?:string,
    url?:string
} = $state({})
const getMinDateTime = ()=>{
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    console.log(now.toISOString() )
    return now.toISOString().slice(0, 16);
}
const showCaptchaCode = (captchaCode:any[] )=>{
    const lineCorner = modeling.primitives.circle({ radius: 1 })
    const lineSegments:any = []
    captchaCode.forEach((segmentPoints:any) => { // process the line segment
        const corners = segmentPoints.map(
        (point:any) => modeling.transforms.translate(point, lineCorner))
        lineSegments.push(modeling.hulls.hullChain(corners))
    })
    return lineSegments
}
const uploadCodeClick = ()=>{
    //console.log(Date.now().toString(36))
    if (!confirm(`warning!!! The [${currentLocalDBConfig.path}] will be uploaded to the server cloud.`))return
    fetch(`/code?${Date.now().toString()}`).then(r=>{
      if (!r.ok)return
      r.json().then(db=>{
        //console.log(db)
        CodeWorker(solidConfig,showCaptchaCode(db.code))
        showInputCode.key = db.key 
      })
    }) 
}
const ISOToTimestamp = (expiration:string)=>{
    return expiration?Math.floor(Date.parse(expiration)/1000).toString():"";
}

const checkInputCode =async ( )=>{  
    //showInputCode.expiration

    const u = new URLSearchParams({
        code:showInputCode.code,
        //expiration:ISOToTimestamp(showInputCode.expiration ) ,
        key:showInputCode.key,
        email:showInputCode.email||"",
        title:`${solidConfig.workermsg.func}_${solidConfig.workermsg.in}_${solidConfig.workermsg.name}`
    })
    showInputCode.key=""
    fetch(`/code?${u}`,{
    method: "POST",body:await getCodeGz(solidConfig) }).then(r=>{
        if (!r.ok)return
        r.json().then(db=>{
        if (!db.k){
          alert(JSON.stringify(db))
          return
        }
        showInputCode.url =`${window.location.protocol}//${window.location.host}#${db.k}`
        QRCode.toDataURL(showInputCode.url, {
          width: 200, 
          color: {
            dark: '#3b82f6',
            light: '#ffffff'
          }
        }).then(qrDataUrl=>{
          showInputCode.QRUrl = qrDataUrl
          //showInputCode.key = ""
        });
        console.log(db)
      })
    }).finally(()=>{
      showInputCode.code=""
      showInputCode.email=""
      //showInputCode.expiration=""
      
    })
  }
</script>
 <button  style="height:48:px;line-height:48px;cursor: pointer;" onclick={uploadCodeClick}>Share</button> 
 {#if showInputCode.key}
 <!-- A11y: <div> with click handler must have an ARIA role -->
 <div role="button" tabindex="0" 
  aria-label="code check"  onkeydown={(e)=>{
  if (e.key==="Enter" && showInputCode.code && showInputCode.code.length===8){
    checkInputCode()
}
 }}>
  <p><label>Code:
  <input maxlength="8" 
      type="text"
      bind:value={showInputCode.code}   
      placeholder="Input Code"     ></label>
  </p>
  <p>
    <label>Email: <input type="email" bind:value={showInputCode.email} placeholder="dimon@solidjscad.com" /> </label>
  </p>
  <p><button onclick={(e)=>{
    if (showInputCode.code && showInputCode.code.length===8)
      checkInputCode()
  }} >submit</button></p>
</div>
{/if}
{#if showInputCode.url}
<p><a style="color:white" href={showInputCode.url} target="_blank" >{showInputCode.url}</a></p>
{/if}
{#if showInputCode.QRUrl}
<p><img src="{showInputCode.QRUrl}" alt="qr" /></p>

{/if}
