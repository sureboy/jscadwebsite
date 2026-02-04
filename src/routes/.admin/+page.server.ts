import type { PageServerLoad } from './$types'; 
import fs from 'fs';
import path from 'path';

function getStaticPath() {
    // 判断是否生产环境
    if (process.env.NODE_ENV === 'production') {
        // 生产环境，假设server.ts运行在build/server目录，静态文件在build/client
        return path.join(__dirname, '../client');
    } else {
        // 开发环境，静态文件在项目根目录的static文件夹
        return path.join(process.cwd(), 'static');
    }
}
export const load: PageServerLoad = async ({ params,url }) => {
    const staticPath = getStaticPath();
    const jsonPath = path.join(staticPath,"asstes", 'data.json'); 
    let db:{update?:number,list?:any[]} = {}
    try {
        const data = fs.readFileSync(jsonPath, 'utf8');
        db =(await JSON.parse(data) as {update:number,list:any[]})//.list.map(l=>l.name) // JSON.parse(data);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        //jsonData = {};
    }
    //if (asstesdb.ok){
    //   db = (await asstesdb.json() as {update:number,list:any[]}).list.map(l=>l.name)
    //}
    
    let uri = "https://db.solidjscad.cn?list=1"
    const cursor = url.searchParams.get("cursor")
    if (cursor){
        uri +="&cursor="+cursor
    }
    const r = await fetch(uri) 
    if (!r.ok){
        return {msg:"nothing"}
    }
    const _db =await  r.json() as {cacheStatus?:any,keys?:{name:string,expiration?:number,metadata?:any}[],list_complete:boolean,cursor:string}
    const items = db.list.map(l=>l.title)
    _db.keys.forEach(v=>{
        if (!items.includes(v.name))
        db.list.push({title:v.name,img:""})
    })
    return {db:db};
};