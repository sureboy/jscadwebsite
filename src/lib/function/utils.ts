 
export type menuConfigType = {
  cameraType?: 'Perspective' |'Orthographic' | '';
  module: (modulelist: {
      list: string[];
      basename: string;
  }) => void;
}
type mainConfigType = {
  src:string,
  name: string,
  func: string,
  in: string,
  date:string,
  port:number,
  worker?:string,
  webview:boolean,
  webUI?:string,
  serverIP?:string[],
  includeImport:{ [key: string]: string }
}
export type windowConfigType =mainConfigType & {
  files:string[];
}
export type workerConfigType = {
  //pageType?:'run'|'gzData'|'stlData', 
  windowConfig?:windowConfigType,
  options?:Object;
} &menuConfigType 
export const MenuType  = {
  MainMenu:1,
  Camera:1<<1,
  Stl:1<<2,
  Gzip:1<<3,
  Src:1<<4,
  Png:1<<5,
  File:1<<6,
}

export type sConfig = {
  worker?: Worker,
  baseUrl?:string,
  oldMenu?:number,
  el?:HTMLCanvasElement,
  workermsg?:workerConfigType,
  showMenu:number,
  postMessage?:(m:any)=>void, 
}  
export const getRemoteUrl = (serverIP?: string[])=>{
  //return "/"
  if (! serverIP || serverIP.length===0){
    return "/"
  }else{
    let addr =  serverIP[0]
    if (!addr.startsWith("http")){
      addr = "https://"+addr
    }
    if (!addr.endsWith("/")){
      addr += "/"
    }
    return addr
  }
}
export const fetchGZBuffer = async (name:string)=>{
  let url = ""
  if (name.endsWith(".solidjscad.gz")){
      url = "/assets/"+name
  }else{
      url = "/db?k="+name 
  }
  console.log(url)
  const req =await fetch(url)
  if (!req.ok)
      return null
  return await req.arrayBuffer()
}
export const gzipToString= async (data: ArrayBuffer )=>{  
  if (!window.CompressionStream || !window.DecompressionStream) {
    console.log("down code err")
    window.alert("CompressionStream code err")
    return
  } 
  try {
    const decompressedStream = new DecompressionStream('gzip');   
    const writer = decompressedStream.writable.getWriter();   
    writer.write(data as BufferSource);
    writer.close();
    const decompressedResponse = new Response(decompressedStream.readable); 
    return await decompressedResponse.text() 
  } catch (e) {
    console.log(data)
    console.error(e); 
  } 
}; 
export function clearHash() {
    // 获取当前URL的pathname和search部分
    var url = window.location.pathname + window.location.search;
    history.replaceState(null, null, url);
}
export const regexExec = (code:string,
    regex:RegExp 
    ,back:(r:RegExpExecArray,lastIndex:number)=>void
)=>{
    let match:RegExpExecArray|null;
    while ((match = regex.exec(code)) !== null) {
        
        back(match,regex.lastIndex);
    }
};
export  const srcStringToFile = (src:string,back:(msg:{name:string,db:string})=>void)=>{
  let name = "";
  let codeStart = 0; 
  regexExec(src,/\/\*\*\s*([^\*|\s]+)\s*\*/g,(r,i)=>{      
    if (name){ 
      back({name,db:src.slice(codeStart,r.index).trim()});
    }
    name = r[1];
    codeStart = i+1; 
  });
  if (name){
      back({name,db:src.slice(codeStart).trim()});
  }
}  ;

export const stringToGzip= async (src:string)=>{
    const originalBytes = new TextEncoder().encode(src);
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(originalBytes);
        controller.close();
      }
    });
    const compressionStream = new CompressionStream('gzip');
    const compressedStream = readableStream.pipeThrough(compressionStream);

    // 4. 从压缩流中读取数据块
    const reader = compressedStream.getReader();
    const chunks  = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); // value 是 Uint8Array 类型的数据块
    }
    return chunks 
} 