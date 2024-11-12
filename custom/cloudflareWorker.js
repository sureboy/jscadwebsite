const secondsFromNow = 3600*48
const regexpGetClass = /^\s*const\s+([\w\$]+)\s*=\s*class\s*\{/ 
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
    const name = url.searchParams.get("keyName")
    if (!name)return new Response(null,{status:404}) 

    try{
      
      let codePage =""
      
      let codeHeader = []
      const db = await request.formData()

      db.forEach((v,k) => {
        
        //db[k]=v
        
        let value = v.toString()
        if (!regexpGetClass.test(value))
          return new Response(null,{status:404}) 
        codePage+=`\n======\n${value}`
        codeHeader.push(k)
      }) 
      if (!codePage)return new Response(null,{status:404}) 
      
      codePage = codeHeader.join(",")  + codePage
      
      //const codePage = JSON.stringify(db)
      const  codeKey =name.split("__")[0]+"__"+new Date().getTime().toString(36).substring(2);// await digestMessage(codePage);
      await env.solidtmp.put(codeKey,codePage,{
        expirationTtl: secondsFromNow,
      });   
      const html= `<!doctype html>
<html lang="en">
<head> 
<meta http-equiv="refresh" content="0;url=${encodeURI(reurl)}#qrcode:${codeKey}:${name}">
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