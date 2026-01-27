 
export type menuConfigType = {
  cameraType: 'Perspective' |'Orthographic';
  module: (modulelist: {
      list: string[];
      basename: string;
  }) => void;
}
export type windowConfigType = {
  pageType:'run'|'gzData'|'stlData', 
  in: string;
  func: string;
  name:string;
  src:string;
  date?:string;
  files?:string[];
}
export type workerConfigType = {
 
  options?:Object;
} &menuConfigType & windowConfigType
export const MenuType  = {
  MainMenu:1,
  Camera:1<<1,
  Stl:1<<2,
  Gzip:1<<3,
  Src:1<<4,
  Png:1<<5,
}
 
export type sConfig = {
  worker?: Worker,
  baseUrl?:string,
  oldMenu?:number,
  el?:HTMLCanvasElement,
  workermsg?:workerConfigType,showMenu:number,
  postMessage?:(m:any)=>void,
  //endBack?:()=>void,
  //setWorkerMsg:(db:workerConfigType)=>void
}  
export const gzipToString= async (data: ArrayBuffer )=>{
  
  if (!window.CompressionStream || !window.DecompressionStream) {
    console.log("down code err")
    window.alert("CompressionStream code err")
    return
  }
  //let resultText:string = "";
  try {
    const decompressedStream = new DecompressionStream('gzip');
   
    const writer = decompressedStream.writable.getWriter();
   
    writer.write(data as BufferSource);
    writer.close();
    const decompressedResponse = new Response(decompressedStream.readable);
    //window.alert("1")
    return await decompressedResponse.text()
    //const decompressedArrayBuffer = await decompressedResponse.arrayBuffer(); 
   
    //window.alert("2")
   
    // 尝试将解压缩数据转换为文本，如果不是文本则显示为十六进制
  
        //const textDecoder = new TextDecoder();
        //resultText = textDecoder.decode(decompressedArrayBuffer);
    } catch (e) {
      console.error(e);
      window.alert(e)
        // 如果不是有效的文本，显示为十六进制
        //resultText = arrayBufferToHexString(decompressedArrayBuffer);
    }
    
    //return resultText;
  };

export const regexExec = (code:string,
    regex:RegExp 
    ,back:(r:RegExpExecArray,lastIndex:number)=>void
)=>{
    let match:RegExpExecArray|null;
    while ((match = regex.exec(code)) !== null) {
        
        back(match,regex.lastIndex);
    }
};
  export  const srcStringToJsFile = (src:string,back:(msg:{name:string,db:string})=>void)=>{
    let name = "";
    let codeStart = 0;
    //let codeEnd  = 0
    //console.log(src)
    regexExec(src,/\/\*\*\s*([^\*|\s]+)\s*\*/g,(r,i)=>{      
      if (name){
        //codeEnd = 
        //console.log(r,codeStart,src.slice(r.index,i))
        //const db = src.slice(codeStart,r.index).trim()
        //if (db)
        back({name,db:src.slice(codeStart,r.index).trim()});
      }
      name = r[1];
      codeStart = i+1;

      // r[1]
      // r.index,i
    });
    if (name){
        back({name,db:src.slice(codeStart).trim()});
    }
/*
    src.split("========").forEach(db=>{
     const name = getFileName(db)
     //console.log("filename",getFileName(db))
     if (name)
     back({
      name ,
      db,
     })
    })
     */
  }  ;

