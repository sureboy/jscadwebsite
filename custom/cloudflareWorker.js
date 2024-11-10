const secondsFromNow = 3600*48
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
        codeHeader.push(k)
        //db[k]=v
        codePage+=`\n======\n${v.toString()}`
      }) 
      if (!codePage)return new Response(null,{status:404}) 
      
      codePage = codeHeader.join(",")  + codePage
      
      //const codePage = JSON.stringify(db)
      const  codeKey =name+":"+Number(new Date());// await digestMessage(codePage);
      await env.solidtmp.put(codeKey,codePage,{
        expirationTtl: secondsFromNow,
      });   
      const html= `<!doctype html>
<html lang="en">
<head> 
<meta http-equiv="refresh" content="0;url=${encodeURI(reurl)}#qrcode:${codeKey}">
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