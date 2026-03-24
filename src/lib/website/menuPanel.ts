import {showPanel,EditorView,keymap} from "@codemirror/view"
import {StateField, StateEffect} from "@codemirror/state"   
import {indentWithTab} from "@codemirror/commands"
export const codeFile:{title:string,value:string,isLocal?:boolean} = {title:"edit",value:"console.log('Hello, CodeMirror!')"} 


const saveFileCode = ()=>{
    if (!codeFile.value ){
        window.localStorage.removeItem(codeFile.title)
        //showSave=false
        window.close()
        return;
    }
    console.log("save code")
    if (!codeFile.isLocal){
      if (!window.confirm("Save to local?"))return;
    }
    window.localStorage.setItem(codeFile.title,codeFile.value)
    //const updateFileList = (window.localStorage.getItem("updateFileList") ||"").split(",")
    //const updateFileList = updateFileListKey.split(",")
    //updateFileList.push(codeFile.title)
    //window.localStorage.setItem("updateFileList",updateFileList.join(","))
    codeFile.value = ""
    //showSave=false
}
function createHelpPanel(view: EditorView) {
  const dom = document.createElement("div")
  dom.innerHTML = `
  <button id="save"  >Save</button>
  <button id="view" >View</button>
  <button id="delete">Delete</button>
  <span>F1: Toggle the menu panel</span>
  `
  dom.className = "cm-menu-panel"
 
  dom.addEventListener("click",(e)=>{
    switch ((e.target as HTMLElement).id){
        case "save":
            saveFileCode();
            return;
        case "view":
            window.location.href="/#"+codeFile.title.split("*")[0]
            return;
        case "delete":
            window.localStorage.removeItem(codeFile.title)
            window.location.href="/#"+codeFile.title.split("*")[0]
            return;
        default:
            return;
    }
   // console.log("click",(e.target as HTMLElement).id )
    //document.getElementById("save").addEventListener("click",(e)=>{
        
        
   // })
  })
  return {top: true, dom}
}

const toggleHelp = StateEffect.define<boolean>()

const helpPanelState = StateField.define<boolean>({
  create: () => true,
  update(value, tr) {
    for (let e of tr.effects) if (e.is(toggleHelp)) value = e.value
    return value
  },
  provide: f => showPanel.from(f, on => on ? createHelpPanel : null)
})
const saveCommand = (view:any) => {
    saveFileCode();
    return true;
    
};
const helpKeymap = [{
  key: "F1",
  run(view:{dispatch:any,state:any}) {
    view.dispatch({
      effects: toggleHelp.of(!view.state.field(helpPanelState))
    })
    return true
  }
    },indentWithTab,
    {
    key: 'Ctrl-s',      // Windows/Linux
    run: saveCommand,
    preventDefault: true, // 阻止浏览器默认保存行为
  },
  {
    key: 'Cmd-s',       // macOS
    run: saveCommand,
    preventDefault: true,
  },
   //       extraKeys: {
   //     'Ctrl-S': function(cm) { saveToLocalStorage(); return false; },
   //     'Cmd-S': function(cm) { saveToLocalStorage(); return false; }
   //   }
]
const helpTheme = EditorView.baseTheme({
  ".cm-menu-panel": {
    padding: "5px 10px",
    backgroundColor: "#525353",
  },
  ".cm-menu-panel span": {
    color:"#fff",
    fontFamily: "monospace"
  }
})

export function helpPanel() {
  return [helpPanelState, keymap.of(helpKeymap), helpTheme]
}