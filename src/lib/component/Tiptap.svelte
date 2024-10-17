<script lang="ts" > 
	import { ButtonGroup,Button,Drawer  } from 'flowbite-svelte';
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit'; 
	//import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
	//import { all, createLowlight } from 'lowlight' 
	//import js from 'highlight.js/lib/languages/javascript' 
	//import Tiplist from "./Tiplist.svelte";

	import {jsCodeBlockLowlight,insertEnter} from "$lib/function/jsCodeBlockLowlight";
	//import {StoreCode3Dview} from './store'
	import {StoreInputCode,StoreCode3Dview} from "$lib/function/storage"

	import {CloseOutline} from 'flowbite-svelte-icons' 
	
	export let inputList:Map<string, any>;

 
	let nodeElement:HTMLElement;
	let element:HTMLElement;
	//let tipli:HTMLElement;
	let editor:Editor;
	let inputKey:string;
	//let inputKeyBegin:number;
	let inputOutKey:string;
	let keyReg = /^this\.(?:\w+\.?)*$/
	let isSearchPos = -1 

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
			editor.commands.insertContentAt({from: 0, to: editor.getText().length},t)	
			//console.log("w",outputCode)
		}
	})
 
	$: if (inputOutKey){
		//console.log(inputOutKey)
		//editor.commands.focus();
		const p = editor.state.selection.$anchor.pos
		let beginP = p-inputKey.length
		editor.commands.focus(beginP)
		console.log(beginP,p,inputKey,inputOutKey)
		if (beginP<0)beginP = 0
		editor.chain().insertContentAt({ from: beginP, to:p },inputOutKey).run();
		inputOutKey=""  
	} 
 
	onMount(() => {
		//tipli.style.visibility = "collapse"
		window.document.addEventListener("keydown",(e) => {     
			if (e.ctrlKey && (e.code=="Enter"||e.code=="KeyS")){
				e.preventDefault();    
				StoreCode3Dview.set(editor.getText()) 
				return
			} 
			if (e.key==="Escape"){
				inputKey = ""
				//tipli.style.visibility = "collapse"
				return
			} 
		})
		element.addEventListener("click",e=>{ 
		})
		editor = new Editor({
			element,
			extensions: [
				StarterKit,
				jsCodeBlockLowlight.configure({
					HTMLAttributes: {
						class: '',
					}, 
				}),
				
			],
			editorProps: {
				attributes: {
					class: " h-1/2 p-1   overflow-auto",
				},
			},
			content: ``,
			onTransaction: ({ editor, transaction}) => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
				//console.log("trans")
			},
			
			onCreate:({editor})=>{ 
				editor.commands.setCodeBlock()
				//editor.commands.insertContent("\/\/Input Ctrl+enter perview this solid\nconst solid1=class{\n main(){\n return [this.cube({size:20,center:[0,0,200]})]\n};\n}")
				
			}, 
			onUpdate:({ editor, transaction })=>{
				//console.log(editor.can())
				//console.log(transaction)
				
				if (!editor.isActive("codeBlock")){
					editor.commands.setCodeBlock()
					return
				}
				return
				/*
				//let codetext = editor.getText()
				//StoreCode3Dview.set(codetext)
				//editor.commands.scrollIntoView();				
				const position = editor.state.selection.$anchor.pos;
				if (tipli.style.visibility==="visible"){
					try{				
					let tmpkey=editor.getText().substring(isSearchPos,position-1)
					if (keyReg.test(tmpkey)){
						inputKey = tmpkey
						//inputKeyBegin = editor.state.selection.$anchor.pos 
					}else{
						tipli.style.visibility = "collapse"
					}
					}catch(e){
						console.log(e)
						tipli.style.visibility = "collapse"
					}				 
					return
				}
				const node =  editor.$pos(position-1)
				const el = node.element;
				if (el.nodeName==="#text" && el.textContent==="this") {					
					//console.log(editor.getText().substring(isSearchPos,position))
					let rect = el.parentElement?.getBoundingClientRect()
					if (rect){
						//console.log(rect)
						//let X= rect!.x.toString()
						tipli.style.left = rect!.x.toString()+"px"
						tipli.style.top = (rect!.y+rect!.height).toString()+"px"
						tipli.style.visibility = "visible"
						isSearchPos=position-5
						//console.log(tipli,X)
					}
					console.log(position,el.textContent ,el.parentElement?.getBoundingClientRect())
				} 
				return 
				*/
			},
			onFocus({ editor, event }) {
		 
			},
			
		});
	 
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>
 
 
<div  class="container pointer-events-none mx-auto flex flex-row  "  >
	<!--
	<div bind:this={tipli} class="fixed opacity-90 bg-gray-300 aspect-video overflow-auto  max-w-1/2   h-1/2 z-50 pointer-events-auto">
		<Tiplist {inputKey} {inputList} bind:inputOutKey={inputOutKey}></Tiplist>
	</div>
	 -->
	<div bind:this={nodeElement} class=" pointer-events-auto opacity-90 bg-gray-200 max-w-full  " style="visibility:collapse">
	
{#if editor}
<ButtonGroup class="*:!ring-primary-700" >
	<Button  on:click={() =>{
		editor.commands.insertDoubleBrackets('{}');
		 insertEnter(editor); 
		 }} >
		{@html '{}'}
	</Button>
	<Button  on:click={() => editor.commands.insertDoubleBrackets('[]')} >
		{@html '[]'}
	</Button>
	<Button  on:click={() => editor.commands.insertDoubleBrackets('()')} >
		{@html '()'}
	</Button>
	<Button  on:click={() => editor.commands.insertDoubleBrackets('""')} >
		{@html '""'}
	</Button>
	<Button  on:click={() => editor.commands.insertDoubleBrackets("''")} >
		{@html "''"}
	</Button>
	<Button  on:click={() => {
		StoreInputCode.set("");
		StoreCode3Dview.set(editor.getText())
	}
	} >
		<CloseOutline/>
	</Button>
</ButtonGroup>
{/if}
 
<div  class="pointer-events-auto   max-h-[80vh]  overflow-auto" bind:this={element}  spellcheck=false></div>
</div>
</div> 
 


<style >
 
  
</style>
