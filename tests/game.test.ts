import {test,expect} from 'vitest';
import {mkdtempSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Engine,parse} from '../src/engine.js';
import {Saves} from '../src/save.js';
import {add} from '../src/state.js';
import {messages} from '../src/i18n.js';
function setup(){let now=1000;const saves=new Saves(mkdtempSync(join(tmpdir(),'cmdcraft-')));const e=new Engine(saves,()=>now,()=>0);const run=(s:string)=>{const r=e.command(s);expect(r,s).not.toContain('[ERROR]');return r;};run('/save create world1');return {e,saves,run,advance:(ms:number)=>{now+=ms;e.tick();}};}
test('complete survival loop, offline furnace and iron tool',()=>{
 const {e,run,advance,saves}=setup();
 run('/gather wood');advance(60000);run('/gather stop');
 run('/craft planks 12');run('/craft sticks 4');run('/create workbench 1');
 run('/craft wooden_pickaxe');run('/equip wooden_pickaxe');
 run('/mine stone');advance(100000);run('/mine stop');
 run('/craft stone_pickaxe');run('/equip stone_pickaxe');
 run('/explore forest');advance(8000);run('/enter cave 1');run('/survey');
 run('/mine iron');advance(15000);run('/mine stop');
 run('/mine coal');advance(15000);run('/mine stop');run('/return');
 run('/create furnace 2');run('/furnace 2');run('/put input raw_iron 3');run('/put fuel coal 3');run('/back');run('/save');
 const saved=saves.load('world1');const next=new Engine(saves,()=>saved.saved+30000);
 expect(next.command('/save load world1')).not.toContain('[ERROR]');
 expect(next.state!.facilities[1].output).toBe(3);
 next.command('/save load world1');expect(next.state!.facilities[1].output).toBe(3);
 next.command('/furnace 2');next.command('/take output iron_ingot 3');
 expect(next.command('/craft iron_pickaxe')).not.toContain('[ERROR]');
 expect(next.state!.inventory.iron_pickaxe).toBe(1);
});
test('parser, translations, inventory and invalid commands',()=>{
 expect(()=>parse('mine iron')).toThrow();expect(parse('/mine iron')).toEqual(['mine','iron']);
 for(const pair of Object.values(messages))expect(pair.every(Boolean)).toBe(true);
 const b={logs:64};expect(add(b,'logs',1,1)).toBe(false);expect(add(b,'logs',-65)).toBe(false);
 const {e}=setup();expect(e.command('/craft furnace -1')).toContain('[ERROR]');expect(e.command('/mine iron')).toContain('[ERROR]');expect(e.command('/lang en-US')).toBe('Done.');
});
test('saves isolated, corruption rejected, traversal blocked',()=>{
 const {e,saves,run}=setup();run('/save create second');expect(saves.list()).toHaveLength(2);run('/save load world1');expect(e.state!.name).toBe('world1');
 expect(()=>saves.path('../evil')).toThrow();writeFileSync(saves.path('broken'),'{');expect(e.command('/save load broken')).toContain('[ERROR]');expect(e.state!.name).toBe('world1');
});
test('continuous mining, queries, depletion, durability and warning deduplication',()=>{
 const {e,run,advance}=setup();e.state!.inventory.wooden_pickaxe=1;e.state!.equipped='wooden_pickaxe';e.state!.durability.wooden_pickaxe=2;
 run('/mine stone');advance(4999);expect(e.state!.inventory.cobblestone).toBeUndefined();run('/inventory');advance(1);expect(e.state!.inventory.cobblestone).toBe(1);
 advance(5000);expect(e.state!.task).toBeNull();expect(e.warnings).toEqual(['broken']);e.warn('broken');expect(e.warnings).toHaveLength(1);
 e.state!.durability.wooden_pickaxe=20;e.state!.veins.stone=1;run('/mine stone');advance(5000);expect(e.state!.veins.stone).toBe(0);
});
test('independent furnaces and duplicate building IDs',()=>{
 const {e,run,advance}=setup();e.state!.inventory={planks:4,cobblestone:16};run('/create workbench 1');run('/create furnace 2');expect(e.command('/create furnace 2')).toContain('[ERROR]');run('/create furnace 3');
 const [,a,b]=e.state!.facilities;a.input=2;a.fuel=2;b.input=1;b.fuel=1;advance(20000);expect([a.output,b.output]).toEqual([2,1]);
});
