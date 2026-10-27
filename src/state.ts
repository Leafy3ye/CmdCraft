import {z} from 'zod';
import {randomUUID} from 'node:crypto';
const n=z.number().int().nonnegative();
const bag=z.record(n);
export const schema=z.object({version:z.literal(1),name:z.string().regex(/^[A-Za-z0-9_-]+$/),seed:z.string(),created:z.number(),saved:z.number(),lang:z.enum(['zh-CN','en-US']),time:n,inventory:bag,durability:bag,equipped:z.string(),location:z.enum(['camp','cave']),discovered:z.boolean(),surveyed:z.boolean(),branch:z.boolean(),veins:bag,records:z.array(z.enum(['discover','branch'])),facilities:z.array(z.object({id:z.number().int().positive(),kind:z.enum(['workbench','furnace','chest']),input:n,fuel:n,output:n,progress:n,storage:bag})),task:z.object({kind:z.enum(['wood','explore','branch','mine']),target:z.string(),remaining:z.number().positive(),interval:z.number().positive(),earned:n}).nullable()});
export type State=z.infer<typeof schema>;
export function fresh(name:string,now:number):State{return schema.parse({version:1,name,seed:randomUUID(),created:now,saved:now,lang:'zh-CN',time:0,inventory:{},durability:{},equipped:'',location:'camp',discovered:false,surveyed:false,branch:false,veins:{stone:200,coal:80,iron:60,copper:40},records:[],facilities:[],task:null});}
export function slots(b:Record<string,number>){return Object.values(b).reduce((a,v)=>a+Math.ceil(v/64),0);}
export function add(b:Record<string,number>,id:string,q:number,cap=27){const next={...b,[id]:(b[id]??0)+q};if(next[id]<0||slots(next)>cap)return false;Object.assign(b,next);return true;}
