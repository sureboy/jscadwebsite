import { error,json } from '@sveltejs/kit';
import modeling from '@jscad/modeling';
import type { RequestHandler } from './$types';
const align:("right" | "center" | "left" | undefined) [] = ["right","center","left",undefined]
function getRandom(min:number, max:number) {
    return Math.random() * (max - min) + min;
}
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
const tmpCode = new Map<string,string>()
export const GET: RequestHandler =async ({url, request, platform }) => {
    const k = url.searchParams.get("k")
    let code = tmpCode.get(k)
    if (code){
        return json({code})
    }
    code = generateRandomString(8) 
    tmpCode.set(k,code)
    return json({code})
    //return json({code:char(code)}) 
};
export const POST:RequestHandler=async (e) => {
    console.log(e)
    //await e.platform?.env.KV.put("test","1231")
    return json({msg:"true"}) 

};
 