// place files you want to import through the `$lib` alias in this folder.

import rend from '@jscad/regl-renderer';
const {cameras, prepareRender,controls,drawCommands,entitiesFromSolids} = rend;
//import modeling from '@jscad/modeling'; 
import type {Geometry} from '@jscad/modeling/src/geometries/types';
import {solidBase} from './solidClass'

type solidStruct  = {name:string, key:Set<string>,val:string[]}
export const solidListKey="solidList" 
const regexpGetClass = /const\s+(\w+)\s*=\s*class(?:\s+extends\s+(\w+))?\s*\{/ 
interface SearchDataCallback {
  (k:string,v:any):boolean
}
export const solidNow:{solid:Geometry[]}={
  solid:[]
}
const orbitControls = controls.orbit
const perspectiveCamera = cameras.perspective
const state = {
  controls : orbitControls.defaults,
  camera:Object.assign({}, perspectiveCamera.defaults)
}
const solidTemplate = new solidBase()
export const searchSolid=(key:string,len:number=10)=>{
 
  let li:any[] = []
  if (!key)return li
  searchObj("this",solidTemplate,key,(k:string,v:any)=>{
    
    let v1 = v.toString()
    
    let d = v1.match(/const defaults \= (\{[^\}]+\})/)
    console.log(v1,d)
    if (d)   li.push([k,`${k}(${d![1]})`])
    return li.length<len
  })
  return li
}
//console.log(solidTemplate) 
/*
searchObj(solidTemplate,"c",(k:string,v:any)=>{
  console.log(k,v)
  return false
})
  */
  const gridOptions = {
    visuals: {
      drawCmd: 'drawGrid',
      show: true
    },
    size: [500, 500],
    ticks: [25, 5],
    // color: [0, 0, 1, 1],
    // subColor: [0, 0, 1, 0.5]
  }
  const axisOptions = {
    visuals: {
      drawCmd: 'drawAxis',
      show: true
    },
    size: 300,
    // alwaysVisible: true,
    // xColor: [0, 0, 1, 1],
    // yColor: [1, 0, 1, 1],
    // zColor: [0, 0, 0, 1]
  }
  let lastX = 0
  let lastY = 0
  
  const rotateSpeed = 0.002
  const panSpeed = 1
  const zoomSpeed = 0.08
  let rotateDelta = [0, 0]
  let panDelta = [0, 0]
  let zoomDelta = 0
  let pointerDown = false
  let updateView = true
  const doRotatePanZoom = () => {
    if (rotateDelta[0] || rotateDelta[1]) {
      const updated = orbitControls.rotate({ controls: state.controls, camera: state.camera, speed: rotateSpeed }, rotateDelta)
      state.controls = { ...state.controls, ...updated.controls }
      updateView = true
      rotateDelta = [0, 0]
    }
    if (panDelta[0] || panDelta[1]) {
      const updated = orbitControls.pan({ controls:state.controls, camera:state.camera, speed: panSpeed }, panDelta)
      state.controls = { ...state.controls, ...updated.controls }
      panDelta = [0, 0]
      state.camera.position = updated.camera.position
      state.camera.target = updated.camera.target
      updateView = true
    }
    if (zoomDelta) {
      const updated = orbitControls.zoom({ controls:state.controls, camera:state.camera, speed: zoomSpeed }, zoomDelta)
      state.controls = { ...state.controls, ...updated.controls }
      zoomDelta = 0
      updateView = true
    }
  }
  
  const moveHandler = (ev:any) => {
    if(!pointerDown) return
    const dx = lastX - ev.pageX 
    const dy = ev.pageY - lastY 
  
    const shiftKey = (ev.shiftKey === true) || (ev.touches && ev.touches.length > 2)
    if (shiftKey) {
      panDelta[0] += dx
      panDelta[1] += dy
    } else {
      rotateDelta[0] -= dx
      rotateDelta[1] -= dy
    }
  
    lastX = ev.pageX
    lastY = ev.pageY
  
    ev.preventDefault()
  }
  const wheelHandler = (ev:any) => {
    zoomDelta += ev.deltaY
    ev.preventDefault()
  }
 
  const renderOptions = {
    camera: state.camera,
    drawCommands: {
      drawAxis: drawCommands.drawAxis,
      drawGrid: drawCommands.drawGrid,
      drawLines: drawCommands.drawLines,
      drawMesh: drawCommands.drawMesh
    },
    // define the visual content
    entities: [
      gridOptions,
      axisOptions
      //...entities
    ]
  }  
  let containerElement:HTMLElement|null = null
  let renderer:any

  function changeCameraSize(){
    renderer(renderOptions)
    const width = containerElement!.clientWidth
    const height = containerElement!.clientHeight
    if (!width || !height) {
     // perspectiveCamera.update(state.camera  )
      return
    }
    
    perspectiveCamera.setProjection(state.camera, state.camera,{ width, height })
    //perspectiveCamera.update(state.camera)
    //perspectiveCamera.update(state.camera )
  }
  export function updateOptions(solids:any){ 
    solidNow.solid = solids
    let entities:any = entitiesFromSolids({},solids)
    renderOptions.entities = [
      gridOptions,
      axisOptions,
      ...entities
    ]
    renderer(renderOptions)
    
  } 

  export function show3d(el:HTMLElement,entities:any[]){
    containerElement = el
    renderer= prepareRender({
      glOptions: { container: containerElement! },
    })   
    //perspectiveCamera.update(state.camera ,state.camera)
    updateOptions(entities) 
    perspectiveCamera.setProjection(state.camera, state.camera,{ 
      width:containerElement!.clientWidth, 
      height:containerElement!.clientHeight })
    const updateAndRender = (timestamp:any) => {
        doRotatePanZoom()
        if (updateView) {
            const updates = orbitControls.update({ controls: state.controls, camera: state.camera })
            state.controls = { ...state.controls, ...updates.controls }
            updateView = state.controls.changed // for elasticity in rotate / zoom
            state.camera.position = updates.camera.position
            perspectiveCamera.update(state.camera)
            renderer(renderOptions)
        }
        window.requestAnimationFrame(updateAndRender)
    }
    window.requestAnimationFrame(updateAndRender)        
    window.addEventListener('resize', changeCameraSize)     
    containerElement!.onpointermove = moveHandler
    containerElement!.onpointerdown = (ev:any) => {
        pointerDown = true
        lastX = ev.pageX
        lastY = ev.pageY
        containerElement!.setPointerCapture(ev.pointerId)
      }
    containerElement!.onpointerup = (ev:any) => {
        pointerDown = false
        containerElement!.releasePointerCapture(ev.pointerId)
      }
    containerElement!.onwheel = wheelHandler

  }
  const getModFunc = (val:string)=>{
  
    let level  = 0       
    for(let i=0;i<val.length;i++){
      if (val.at(i)=='{')level++;
      if (val.at(i)=='}'){
        level--;
        if (level===0){
          i++
          return i
          //return val.slice(0,i++)
        }
      }
    }
    return 0
}
export const saveSolid = (val:string)=>{
  let begin =0
  let e = 0
  let v = val.slice(begin)
  let funcName=new Set(window.localStorage.getItem(solidListKey)?.split(','))
  while(true){
    
    begin = v.search(regexpGetClass);
    //console.log(begin,v)
    if (begin==-1)break
    v = v.slice(begin)      
    e =  getModFunc(v)    
    if (!e)break
    let v1 = v.slice(0,e)
    let vm = v1.match(regexpGetClass) 
    window.localStorage.setItem(vm![1], v1)
    funcName.add(vm![1])         
    v = v.slice(e)
  } 
  window.localStorage.setItem(solidListKey, Array.from(funcName).join(","))
}
export const removeSolid=(k:string)=>{
  window.localStorage.removeItem(k)
  let funcName  = new Set()
  window.localStorage.getItem(solidListKey)?.split(',').forEach(v=>{    
    if (v&&window.localStorage.getItem(v))funcName.add(v)
  })
  window.localStorage.setItem(solidListKey, Array.from(funcName).join(","))
}

export const showSolid = (str:string)=>{
  updateOptions( eval(str))
}
 
const getSolid=(val:string)=>{
  if (!val)return null
  let vm = val.match(regexpGetClass)    
  if (!vm)return null; 
  let info:solidStruct = {name:vm[1], key:new Set(vm[1]),val:[]}
  //info.key.add( vm[1]);
  getSolidFromChild(val,info)
  return info; 
}
const getSolidFromChild=(val:string,childInfo:solidStruct)=>{ 
  let keylist  = new Set<string>();
  [...val.matchAll(/(\w+)\./g)].forEach(v=>{
    keylist.add(v[1])
  });
  [...val.matchAll(/new\s+(\w+)\s*/g)].forEach(v=>{
    keylist.add(v[1])
  });
  let ext = val.match(/extends\s+(\w+)\s*/);
  //console.log("ext",ext)
  if (!ext || !ext[1]){
    val= val.replace(/\s*class\s*/,"class extends solidBase")
    //console.log(val)
  }else{
    keylist.add(ext[1])
 
  }
  childInfo.val.push(val)

  keylist.forEach(vl=>{
    if (childInfo.key.has(vl))return;
    childInfo.key.add(vl)
    let val_= window.localStorage.getItem(vl)
    if (!val_)return  
    childInfo.val.push(val_);
    getSolidFromChild(val_,childInfo)
  });
  /*
  [...val.matchAll(/(\w+)\./g)].forEach(v=>{
    let vl = v[1]
    if (childInfo.key.has(vl))return;
    childInfo.key.add(vl)
    let val_= window.localStorage.getItem(vl)
    if (!val_)return 
    //let vm = val_.match(regexpGetClass)   
    //if (!vm)return;
    //childInfo.key.add( vl);
    childInfo.val.push(val_);
    getSolidFromChild(val_,childInfo)
  }) 
    */
}
export const getSolidString = (v:string)=>{
  //let m = v.match(regexpGetMain)
  //if (!m)return ""
  let info = getSolid(v)
  if (!info)return""


  let val = info.val.join("\n")
    val+="\n"
   // console.log("main",m.length)
  //if (m[0].startsWith("static")){
  //  val+= info.name+".main()" 
  //}else{  
    val+=`let l=(new ${info.name}());l.main()`
  //}
  

  console.log(val)
  return val

}

 function searchObj(f:string,solid:Object ,k_:string,callback:SearchDataCallback)  {
  for (const [key, value] of Object.entries(solid)) {
      //console.log(`${key}: ${value}`);
      
      if (key.search(k_)<0) {
          if (typeof(value) == "object"){
            
            if (!searchObj(f+"."+key,value,k_,callback))return
          } 
      }else{
          if (!callback(f+"."+key,value))return false
      }
      
      
  }
  return false
     
}