async function digestMessage(message) {
	const msgUint8 = new TextEncoder().encode(message); // 编码为（utf-8）Uint8Array
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // 计算消息的哈希值
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // 将缓冲区转换为字节数组
	const hashHex = hashArray
	  .map((b) => b.toString(16).padStart(2, "0"))
	  .join(""); // 将字节数组转换为十六进制字符串
	return hashHex;
} 
export default {
  async fetch(request, env, ctx) {
    
    const url = new URL(request.url);


    const k = url.searchParams.get("k")
    if (k){
      const value = await env.solidtmp.get(k);
      if (value){  
        return  new Response(value ,{headers:new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            "content-type": "text/html",
          })
        });
      }           
    } 
    const reurl = url.searchParams.get("url")
    if (!reurl)return
    //const name = url.searchParams.get("keyName")
    //if (!name)return new Response(null,{status:404}) 

    try{
      let codePage =""
      let codeHeader = []
      const db = await request.formData()

      db.forEach((v,k) => {
        codeHeader.push(k)
        //db[k]=v
        codePage+=`\n======\n${v.toString()}`
      }) 
      if (!codePage)return new Response(null,{status:404}) 
      
      codePage = codeHeader.join(",")  + codePage
      //const codePage = JSON.stringify(db)
      const  codeKey = await digestMessage(codePage)
      await env.solidtmp.put(codeKey,codePage);   
      const html= `<!doctype html>
<html lang="en">
<head> 
<meta http-equiv="refresh" content="0;url=${reurl}#remote:${codeKey}:QR">
</head>
</html>`
      return  new Response(html,
        {headers:new Headers({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          "content-type": "text/html",
        })
      })
    }catch(e){
      return new Response(e,{status:404}) 
    }
  }
};