import {mkdirSync,readFileSync,writeFileSync,renameSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {schema,type State} from './state.js';
export class Saves{
 constructor(public dir:string){mkdirSync(dir,{recursive:true});}
 path(name:string){if(!/^[A-Za-z0-9_-]+$/.test(name))throw Error('Invalid save name');return join(this.dir,name+'.json');}
 list(){return readdirSync(this.dir).filter(x=>x.endsWith('.json')).map(x=>x.slice(0,-5));}
 exists(name:string){return existsSync(this.path(name));}
 load(name:string){return schema.parse(JSON.parse(readFileSync(this.path(name),'utf8')));}
 write(s:State){const p=this.path(s.name);schema.parse(s);writeFileSync(p+'.tmp',JSON.stringify(s,null,2));renameSync(p+'.tmp',p);}
}
