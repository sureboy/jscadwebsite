const u = new URL("https://cdn.jsdelivr.net/gh/sureboy/games@master")
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
 
	if (!event.url.pathname.endsWith(".stl")) {
		const response = await resolve(event);
		return response;
	}
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
 