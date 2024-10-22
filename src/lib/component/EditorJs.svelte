<script lang="ts">
    import {  basicSetup } from 'codemirror' 
    import { keymap,EditorView} from "@codemirror/view" 
    import {javascript,javascriptLanguage} from "@codemirror/lang-javascript"
    import {indentWithTab} from "@codemirror/commands"
    import type { CompletionContext } from '@codemirror/autocomplete'     
    import { onMount } from 'svelte'

	import {StoreInputCode,StoreCode3Dview} from "$lib/function/storage"
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
			if (nodeElement)nodeElement.style.visibility = "collapse";
			return;
		}
		//console.log(t)
		//hidden=false
		StoreCode3Dview.set(t)
		if ( editor) {
			nodeElement.style.visibility = "visible"
            setValue(t)
			//editor.commands.insertContentAt({from: 0, to: editor.getText().length},t)	
			//console.log("w",outputCode)
		}
	})
    
    function myCompletions(context: CompletionContext) {
      let word = context.matchBefore(/[\w.]*/)
      if (word?.from == word?.to && !context.explicit)
        return null
      const options:any[]=[]
      inputList.forEach((v,k)=>{
        const vs = v.toString().match(optReg)
        if (vs){
          options.push({label:k, type: "text",apply:k+`(${vs[0]})`,detail:v})
        }else{
          options.push({label:k, type: "text",apply:k,detail:v})
        }
        
      })
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
				StoreCode3Dview.set(getValue()) 
				return
			} 
 
		})
        editor =   new EditorView({
          //  lineWrapping:true,
        doc: "console.log('hello')\n",
        extensions: [basicSetup, keymap.of([indentWithTab]),javascript(), jsSnippets,EditorView.lineWrapping
        ],
        parent: nodeElement,      
      })    
 


    })
</script>
<div bind:this={nodeElement} class=" pointer-events-auto opacity-90 bg-gray-200 w-full md:w-1/2  lg:w-1/3  max-h-[80vh]  overflow-auto resize-x" style="visibility:collapse"> 
 
</div>