<script lang="ts">
import type { sConfig } from '../function/utils'; 
import {getRemoteUrl} from '../function/utils'

const { solidConfig }:{ solidConfig?:sConfig} = $props();
const helpTip = [
    "请误微信扫码，以免财产损失",
    "Sponsor my coffee! WeChat",
    "SolidJSCAD is cool!"
]
const getRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];
</script>
{#if (solidConfig?.showAd)}
<p>{getRandomElement(helpTip)}</p>
<p><img src="{getRemoteUrl(solidConfig?.isVscode?solidConfig.workermsg.windowConfig.serverIP:undefined)}wxq.jpeg" alt="qr" width="150" /></p>
{/if}