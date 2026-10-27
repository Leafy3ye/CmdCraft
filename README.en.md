# Cmdcraft v0.1

An original command-line survival game for Node.js 20+. No Minecraft installation,
server, GUI or database is required.

On Windows CMD, PowerShell, Windows Terminal, Linux or macOS:
```
cd cmdcraft
npm install
npm run local
```

Use /lang en-US, /save create world1 and /help. /quit or Ctrl+C saves.
Run npm test, npm run typecheck and npm run build for validation.

## Play

Gather wood with /gather wood, wait a minute, then /gather stop.
Craft /craft planks 12 and /craft sticks 4. Build /create workbench 1.
Craft and equip wooden_pickaxe. /mine stone yields cobblestone; stop with /mine stop.
Craft and equip stone_pickaxe after collecting 20 stone.
Explore with /explore forest, wait eight seconds, /enter cave 1 and /survey.
Mine iron and coal (at least three each), stopping each task before starting another.
Return with /return, build /create furnace 2, enter /furnace 2.
Use /put input raw_iron 3 and /put fuel coal 3. Each coal smelts one iron in ten seconds.
Use /back and /list to inspect facilities. Quit and reload with /save load world1:
furnaces advance offline. /furnace 2 then /take output iron_ingot 3 lets you
/craft iron_pickaxe and /equip iron_pickaxe.

Craft counts are batches; /recipe ID shows costs and yield.
Building numbers are unique identifiers, not quantities.
/inventory, /recipes, /map and /status inspect snapshots.
/path 1 explores the cave branch. /create chest 3 and /chest 3 open storage:
/put storage logs 2 and /take storage logs 2 transfer items. /back leaves context.
Inventories have 27 slots, stacking 64 items per slot.

## Saves and scope

/save list, /save info NAME, /save load NAME and /save manage local JSON worlds.
saves/ is automatically created and ignored by Git. Back it up while the game is
closed. Never run concurrent processes against the same save.
Writes use temporary files and atomic replacement. Corrupt saves are rejected.
Active tasks stop on reload without offline rewards. Furnaces settle independently
and cannot exceed their materials, fuel or output capacity.

The current fixed map has one camp, one guaranteed cave and one copper branch.
Seeds are reserved for future generation. No combat, farming, hunger or sudden death.
Only important warnings interrupt input; progress is a static query.
Language is stored per world, but the unloaded startup defaults to Chinese.
Facility details currently use JSON. Help exposes all commands; recipes unlock with
the workbench. Version migration, richer semantic validation, global language settings,
warning priorities, progressive command discovery and fully localized facility details
remain future work. Saves currently write synchronously each second.
Real Windows terminal validation has not been performed.

Tests inject time and randomness, including the complete wood-to-iron-tool loop.
Data lives in src/data.ts and translations in src/i18n.ts. Contributions welcome.
