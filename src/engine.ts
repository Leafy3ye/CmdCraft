import {fresh,add,type State} from './state.js';
import {names,recipes,tools,veins} from './data.js';
import {tr,type Key,type Lang} from './i18n.js';
import {Saves} from './save.js';
export function parse(line:string){if(!/^\/[a-z]+(?:\s+[^\r\n]+)?$/.test(line.trim()))throw Error('bad');return line.trim().slice(1).split(/\s+/);}
export class Engine{
 state?:State;lang:Lang='zh-CN';context?:number;last:number;warnings:Key[]=[];seen=new Set<Key>();
 constructor(public saves:Saves,public clock=()=>Date.now(),public random=()=>Math.random()){this.last=clock();}
 t(k:Key){return tr(this.lang,k);}
 label(id:string){return names[id]?.[this.lang==='zh-CN'?0:1]??id;}
 warn(k:Key){if(!this.seen.has(k)){this.seen.add(k);this.warnings.push(k);}}
 passive(s:State,ms:number){for(const f of s.facilities){if(f.kind!=='furnace')continue;let budget=ms;while(budget>0&&f.output<64&&(f.progress>0||(f.input>0&&f.fuel>0))){if(!f.progress){f.input--;f.fuel--;f.progress=10000;}const used=Math.min(budget,f.progress);budget-=used;f.progress-=used;if(!f.progress)f.output++;}}}
 tick(){const now=this.clock(),ms=Math.max(0,now-this.last);this.last=now;const s=this.state;if(!s)return;this.passive(s,ms);s.time+=Math.floor(ms);let left=ms;while(s.task&&left>=s.task.remaining){left-=s.task.remaining;const a=s.task;
 if(a.kind==='explore'){s.discovered=true;s.records.push('discover');s.task=null;break;}
 if(a.kind==='branch'){s.branch=true;s.records.push('branch');s.task=null;break;}
 const id=a.kind==='wood'?'logs':veins[a.target].item;
 if(!add(s.inventory,id,1)){this.warn('full');s.task=null;break;}
 a.earned++;
 if(a.kind==='mine'){s.veins[a.target]--;s.durability[s.equipped]--;if(!s.durability[s.equipped]){this.warn('broken');s.task=null;break;}if(!s.veins[a.target]){this.warn('empty');s.task=null;break;}if(s.durability[s.equipped]===5)this.warn('low');}
 a.interval=a.kind==='wood'?3000:this.interval();a.remaining=a.interval;
 }if(s.task)s.task.remaining-=left;s.saved=now;this.saves.write(s);}
 interval(){return Math.floor((5000+this.random()*5001)*(this.state?.equipped==='iron_pickaxe'?0.7:1));}
 save(){if(this.state){this.state.lang=this.lang;this.state.saved=this.clock();this.saves.write(this.state);}}
 start(kind:NonNullable<State['task']>['kind'],target='',interval=8000){const s=this.state!;if(s.task)throw Error('busy');this.seen.clear();s.task={kind,target,interval,remaining:interval,earned:0};}
 command(line:string):string{try{this.tick();const [cmd,a,b,c,...extra]=parse(line);if(extra.length)throw Error('bad');
 const count=(v:string|undefined)=>{const n=Number(v??1);if(!Number.isSafeInteger(n)||n<1||n>10000)throw Error('bad');return n;};
 if(cmd==='help')return this.t('help');
 if(cmd==='lang'){if(a!=='zh-CN'&&a!=='en-US')throw Error('bad');this.lang=a;this.save();return this.t('ok');}
 if(cmd==='save'){
 if(a==='list')return this.saves.list().join('\n')||'—';
 if(a==='info'&&b){const s=this.saves.load(b);return JSON.stringify({name:s.name,created:s.created,saved:s.saved,time:s.time});}
 if((a==='create'||a==='load')&&b){this.save();let s:State;if(a==='create'){if(this.saves.exists(b))throw Error('bad');this.saves.path(b);s=fresh(b,this.clock());s.lang=this.lang;}else{s=this.saves.load(b);this.passive(s,Math.max(0,this.clock()-s.saved));}s.task=null;this.state=s;this.lang=s.lang;this.context=undefined;this.last=this.clock();this.save();return this.t('ok');}
 if(a)throw Error('bad');this.save();return this.t('ok');}
 const s=this.state;if(!s)throw Error('load');
 const requireCamp=()=>{if(s.location!=='camp'||s.task)throw Error('need');};
 let result=this.t('ok');
 switch(cmd){
 case 'inventory':result=Object.entries(s.inventory).filter(([,q])=>q).map(([id,q])=>this.label(id)+' ×'+q).join('\n')||'—';break;
 case 'status':result=this.t(s.location)+'\n'+this.taskStatus()+'\n'+s.records.map(k=>this.t(k)).join('\n');break;
 case 'map':result=this.t('camp')+'\n'+(s.discovered?this.t('cave')+' #1':'???');break;
 case 'gather':if(a==='stop')s.task=null;else{requireCamp();if(a!=='wood')throw Error('bad');this.start('wood','',3000);}break;
 case 'explore':if(a==='status'){result=this.taskStatus();break;}if(a==='forest'){requireCamp();this.start('explore');}else if(a==='cave'&&s.location==='cave')this.start('branch');else throw Error('bad');break;
 case 'path':if(a!=='1'||s.location!=='cave')throw Error('bad');this.start('branch');break;
 case 'enter':if(s.task||a!=='cave'||b!=='1'||!s.discovered)throw Error('need');s.location='cave';break;
 case 'return':if(s.task)throw Error('busy');s.location='camp';this.context=undefined;break;
 case 'survey':if(s.location!=='cave')throw Error('need');s.surveyed=true;result=Object.entries(s.veins).filter(([id])=>id!=='copper'||s.branch).map(([id,q])=>id+' ×'+q).join('\n')+'\n/path 1: ???';break;
 case 'recipes':result=Object.keys(recipes).filter(id=>!recipes[id].bench||s.facilities.some(f=>f.kind==='workbench')).join('\n');break;
 case 'recipe':if(!recipes[a])throw Error('bad');result=this.label(a)+' ×'+recipes[a].yield+' ← '+Object.entries(recipes[a].cost).map(([id,q])=>this.label(id)+' ×'+q).join(', ');break;
 case 'craft':case 'create':{
 requireCamp();const r=recipes[a];if(!r||(cmd==='create')!==['workbench','furnace','chest'].includes(a))throw Error('bad');
 const q=cmd==='craft'?count(b):1;const id=b?count(b):Math.max(0,...s.facilities.map(f=>f.id))+1;
 if(cmd==='create'&&s.facilities.some(f=>f.id===id))throw Error('bad');
 if(r.bench&&!s.facilities.some(f=>f.kind==='workbench'))throw Error('need');
 const inv={...s.inventory};for(const [item,n]of Object.entries(r.cost))if(!add(inv,item,-n*q))throw Error('need');
 if(cmd==='craft'){if(tools[a]&&(q!==1||((s.inventory[a]??0)>0&&s.durability[a]>0)))throw Error('need');if(tools[a]&&!s.durability[a])inv[a]=0;if(!add(inv,a,r.yield*q))throw Error('need');if(tools[a])s.durability[a]=tools[a].max;}
 else s.facilities.push({id,kind:a as 'workbench'|'furnace'|'chest',input:0,fuel:0,output:0,progress:0,storage:{}});
 s.inventory=inv;break;}
 case 'equip':if(s.task||!tools[a]||!s.inventory[a]||!s.durability[a])throw Error('need');s.equipped=a;break;
 case 'mine':if(a==='stop'){s.task=null;break;}if(a==='status'){result=this.taskStatus();break;}if(!veins[a]||!tools[s.equipped]||tools[s.equipped].tier<veins[a].tier||!s.durability[s.equipped]||!s.veins[a]||(a!=='stone'&&(s.location!=='cave'||!s.surveyed))||(a==='copper'&&!s.branch))throw Error('need');this.start('mine',a,this.interval());break;
 case 'list':result=s.facilities.map(f=>'#'+f.id+' '+this.label(f.kind)+' '+this.t(f.progress?'active':'idle')+' '+f.output+'/64').join('\n')||'—';break;
 case 'furnace':case 'chest':requireCamp();if(!s.facilities.some(f=>f.id===count(a)&&f.kind===cmd))throw Error('need');this.context=count(a);result=JSON.stringify(s.facilities.find(f=>f.id===this.context));break;
 case 'back':this.context=undefined;break;
 case 'put':case 'take':{
 requireCamp();const f=s.facilities.find(f=>f.id===this.context),q=count(c);if(!f||!names[b])throw Error('bad');
 if(f.kind==='chest'&&a==='storage'){const from=cmd==='put'?s.inventory:f.storage,to=cmd==='put'?f.storage:s.inventory;if((from[b]??0)<q||!add(to,b,q))throw Error('need');add(from,b,-q);break;}
 if(f.kind!=='furnace')throw Error('bad');
 if(cmd==='put'&&((a==='input'&&b==='raw_iron')||(a==='fuel'&&b==='coal'))){const slot=a as 'input'|'fuel';if(f[slot]+q>64||!add(s.inventory,b,-q))throw Error('need');f[slot]+=q;}
 else if(cmd==='take'&&a==='output'&&b==='iron_ingot'){if(f.output<q||!add(s.inventory,b,q))throw Error('need');f.output-=q;}else throw Error('bad');break;}
 default:throw Error('bad');
 }this.save();return result;
 }catch(e){const key=e instanceof Error?e.message:'';return '[ERROR] '+this.t(key==='busy'||key==='need'||key==='load'?key:'bad');}}
 taskStatus(){const s=this.state!,a=s.task;return a?this.t('active')+' '+a.target+' ×'+a.earned+' ['+'#'.repeat(Math.floor(10*(1-a.remaining/a.interval))).padEnd(10,'-')+'] '+(s.durability[s.equipped]??''):this.t('idle');}
}
