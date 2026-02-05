import Cloudflare from "cloudflare"
import { CLOUDFLARE_EMAIL,CLOUDFLARE_API_KEY ,ACCOUNT_ID,KV_NAMESPACE_ID} from '$env/static/private';
const client = new Cloudflare({
  apiEmail: CLOUDFLARE_EMAIL , // This is the default and can be omitted
  apiKey:  CLOUDFLARE_API_KEY , // This is the default and can be omitted
});
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
export const kvdblist = ()=>{
    return client.kv.namespaces.keys.list(KV_NAMESPACE_ID,{ account_id:  ACCOUNT_ID  })
}
export const kvdbput=(k:string,v:ArrayBuffer,opt:{metadata?:any,expiration?:number,expirationTtl?:number})=>{
    return client.kv.namespaces.values.update(KV_NAMESPACE_ID,k,Object.assign({ account_id:  ACCOUNT_ID ,value:"test" },opt),{stream:true,headers:{'ContentType': 'application/octet-stream'},body:v})
}