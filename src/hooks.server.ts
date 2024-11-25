//import { defaultLocale, loadTranslations, locales, } from '$lib/translations/index';
import type { Handle,HandleServerError } from '@sveltejs/kit';

const u = new URL("https://cdn.jsdelivr.net/gh/sureboy/games@master")
const u1 = new URL("https://cdn.jsdelivr.net/gh/sureboy/jscadwebsite@master")
export const handle: Handle = async ({ event, resolve }) => {
	
	const { url,request } = event;
	const { pathname, } = url;
	if ( pathname.endsWith(".stl")) {
		return await resStl(event)
	}
	//request.body
	//const db = await request.formData()
	//const d = new Date().getTime().toString(36).substring(2)
	//new Response()
	
	console.log(pathname)
	if (pathname.startsWith("/docs/")){
		try{
			const pa = u1.pathname+"/static/"+pathname
			const modifiedRequest = new Request(pa, {	
				redirect: 'follow'
			});
			const response = await fetch(modifiedRequest);
			if (response.status !==200){
				
				return new Response("err "+pa)
			}
			const modifiedResponse = new Response(response.body, response);  
			//response
			modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
			modifiedResponse.headers.set('Access-Control-Allow-Headers', '*');
			return modifiedResponse;

/*
			const file = await import(`https://cdn.jsdelivr.net/gh/sureboy/games@master${pathname}.html?raw`).then(m => m.default);
			return new Response(file, {
				headers: {
					'Content-Type': 'text/html',
				},
			});
			*/
		}catch(e:any){
			return new Response(e.toString() );
		}
		
	}
	

	return await resolve(event)
	


}
 /*
export const handleError: HandleServerError = async ({  event }) => {
	const { locals } = event;
	const { lang } = event.locals as {lang:string};
	//console.log(event.locals)
	await loadTranslations(lang, 'error');
	return {
		message: 'error!',
		locals,
	};
	//return locals;
};
 */
async function resStl(event:any){
	const url = new URL(event.url);
	let v = url.searchParams.get("v")
  let q = url.searchParams.get("q")
  if (v ==="" || q ==="")return new Response("err");
  let db =  new Date().toUTCString().split(":")
  let sign = await digestMessage([
    "range", 
    db[0], 
    q,       
  ].sort().toString())
  if (v !== sign){
    return new Response(v);
  }  
	u.pathname+=url.pathname
	const modifiedRequest = new Request(u.toString(), {	
		redirect: 'follow'
	});
	const response = await fetch(modifiedRequest);
	if (response.status !==200){
		
		return new Response("err")
	}
	const modifiedResponse = new Response(response.body, response);  
	//response
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', '*');
    return modifiedResponse;
}
async function digestMessage(message:string) {
	const msgUint8 = new TextEncoder().encode(message); // 编码为（utf-8）Uint8Array
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // 计算消息的哈希值
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // 将缓冲区转换为字节数组
	const hashHex = hashArray
	  .map((b) => b.toString(16).padStart(2, "0"))
	  .join(""); // 将字节数组转换为十六进制字符串
	return hashHex;
} 
