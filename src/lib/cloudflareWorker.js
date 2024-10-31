export default {
    async fetch(request, env, ctx) {
        const he = new Headers()
        he.set('Access-Control-Allow-Origin', '*');
        he.set('Access-Control-Allow-Headers', '*');
 
        const url = new URL(request.url);
        const k = url.searchParams.get("k")
        if (k){
          const value = await env.solidtmp.get(k);
          if (value){ 
            return  new Response(value,{headers:he})             
          }           
        } 
      if (request.body){
        const k = request.body.get("k")
        if (k){
          const v = request.body.get("v")
          if (v){
            await env.solidtmp.put("KEY", "VALUE");
 
            return  new Response(null,{headers:he})
          }
        }       
      }
      return  new Response(null,{headers:he,status:404})
    },
  };