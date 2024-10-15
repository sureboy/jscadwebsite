import { all, createLowlight } from 'lowlight' 
import js from 'highlight.js/lib/languages/javascript' 
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight' 

const lowlight = createLowlight(all) 
//console.log(js)

lowlight.register('js', js)
let enterReg = /(\n +)\S*$/
/**
 * Matches a code block with backticks.
 */
export const backtickInputRegex = /^111$/

/**
 * Matches a code block with tildes.
 */
export const tildeInputRegex = /^~~~([a-z]+)?[\s\n]$/

export const insertEnter = (editor:any)=>{
    editor.chain().enter().enter().run()
    const  p =editor.state.selection.$anchor.pos-1
    const k = editor.getText().substring(0,p).match(enterReg)
    //console.log(k)
    if (!k)editor.commands.focus(p);
    else editor.commands.focus(p-(k[1].length-1));	    

    editor.commands.insertContent("  ")
}


declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        CodeBlockLowlight: {
        
        /**
         * Insert Double Brackets
         * @param attributes Code block attributes
         * @example editor.commands.insertDoubleBrackets('()')
         */
        insertDoubleBrackets: (inputString:string) => ReturnType
      }
    }
  }
 
export const jsCodeBlockLowlight = CodeBlockLowlight.extend({ 
  
    addCommands() {
        return {
            
            insertDoubleBrackets: (inputString:string) => ({ chain,state }) => {
            return chain().insertContent(inputString).focus(state.selection.$anchor.pos+(inputString.length/2)).run(); 
        
            },
        }
    },
    addOptions() { 
        return {...this.parent?.(),
            
            lowlight,
            defaultLanguage : 'javascript',
            //languageClassPrefix:"tx"
        }
    },
    addKeyboardShortcuts() {
        
        return {
            Enter: ({ editor }) => {                
                const  p =editor.state.selection.$anchor.pos
                const k = editor.getText().substring(0,p-1).match(enterReg)
                //console.log(k)
                if(k)
                    editor.commands.insertContent(k[1])
                else
                    editor.commands.insertContent("\n")
                return true 
            },
            "Tab":({editor})=>{ 
                editor.chain().focus().insertContent("  ").run();
                return true 
            },
            "{":({editor})=>{ 
                editor.commands.insertDoubleBrackets(`{}`)
                insertEnter(editor)
                return true 
            },
            "[":({editor})=>{
                editor.commands.insertDoubleBrackets(`[]`) 
                return true 
            },
            "(":({editor})=>{
                editor.commands.insertDoubleBrackets(`()`)
                return true 
            },
            "\"":({editor})=>{
                editor.commands.insertDoubleBrackets(`""`) 
                return true 
            },
            "'":({editor})=>{
                editor.commands.insertDoubleBrackets(`''`) 
                return true 
            },
            "`":({editor})=>{
                editor.commands.insertDoubleBrackets("``") 
                return true 
            }, 
            ArrowDown: ({ editor }) => {
                const { state } = editor
                const { selection  } = state
                const { $from, empty } = selection
                if (!empty || $from.parent.type !== this.type) {
                return false
                }
                const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2
                if (!isAtEnd) {
                    return false
                }
                return true
            },
        }
    },

   
}); 