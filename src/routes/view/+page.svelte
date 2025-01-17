<script lang="ts">
import { Navbar,ButtonGroup,Button,Range, Label,Spinner } from 'flowbite-svelte';
import { GridPlusOutline} from 'flowbite-svelte-icons';
import { onMount } from 'svelte'; 
import {GCodeRenderer,Color,LineColorizer} from "$lib/gcodeViewer/index"

let Layer = 0
let LayerOld = Layer
let LayerMax = 0
let renderer:GCodeRenderer|null = null
let waitting = false
$: if(Layer!==LayerOld){
  LayerOld = Layer
  if (renderer) renderer!.sliceLayer(0, Layer)  
}
function loaderGcode(file:any) {
    let reader = new FileReader();
    waitting = true
    let travelWidth = 0
    let gcode = ""
    reader.onload = function(){
      waitting = true
      gcode = this.result as string
      const TRANSPARENT_COLOR = new Color()
      const INNER_COLOR = new Color('#ff0000')
      const OUTER_COLOR = new Color('#00ff00')
      const SKIRT_COLOR = new Color('#ffff00')
      const FILL_COLOR = new Color('#ffff00')
      const BOTTOM_FILL_COLOR = new Color('#ffff00')
      const INTERNAL_FILL = new Color('#00ffff')
      const TOP_FILL = new Color('#ff00ff')
      const DEFAULT_COLOR = new Color('#0000ff')
      let colorConfig:any[] = []
      gcode.split("\n").forEach(function (line, i) {
        let color
        if (line.startsWith(";TYPE")){
          line = line.toUpperCase()
          if (line.startsWith(";TYPE:WALL-INNER")) {
            color = INNER_COLOR
          } else if (line.startsWith(";TYPE:WALL-OUTER")) {
            color = OUTER_COLOR
          } else if (line.startsWith(";TYPE:SKIRT")) {
            color = SKIRT_COLOR
          } else if (line.startsWith(";TYPE:FILL")) {
            color = FILL_COLOR
          } else if (line.startsWith(";TYPE:BOTTOM-FILL")) {
            color = BOTTOM_FILL_COLOR
          } else if (line.startsWith(";TYPE:INTERNAL-FILL")) {
            color = INTERNAL_FILL
          } else if (line.startsWith(";TYPE:TOP-FILL")) {
            color = TOP_FILL
          }
        }
        if (colorConfig.length === 0 || color && colorConfig[colorConfig.length - 1].color !== color) {
          colorConfig.push({toLine: i, color})
        } else {
          colorConfig[colorConfig.length - 1].toLine = i
        }
      });
      renderer = new GCodeRenderer(gcode, window.innerWidth, window.innerHeight, new Color())
      renderer.colorizer = new LineColorizer(colorConfig)
      renderer.travelWidth = travelWidth
      const viewerRef = document.getElementById("gcode-viewer")
      if (!viewerRef){
        console.log("viewerRef is null")
        return
      }
      viewerRef.innerHTML = ""
      viewerRef.append(renderer.element())

      renderer.render().then(()=>{
        LayerMax = renderer!.layerCount() 
        Layer = LayerMax
        //renderer?.fitCamera()
        waitting = false
      }).finally(()=>{
        waitting = false
      })
    };
    reader.readAsText(file);
  }
const openFile = (tag:string)=>{
  if (!tag )return
  console.log(tag)
  fetch(tag.split("#")[1]).then((res)=>{
    res.blob().then(b=>{
      console.log(b)
      loaderGcode(b)
    })
  })
}
onMount(()=>{  
  openFile(window.location.hash)
})
</script>
<main>

  <div class="content">
    
    <div id="toolbar-top"  class="z-10 absolute top-0 left-0  w-full pointer-events-auto"> 
      {#if waitting}
      <Spinner />
      {:else}
    
      <Label>Layer:{Layer}</Label>
      <Range id="range1"  min="0" max="{LayerMax}" bind:value={Layer} />
      {/if}
    </div>
    
  
    <div id="gcode-viewer" class=" h-full w-full z-0 absolute top-0 left-0" ></div>
  </div>
</main>