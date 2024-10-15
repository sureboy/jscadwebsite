import { defaultLocale, loadTranslations, locales } from '$lib/translations/index';
import type { Handle,HandleServerError } from '@sveltejs/kit';

const u = new URL("https://cdn.jsdelivr.net/gh/sureboy/games@master")
 
export const handle: Handle = async ({ event, resolve }) => {
	
	const { url, request } = event;
	const { pathname } = url;
	if (event.url.pathname.endsWith(".stl")) {
		return await resStl(event)
	}
	const supportedLocales = locales.get().map((l) => l.toLowerCase());

	let locale = supportedLocales.find((l) => l === `${pathname.match(/[^/]+?(?=\/|$)/)}`.toLowerCase()); 

	if (!locale)  {
		var item = request.headers.get('accept-language')?.match(/[a-zA-Z]+?(?=-|_|,|;)/g)||[]
		//console.log(item)
		for (let l of item){
			locale = l.toLowerCase()
			//console.log(locale,l)
			if (supportedLocales.includes(locale))
				return new Response(null, { headers: { 'location': `/${locale}${pathname}` }, status: 301 });
		} 
		return new Response(null,{headers: { 'location': `/${defaultLocale}${pathname}` },status:404})
	}
	
	return resolve({ ...event, locals:{lang: locale } }, {
		transformPageChunk: ({ html }) => html.replace(/<html.*>/, `<html lang="${locale}">`),
	}); 

}
 
 
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
 