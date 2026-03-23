 
<script lang="ts" module  >
import {  onDestroy } from 'svelte';
import { autocompletion,CompletionContext } from '@codemirror/autocomplete'; 
import { EditorState } from '@codemirror/state';
import {  basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { javascript,snippets } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark'; 
import {helpPanel,codeFile} from '$lib/website/menuPanel'
//import {indentWithTab} from "@codemirror/commands"

 
let readOnly = false;
//let showSave = $state(false) 
let editorContainer:HTMLDivElement; 
//export const codeFile:{title:string,value:string} = {title:"edit",value:"console.log('Hello, CodeMirror!')"} 
function createEditor() {
    if (!editorContainer) return; 
    const state = EditorState.create({
        doc: codeFile.value,
        extensions: [
            helpPanel(),
        // 基础配置
        basicSetup, 
        EditorView.lineWrapping,
        // JavaScript语言支持
        //keymap.of([indentWithTab]),
        javascript(),
        autocompletion({
            override:[
                javascriptCompletions, 
        ]
        }), 
        readOnly ? EditorState.readOnly.of(true) : [], 
        oneDark, 
        EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                const newValue = update.state.doc.toString();
                if (newValue !== codeFile.value) {
                    codeFile.value = newValue;
                    //showSave=true
                    //console.log("update")
                }
            }
        })
        ]
    });
    
    

    return  new EditorView({
        state,
        parent: editorContainer
    });
}
function javascriptCompletions(context:CompletionContext) {
  let word = context.matchBefore(/\w*/);
  if (!word || (word.from == word.to && !context.explicit)) return null;
  //scopeCompletionSource(context)
  console.log(context)
  return {
    from: word.from,
    options:snippets//.concat(modelingCompletionData)//[     { label: "zaddone", type: "keyword" },]//modelingCompletionData
  };
}
 
export const initEdit =() => {
    const editorView = createEditor();
    let originalHeight = window.innerHeight;
    const handleResize = () => {
        const currentHeight = window.innerHeight;
        // 如果视口高度明显变小，认为是键盘弹出
        if (currentHeight < originalHeight * 0.7) {
            editorContainer.style.height = `${currentHeight}px`;
        } else {
            editorContainer.style.height = `100vh`;
        } 
    }
    window.addEventListener('resize', handleResize);
    /*
    window.addEventListener("beforeunload",saveFileCode);
    window.addEventListener("unload",saveFileCode);
    window.addEventListener("pagehile",saveFileCode);
    window.addEventListener("visibilitychange",(e)=>{
        if (document.visibilityState === 'hidden'){
            saveFileCode()
        }        
    });
    */
    onDestroy(() => {
        //destroyEditor();
        editorView.destroy()
        window.removeEventListener('resize', handleResize)
    });
}
 
export const GetUpdateFileList = ()=>{
    const list = window.localStorage.getItem("updateFileList")
    if (!list){
        return []
    }
    return (list.split(",")).map(f=>{return {name:f,db:window.localStorage.getItem(f)}})
}
</script>
 
 
<div bind:this={editorContainer} class="fullscreen-editor"    >


</div> 

<style>
    /* 全屏和基础样式 */
.fullscreen-editor {
  width: 100vw;
  height: 100vh;
  overflow: auto;
}
</style>