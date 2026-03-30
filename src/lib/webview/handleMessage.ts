import type { sConfig,menuConfigType} from '../function/utils';
import type {messageObj} from "../function/ImportParser"
import { runWorker, getWorkerName } from "../function/worker";
import { addSceneSTL} from "../function/threeScene" 
import {gzipToString,srcStringToFile,MenuType} from "../function/utils"
import {delCurrentMsg,handleCurrentMsg,getCurrent,getCurrentCode}  from "../function/ImportParser"
import {STLLoader} from "three/addons/loaders/STLLoader.js" 
import {HandleMsgToShow} from "../function/worker"  
import {getCsgObjArray} from '../function/csgChange'
type  handlePostMsg = (msg:any,postMessage?: (e: {name:string,db:string|ArrayBuffer,open:boolean}) => void)=>void
const bufferDBToThreeDB = (db:ArrayBuffer)=>{
    console.log(db)
    const uint8Array = new Uint8Array(db);
    const fullBuffer = new DataView(db);
    // 读取元数据
    const vertexCount = fullBuffer.getUint32(0, true); // true 表示小端字节序
    const indexCount = fullBuffer.getUint32(4, true);

    // 计算数据偏移
    const vertexDataOffset = 8;
    const vertexDataSize = vertexCount * 3 * 4; // 每个顶点 3 个 float
    const indexDataOffset = vertexDataOffset + vertexDataSize;
    const indexDataSize = indexCount * 4; // 每个索引 4 字节 (uint32)

    if (fullBuffer.byteLength < indexDataOffset + indexDataSize) {
      console.log(new Error('Incomplete data'));
      return;
    }

    // 提取二进制数据
    const vertexBuffer = uint8Array.subarray(vertexDataOffset, vertexDataOffset + vertexDataSize);
    const indexBuffer = uint8Array.subarray(indexDataOffset, indexDataOffset + indexDataSize);

    // 转换为 Float32Array 和 Uint32Array
    const vertices = new Float32Array(vertexBuffer.buffer, vertexBuffer.byteOffset, vertexCount * 3);
    const indices = new Uint32Array(indexBuffer.buffer, indexBuffer.byteOffset, indexCount); 

    return {vertices,indices}
}
export  class HandleMessageClass {
    constructor(private  solidConfig:sConfig, ){

    }
    bufferDB:{name:string,fn:handlePostMsg}={
        name:"bufferDB",
        fn:(msg:{db:ArrayBuffer})=> {    
            //delCurrentMsg(msg.name);

        getCsgObjArray(bufferDBToThreeDB(msg.db),(e)=>{
          console.log("t",e)
          HandleMsgToShow(this.solidConfig,e)
          this.solidConfig.showMenu=MenuType.Camera | MenuType.Stl
        })
        }
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
        fn:(msg:{config:menuConfigType} ,
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
            getCurrent(getWorkerName(this.solidConfig.workermsg.windowConfig),postMessage).then(
            current=>{
                console.log("getsrc",current)
                getCurrentCode(current,(name:string,db:string)=>{ 
                //console.log("getsrc",name)
                postMessage({
                    type:"src",
                    msg:{name,
                    db }
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
                handleCurrentMsg(db,postMessage) 
                }
            }) 
            console.log(this.solidConfig)
            this.solidConfig.showMenu=MenuType.Camera|MenuType.MainMenu|MenuType.Png|MenuType.Src|MenuType.Stl|MenuType.Gzip
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
        this.stlData,
        this.bufferDB ] ;
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