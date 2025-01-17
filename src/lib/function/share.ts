 
import type {Geometry } from '@jscad/modeling/src/geometries/types';

import type {csgObj} from "$lib/function/csg2Three"  
//export const solidB = new solidBase()
export type CodeToWorker = {code:string,file?:boolean,name?:string,show?:boolean,stl?:boolean ,camera?:boolean }
export type  WorkerMsg = {show?:boolean,Flist?:string[][],code?:string,name?:string,ver?:csgObj,stl?: BlobPart[],
  errMsg?:string,end?:boolean,start?:boolean,camera?:number,file?:string }
export type AlertMsgType = {waitting:boolean,errMsg:string ,name:string}
//export let AlertMsg:AlertMsgType={waitting:false,errMsg:"3D Create" }
export interface SearchDataCallback {
    (k:string,v:any):boolean
  }

export const regexpGetClass = /^\s*const\s+([\w\$]+)\s*=\s*class\s*\{/ 
export const regClassName = (vn:string)=>{
 return new RegExp(`(?<=this\\.|\\s)${vn}(?=\\.|\\s*\\=)`,'g')
}
export const solidNow:{solid:Geometry[]}={
  solid:[]
}
export interface solidEditStruct  { 
  [x: string]: any;
  main:()=>Geometry[]|Geometry; 
  //toFile?:()=>string;
} 