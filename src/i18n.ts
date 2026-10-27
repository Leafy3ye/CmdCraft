export type Lang='zh-CN'|'en-US';
export const messages={
welcome:['欢迎来到 Cmdcraft。/help 查看命令；/save create world1 开始。','Welcome to Cmdcraft. /help for commands; /save create world1 to begin.'],
bad:['命令或参数无效。请查看 /help。','Invalid command or arguments. See /help.'],
load:['请先创建或加载存档。','Create or load a save first.'],
ok:['完成。','Done.'],error:['操作失败：','Operation failed: '],
need:['材料、空间、工具或工作台不足，或当前位置不允许。','Missing materials, space, tool or workbench, or wrong location.'],
busy:['请先停止当前任务。','Stop the current task first.'],
broken:['工具损坏，采矿停止。','Tool broken; mining stopped.'],
full:['背包已满，采集停止。','Inventory full; gathering stopped.'],
empty:['矿脉耗尽。','Vein depleted.'],
low:['工具即将损坏，可 /mine stop 后 /return。','Tool nearly broken. Use /mine stop then /return.'],
discover:['发现山地与浅层矿洞 #1。石壁上有陌生刻痕。','Discovered mountains and shallow cave #1. Unfamiliar marks scar the wall.'],
branch:['通道深处发现铜矿；远方传来沉闷的回声。','Copper discovered in the passage; a dull echo rises far away.'],
camp:['森林营地','Forest camp'],cave:['浅层矿洞','Shallow cave'],idle:['空闲','Idle'],active:['进行中','Active'],
help:['/help /lang zh-CN|en-US /save [list|create NAME|load NAME|info NAME] /quit\n/status /inventory /map /gather wood /explore forest|status|cave /enter cave 1 /survey /path 1 /return\n/recipes /recipe ID /craft ID 批数 /create ID [编号] /equip ID\n/mine stone|coal|copper|iron|status|stop /list /furnace 编号 /chest 编号\n/put input|fuel|storage ID 数量 /take output|storage ID 数量 /back\n/gather stop 停止主动任务。制作数量为批数；/recipe 显示每批产量。','/help /lang zh-CN|en-US /save [list|create NAME|load NAME|info NAME] /quit\n/status /inventory /map /gather wood /explore forest|status|cave /enter cave 1 /survey /path 1 /return\n/recipes /recipe ID /craft ID BATCHES /create ID [NUMBER] /equip ID\n/mine stone|coal|copper|iron|status|stop /list /furnace NUMBER /chest NUMBER\n/put input|fuel|storage ID COUNT /take output|storage ID COUNT /back\n/gather stop stops the active task. Craft quantities are batches; /recipe shows yields.']
} satisfies Record<string,[string,string]>;
export type Key=keyof typeof messages;
export const tr=(lang:Lang,key:Key)=>messages[key][lang==='zh-CN'?0:1];
