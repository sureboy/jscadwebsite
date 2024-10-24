 
import type {Geometry } from '@jscad/modeling/src/geometries/types';

import type {csgObj} from "$lib/function/csg2Three"  
//export const solidB = new solidBase()
export type CodeToWorker = {code:string,name?:string,show?:boolean,stl?:boolean }
export type  WorkerMsg = {Flist?:string[][],code?:string,name?:string,ver?:csgObj,stl?:BlobPart[],errMsg?:string }
export type AlertMsgType = {waitting:boolean,errMsg:string ,name:string}
//export let AlertMsg:AlertMsgType={waitting:false,errMsg:"3D Create" }
export interface SearchDataCallback {
    (k:string,v:any):boolean
  }

export const regexpGetClass = /^\s*const\s+(\w+)\s*=\s*class(?=\s+extends\s+(\w+))?\s*\{/ 
export const solidNow:{solid:Geometry[]}={
  solid:[]
}
export interface solidEditStruct  { 
  [x: string]: any;
  main:()=>Geometry[]; 
  init?:(option:{})=>void;
} 