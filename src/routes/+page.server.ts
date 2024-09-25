import {solidBase} from '$lib/solidClass'
//import {searchObj} from '$lib/show3d' 
const solidTemplate = new solidBase()

/** @type {import('./$types').PageServerLoad} */

export async function load() {
   return {data:solidTemplateToPlainObject(solidTemplate)}  
   
}

function solidTemplateToPlainObject(Inobj:Object,f:string="this"){
  const out:Map<string,any> =new Map<string,any> ()
  for (const [key, value] of Object.entries(Inobj)) {
    if (typeof(value) == "object"){    
      out.set(key, solidTemplateToPlainObject(value,`${f}.${key}`))
    }else{
      let d =value.toString().match(/const (?:defaults|t)\s*\=\s*(\{[^\}]+\})/)
      if (d) out.set(key,`${f}.${key}(${d![1]})`)
    }
    
  }
  return out
}

  