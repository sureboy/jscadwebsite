import {solidBase} from '$lib/function/solidClass' 
import type { PageServerLoad } from './$types';
const solidTemplate = new solidBase()
export const prerender = true;

export const load: PageServerLoad = ({ params }) => { 
   return {data:solidTemplateToPlainObject(solidTemplate)}  
   
}

function solidTemplateToPlainObject(Inobj:Object,f:string="this"){
  const out:Map<string,any> =new Map<string,any> ()
  for (const [key, value] of Object.entries(Inobj)) {
    if (typeof(value) == "object"){    
      if (Array.isArray(value)){
        out.set(`${f}.${key}`,value)
        continue
      }
      for (const [_key, _value] of solidTemplateToPlainObject(value,`${f}.${key}`)) {
        out.set(_key, _value);
      }
      //out.set(key, solidTemplateToPlainObject(value,`${f}.${key}`))  
    }else{
      //let str = value.toString()
      //out.set(key,[`${f}.${key}`,str])
      out.set(`${f}.${key}`,value.toString())
    }
  }
 
  return out
}

  