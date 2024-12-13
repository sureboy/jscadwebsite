<script context="module" lang="ts" >
  let editor:EditorView|null;
  let isOrthographic = false
  export const getValue = (name?:string) => {
    let val = editor?.state.doc.toString()
    if (val)return val
    if (!name)return ""
    return window.localStorage.getItem(name)||""
    //return editor?.state.doc.toString() || window.localStorage.getItem(name)
  }
</script>

<script lang="ts" >
  import {  basicSetup } from 'codemirror' 
  import { keymap,EditorView} from "@codemirror/view" 
  import {javascript,javascriptLanguage} from "@codemirror/lang-javascript"
  import {indentWithTab} from "@codemirror/commands"
  import type { CompletionContext } from '@codemirror/autocomplete'     
  import { onMount } from 'svelte'
	import {StoreInputCode,StoreCode3Dview,StoreMyClass,StoreAlertMsg,StoreOrthographic} from "$lib/function/storage"  
  export let inputList:Map<string, any>; 
  let element:HTMLElement;
  let nodeElement:HTMLElement;
  const optReg=/(?<=const\s+defaults\s+\=\s+)\{[^\}]+\}/m 
    
  const setValue = (val: string) => {
      editor?.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: val } })
  }
  StoreInputCode.subscribe(t=>{ 
		if (!t){ 
      let tmpval = getValue()
      if (tmpval && $StoreAlertMsg.name){
        window.localStorage.setItem($StoreAlertMsg.name,tmpval)
      }
			if (element)element.style.visibility = "collapse";
			return;
		} 
		//StoreCode3Dview.set({code:t,show:true})
		if ( editor) {
			element.style.visibility = "visible"
      setValue(t) 
		}
	})
  const options:any[]=[]
  const optionsBase:any[] = []
  inputList.forEach((v,k)=>{
    const vs = v.toString().match(optReg)
    if (vs){
      optionsBase.push({label:k, type: "text",apply:k+`(${vs[0]})`,detail:v})
    }else{
      optionsBase.push({label:k, type: "text",apply:k,detail:v})
    }      
  })
  StoreMyClass.subscribe(v=>{
    options.length = 0
    v.forEach((_v,_k)=>{
      options.push({label:_k, type: "text",apply:_k,detail:_v})
    })
    options.push(...optionsBase)
  })
  function myCompletions(context: CompletionContext) {
    let word = context.matchBefore(/[\w.]*/)
    if (word?.from == word?.to && !context.explicit)
      return null
    return {
      from: word?.from,
      options 
    }
  }
  const jsSnippets = javascriptLanguage.data.of({
    autocomplete: myCompletions,
  })
  onMount(()=>{
    window.document.addEventListener("keydown",(e) => {     
      if (e.ctrlKey ){
        if (e.code=="KeyS"){
          e.preventDefault();    
          StoreCode3Dview.set({code:getValue(),show:true,name:$StoreAlertMsg.name,camera:true}) 
          return
        }else if (e.code=="KeyK"){
          e.preventDefault()
          if ($StoreOrthographic){
            $StoreAlertMsg.errMsg = "Ctrl+K 透视"
          }else{
            $StoreAlertMsg.errMsg = "Ctrl+K 正交"
          }
          $StoreOrthographic  = !$StoreOrthographic
          return
        }
      } 
    })
    editor =   new EditorView({
      extensions: [
        basicSetup, 
        keymap.of([indentWithTab]),
        javascript(), 
        jsSnippets,
        EditorView.lineWrapping
      ],
      parent: nodeElement,      
    })   
  })
</script>
<div bind:this={element} class=""  style="visibility:collapse">
<div bind:this={nodeElement} class="pointer-events-auto opacity-90 bg-gray-200 max-h-[80vh] w-full md:w-1/2  lg:w-1/3  resize-x overflow-auto" > 

</div>
</div>