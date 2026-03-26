import {showPanel,EditorView,keymap} from "@codemirror/view"
import {StateField, StateEffect} from "@codemirror/state"   
import {indentWithTab} from "@codemirror/commands"
 import {getFileList} from "./localFile"
export const codeFile:{title:string,value:string,isLocal?:boolean} = {title:"edit",value:"console.log('Hello, CodeMirror!')"} 

const getFileSelectList = ()=>{
  const select = document.createElement("select")
  select.id="files"
  select.add(new Option("--",""))
  for (const [r,n] of getFileList()){
    select.add(new Option(n,r,false,r===codeFile.title))
  }
  select.style.marginRight = '6px';
  select.onchange = (e)=>{
    //console.log(e)
    const select = e.target as HTMLSelectElement
    //console.log(select.value)
    switch (select.value) {
        case "":
            return;
        default:
            //mySolidTmp.index = Number(select.value)
            //mySolidTmp.update()
            //currentLocalDBConfig.path = select.value 
            //history.replaceState(null, null, '#'+select.value);
            window.location.hash = select.value
            //changeSolidConfig(solidConfig,showMenu)
            //console.log(mySolidTmp)
            window.location.reload()
            return
    }  
  }
  return select
  
  
  //<select name="cars" id="cars"
}
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
function createButton(name:string,onclick?:(e?:any)=>void){
  const but = document.createElement("button")
  but.id=name
  but.textContent=name
  but.onclick=()=>onclick
  but.style.marginRight = '6px';
  return but
}
function createHelpPanel(view: EditorView) {
  const dom = document.createElement("div")
 
  dom.appendChild(createButton("delete"))
  dom.appendChild(getFileSelectList())
  dom.appendChild(createButton("save"))
  dom.appendChild(createButton("view"))
    dom.appendChild(createButton("docs"))
  dom.className = "cm-menu-panel"
 
  dom.addEventListener("click",(e)=>{
    switch ((e.target as HTMLElement).id){
        case "save":
            saveFileCode();
            return;
        case "docs":
            window.location.href=`https://docs.solidjscad.${window.location.host.endsWith("cn")?"cn":"com"}`
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