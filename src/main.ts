import readline from 'node:readline';
import {fileURLToPath} from 'node:url';
import {Engine} from './engine.js';
import {Saves} from './save.js';
const engine=new Engine(new Saves(fileURLToPath(new URL('../saves',import.meta.url))));
const rl=readline.createInterface({input:process.stdin,output:process.stdout,prompt:'> '});
console.log('CMDCRAFT\nA survival world inside your terminal.\n'+engine.t('welcome'));rl.prompt();
let closed=false;
function quit(){if(closed)return;closed=true;clearInterval(timer);engine.tick();engine.save();rl.close();}
rl.on('line',line=>{if(line.trim()==='/quit'){quit();return;}console.log(engine.command(line));rl.prompt();});
rl.on('SIGINT',quit);process.on('SIGINT',quit);rl.on('close',()=>{if(!closed)quit();});
const timer=setInterval(()=>{try{engine.tick();const warning=engine.warnings.shift();if(warning){if(process.stdout.isTTY){readline.clearLine(process.stdout,0);readline.cursorTo(process.stdout,0);}console.log('[WARN] '+engine.t(warning));rl.prompt(true);}}catch{console.error('[WARN] '+engine.t('error'));clearInterval(timer);}},1000);
