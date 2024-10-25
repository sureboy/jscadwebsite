<script lang="ts">
  import {  basicSetup } from 'codemirror' 
  import { keymap,EditorView} from "@codemirror/view" 
  import {javascript,javascriptLanguage} from "@codemirror/lang-javascript"
  import {indentWithTab} from "@codemirror/commands"
  import type { CompletionContext } from '@codemirror/autocomplete'     
  import { onMount } from 'svelte'
	import {StoreInputCode,StoreCode3Dview,StoreMyClass} from "$lib/function/storage"
  import { CloseOutline} from 'flowbite-svelte-icons';
  import {ButtonGroup,Button} from 'flowbite-svelte';  
  export let inputList:Map<string, any>; 
  let element:HTMLElement;
  let editor:EditorView|null;
  let nodeElement:HTMLElement;
  const optReg=/(?<=const\s+defaults\s+\=\s+)\{[^\}]+\}/sm
  const getValue = () => {
      return editor?.state.doc.toString() || ''
  }
  const setValue = (val: string) => {
      editor?.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: val } })
  }

  StoreInputCode.subscribe(t=>{
		
		//if ( editor) editor.commands.insertContentAt({from: 0, to: editor.getText().length},t)	
		if (!t){
			//hidden=true
			if (element)element.style.visibility = "collapse";
			return;
		}
		//console.log(t)
		//hidden=false
		StoreCode3Dview.set({code:t,show:true})
		if ( editor) {
			element.style.visibility = "visible"
      setValue(t)
			//editor.commands.insertContentAt({from: 0, to: editor.getText().length},t)	
			//console.log("w",outputCode)
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
      if (e.ctrlKey && (e.code=="Enter"||e.code=="KeyS")){
        e.preventDefault();    
        StoreCode3Dview.set({code:getValue(),show:true}) 
        return
      }  
    })
    editor =   new EditorView({
        //  lineWrapping:true,
      doc: "console.log('hello')\n",
      extensions: [
        basicSetup, 
        keymap.of([indentWithTab]),
        javascript(), 
        jsSnippets,
        EditorView.lineWrapping
      ],
      parent: nodeElement,      
    })   
    //console.log(editor.update([jsSnippets]))
  })
</script>
<div bind:this={element} class=" "  style="visibility:collapse">
<div bind:this={nodeElement} class="pointer-events-auto opacity-90 bg-gray-200 max-h-[80vh] w-full md:w-1/2  lg:w-1/3  resize-x overflow-auto" > 

</div>
</div>