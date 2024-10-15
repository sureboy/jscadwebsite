 
import type {Geometry ,Geom3} from '@jscad/modeling/src/geometries/types';


//export const solidB = new solidBase()

export type AlertMsgType = {waitting:boolean,errMsg:string }
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
  main:()=>Geom3[]; 
}