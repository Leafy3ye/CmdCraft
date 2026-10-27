# Cmdcraft v0.1

纯命令行文字生存游戏，原创文字与规则实现。Node.js 20+，无需 Minecraft 或服务器。

## 安装

Windows CMD、PowerShell、Windows Terminal：
```
cd cmdcraft
npm install
npm run local
```
Linux/macOS 使用相同命令。输入 /quit 退出，Ctrl+C 安全保存。

开发验证：npm test、npm run typecheck、npm run build。
英文文档见 [README.en.md](README.en.md)。

## 开始游戏

默认中文，/lang en-US 切换英文，/lang zh-CN 切回中文。
/save create world1 创建世界，/save list 列出世界，/save load world1 切换世界，
/save info world1 查看元数据，/save 立即保存。

所有命令用英文 ID，/help 查看命令。数量为正整数。
/craft 的数量是配方批数，/create 的数字是建筑唯一编号。

推荐路线（等待行动完成后再执行下一步）：

1. /gather wood 开始砍树，约一分钟后 /gather stop。
2. /craft planks 12、/craft sticks 4、/create workbench 1。
3. /craft wooden_pickaxe、/equip wooden_pickaxe。
4. /mine stone，/mine status 查询，获得约 20 圆石后 /mine stop。
5. /craft stone_pickaxe、/equip stone_pickaxe。
6. /explore forest，等待八秒；/map、/enter cave 1、/survey。
7. /mine iron，获得至少三粗铁后 /mine stop。
8. /mine coal，获得至少三煤炭后 /mine stop、/return。
9. /create furnace 2、/furnace 2、/put input raw_iron 3、/put fuel coal 3。
10. /back、/list 查看设施。可以 /quit，十秒一锭，离线也推进。
11. 重启后 /save load world1、/furnace 2、/take output iron_ingot 3。
12. /craft iron_pickaxe、/equip iron_pickaxe。

/inventory 查看背包；/recipes 与 /recipe furnace 查看配方。
/explore cave 或 /path 1 探索铜矿分支。
/create chest 3、/chest 3 进入箱子，使用
/put storage logs 2、/take storage logs 2 存取。
/back 离开设施上下文。设施仅营地可用。
背包和箱子均有 27 格，每格 64 件。
一煤炼一铁。工具损坏后可以重新制作。

## 时间与存档

主动任务只在当前已加载世界运行期间推进，切换或重载世界取消未完成主动任务，
不补发离线采集。熔炉每个实例独立推进，受燃料、输入、64 件输出容量限制。
静态进度不刷新屏幕；仅工具损坏、即将损坏、资源耗尽和背包已满主动警告。
无突然死亡机制。

saves/ 自动创建并被 Git 忽略。JSON 包含版本、种子、时间、背包、耐久、
地点发现、矿脉、设施与任务。临时文件加原子替换保存，损坏文件拒绝加载。
备份时退出程序并复制 saves/。不要同时运行两个进程修改同一存档。

## 当前范围与限制

这是最小可玩实现：单营地、一个保证发现的矿洞、一个铜矿分支；
种子作为未来生成器扩展字段，当前地图布局固定。无战斗、饥饿、农业或三维世界。
语言跟随存档保存，未加载存档启动仍默认中文。设施详情暂用结构化 JSON；
帮助一次展示全部命令，配方按工作台解锁。存档仅接受 v1，未来版本迁移尚待实现。
当前每秒同步写入存档，适合小型世界；未来将优化脏状态保存与跨进程锁。
没有测试过真实 Windows 终端，使用标准 readline 和跨平台 npm 脚本。

下一步：完整渐进命令解锁、设施详情本地化、更多事件与区域、版本迁移、
更完整的存档语义验证、全局语言配置及警告优先级队列。

## 贡献

核心逻辑不依赖终端；测试用注入时钟与随机源验证端到端流程。
物品与配方在 src/data.ts，翻译在 src/i18n.ts。欢迎通过 PR 添加测试与内容。
