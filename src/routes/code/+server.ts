import { error,json } from '@sveltejs/kit';

//import * as crypto  from 'crypto';
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
 