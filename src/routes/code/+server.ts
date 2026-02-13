import { error,json } from '@sveltejs/kit';

//import {put} from '$lib/function/kvdb'
import modeling from '@jscad/modeling';
import { API_SECRET_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';
const align:("right" | "center" | "left" | undefined) [] = ["right","center","left",undefined]
function getRandom(min:number, max:number) {
    return Math.random() * (max - min) + min;
}
async function sha256(message:string) {
  // 1. 将字符串编码为 Uint8Array (UTF-8)
  const msgBuffer = new TextEncoder().encode(message);
  
  // 2. 使用 Web Crypto API 计算哈希
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // 3. 将 ArrayBuffer 结果转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
//function sha256(data:string) {
//  return crypto.createHash('sha256').update(data).digest('hex');
//}
function generateRandomString(length: number): string {
  //const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  
  return result;
}
const shuffle = (arr:any[]) => {
    //const arr = [0, 1, 2, 3, 4];
    for (let i = 1; i < arr.length; i++) {
        const random = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[random]] = [arr[random], arr[i]];
    }
    return arr;
};
function char(c:string ){

    const h =   getRandom(10,150)
   
    const a = align[Math.floor(getRandom(0,3))]
    //console.log(h, a)
    return shuffle(modeling.text.vectorText({xOffset:-h*4,height:h,align:a,input:c}))
 
}
//const tmpCode = new Map<string,string>()
export const GET: RequestHandler =async (req) => {
 
    const code = generateRandomString(8)   
    return json({ 
      code:char(code),
      key:await sha256(API_SECRET_KEY+code.toLocaleLowerCase() + Date.now().toString().slice(0,8))
    }) 
};
const getMinDateTime = ()=>{
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    console.log(now.toISOString() )
    return Math.floor(now.getTime()/1000)
}
export const POST:RequestHandler=async (e) => { 
    const code = e.url.searchParams.get("code")
    const key = e.url.searchParams.get("key") 
    if (!code 
      || !key       
      || key != await sha256(API_SECRET_KEY+code.toLocaleLowerCase() + Date.now().toString().slice(0,8))){ 
      return json({msg :"err"}) 
    }
    const arrayBuffer = await e.request.arrayBuffer();
    if (!arrayBuffer)
      return json({msg :"not db"})  
    const k = Date.now().toString(32)
    const opt:{metadata?:any,expiration:number,expirationTtl?:number} = {expiration:getMinDateTime()} 
    const email =  e.url.searchParams.get("email") || ""
  
    const title =  e.url.searchParams.get("title")||""
    
    opt.metadata = {title,email}
    
    const expiration =  e.url.searchParams.get("expiration")
    if (expiration){
      opt.expiration =parseInt(expiration)
    }
    const expirationTtl =  e.url.searchParams.get("expirationttl")
    if (expirationTtl){
      opt.expirationTtl =parseInt(expirationTtl)
    } 
    console.log(opt,Math.floor(Date.now()/1000))
    await e.platform?.env.solidtmp.put(k,arrayBuffer,opt) 
    return json({msg:"ok",k})
};