import type { sConfig,windowConfigType,menuConfigType} from './utils';
import type {messageObj} from "./ImportParser"
import { runWorker } from "./worker";
import { addSceneSTL} from "./threeScene" 
import {gzipToString,srcStringToFile,MenuType} from "./utils"
import {delCurrentMsg,handleCurrentMsg,getCurrent,getCurrentCode}  from "./ImportParser"
import {STLLoader} from "three/addons/loaders/STLLoader.js" 
type  handlePostMsg = (msg:any,postMessage?: (e: {name:string,db:string|ArrayBuffer,open:boolean}) => void)=>void
export  class HandleMessageClass {
    constructor(private  solidConfig:sConfig, ){

    }
    del:{name:string,fn:handlePostMsg} = {
        name:"del",
        fn:(msg:{name:string})=> {    
            delCurrentMsg(msg.name);
        }
    }
    init:{name:string,fn:handlePostMsg} = {
        name:"init",
        fn:(msg:messageObj ,postMessage?: (e: any) => void) =>{ 
            /*
            //console.log(this.solidConfig.workermsg.windowConfig)
            if (this.solidConfig.workermsg.windowConfig.files){
                this.solidConfig.workermsg.windowConfig.files.push(msg.name)
            }else{
                this.solidConfig.workermsg.windowConfig.files=[msg.name]
            }
            //console.log(this.solidConfig.workermsg.windowConfig,msg.name) 
            */
            handleCurrentMsg(msg,postMessage)
        }
    }
    begin:{name:string,fn:handlePostMsg} ={
        name:"begin",
        fn:(msg:{config:windowConfigType} ,
        postMessage?: (e: any) => void) =>{ 
            //console.log("begin",this.solidConfig)
            if (!this.solidConfig.workermsg){
                console.error("workermsg is nul")
                return
            }
            if (this.solidConfig.workermsg.windowConfig){
                Object.assign(this.solidConfig.workermsg.windowConfig,msg.config)
            }else{
                Object.assign(this.solidConfig.workermsg,{windowConfig:msg.config})
            }
            //}else{
            //    this.solidConfig.workermsg = Object.assign( {},{windowConfig:msg.config} )    
            //}   
            //console.log("begin1",this.solidConfig) 
        }
    }
    run:{name:string,fn:handlePostMsg} ={
        fn:(msg:messageObj&{open:boolean},
            postMessage?: (e: any) => void) =>{
            //Object.assign(solidConfig.workermsg,{cameraType:msg.open?solidConfig.workermsg?.cameraType:'' })
            if (!msg.open){ 
                this.solidConfig.workermsg.cameraType = ""
            }
            this.solidConfig.showMenu=MenuType.Camera|MenuType.MainMenu|MenuType.Png|MenuType.Stl|MenuType.Gzip//|MenuType.Src
            runWorker(this.solidConfig );    
            console.log("run",this.solidConfig)
            },
        name:"run"
    }
    getSrc:{name:string,fn:handlePostMsg} = {
        fn:(msg:{name?:string},postMessage?: (e: any) => void) =>{
            //console.log("getsrc",solidConfig.workermsg.worker)
            //console.log("getsrc")
            getCurrent(this.solidConfig.workermsg.windowConfig.worker,postMessage).then(
            current=>{
                console.log("getsrc",current)
                getCurrentCode(current,(name:string,code:string)=>{ 
                //console.log("getsrc",name)
                postMessage({
                    type:"src",
                    name,
                    code 
                })
                }).then(()=>{
                postMessage({
                    type:"src"
                }) 
                })
            })
        },
        name:"getSrc"
    }
    gzData:{name:string,fn:handlePostMsg} = {
        fn:(message:{db:ArrayBuffer},postMessage?: (e: any) => void)=>{
            gzipToString(message.db).then(src=>{
            srcStringToFile(src,(db)=>{  
                if (db.name.endsWith("solidjscad.json")){
                Object.assign(this.solidConfig.workermsg,JSON.parse(db.db) )
                }else{
                handleCurrentMsg(db) 
                }
            }) 
            console.log(this.solidConfig)
            this.solidConfig.showMenu=MenuType.Camera|MenuType.MainMenu|MenuType.Png|MenuType.Src|MenuType.Stl
            runWorker(this.solidConfig );
            }) 
        },
        name:'gzData'
    }
    stlData:{name:string,fn:handlePostMsg} = {
        fn:(message:{db:ArrayBuffer},)=>{
        addSceneSTL(this.solidConfig.el,new STLLoader().parse(message.db));
            this.solidConfig.showMenu=MenuType.Camera // | MenuType.Stl
        },
        name:"stlData"
    }
    Direction:{name:string,fn:handlePostMsg}[] =[
        this.begin, 
        this.init, 
        this.del,
        this.run,
        this.getSrc,
        this.gzData,
        this.stlData ] ;
    getMsgHandle = (type:number )=>{
        function* getTag  (Direction:{name:string,fn:handlePostMsg}[]) {
            for (let i = 0; i < Direction.length; i ++) {    
            if ((type & (1<<i)) !==0){
                yield Direction[i]
            }
            }
        }
        return getTag(this.Direction)
    }
    HandleMessage = ( 
    message:{type:number,msg?:any},
    postMessage?: (e: any) => void)=>{
        //console.log("messagepost",message)
        for (const type of this.getMsgHandle(message.type)) {
        //console.log(type.name);
            type.fn(message.msg,postMessage)
        }
    } 
}