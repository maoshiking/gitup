# 虚空坠落 - 项目技能文件

## 项目概述
"虚空坠落"是一款网页端躲避生存游戏。玩家拖动鼠标控制"坠落者"在虚空中躲避各种敌人，利用道具生存尽可能长的时间。

## 助手行为准则（严格执行）

### 任务处理规则
1. **需求不明确时**：当我（Claude）对任务产生多条思考路线、感到模棱两可时，必须立即停止思考，主动向用户提问确认具体怎么做，不做无用功。
2. **保持专一**：绝不做用户需求以外的任何任务，保持任务处理的专一性。
3. **风格设计**：涉及颜色调配、文字等风格设计时，停止自行决策，向用户推荐三种搭配风格让用户选择。
4. **修改汇报**：修改文件后，以表格形式展示本次修改内容，清晰明了。

### 代码质量要求
1. **角色定位**：扮演专业前端开发程序员，沉着冷静，善于明辨是非，绝不允许 bug 出现。
2. **框架限制**：代码不使用 Vue 等框架，使用原生 JavaScript，保持通俗易懂。
3. **自测要求**：每次完成任务后自行跑一遍逻辑，确保不会崩溃或无法运行。

## 版本信息
- 当前版本：V1.8（2026年6月11日）
- 版本号显示在 `虚空坠落.html` 第78行 `#version-display`

## 核心文件结构

| 文件 | 用途 |
|---|---|
| `虚空坠落.html` | 主页面，包含菜单布局、游戏画布、HUD、弹窗 |
| `js/index.js` | 主逻辑：游戏循环、菜单、成就、音频、设置、调试面板、存档系统、怪物档案 |
| `js/fantasy.js` | 精英怪：浪人(菱形)和公牛(三角形)的逻辑 |
| `js/items.js` | 道具系统：爱心、炸弹、激光枪、冰霜、辣椒的完整逻辑 |
| `css/index.css` | 全部样式，包括菜单、弹窗、HUD、动画 |

## 存档系统（v1.8 新增）

### 数据结构
- 存储键名：`voidSaveSlots` — 存 `[slot|null, slot|null, slot|null]` 数组
- 每档数据结构：`{ name, playerName, time, data: { playerData, gameLog, achievements, bestTime, bestPoints, musicTime, musicTracks, settings, debugUnlocked } }`
- settings 和 debugUnlocked 随存档独立保存，切换存档时自动恢复该档的音量设置、光标隐藏、音乐速率、调试面板解锁状态
- 活动存档索引：`voidActiveSlot` — 存数字索引（默认 0）

### 核心函数
- `loadSaveSlots()` / `saveSaveSlots(slots)` — 读写三个存档位
- `getActiveSlot()` / `setActiveSlot(idx)` — 获取/设置当前使用的存档索引
- `ensureDefaultSaveSlot()` — 首次访问时检测所有存档位是否为空，自动创建默认存档（玩家名"虚空旅人"）并设置当前活跃存档
- `saveSlotInfo(index)` — 同时保存存档名和玩家名（合并保存按钮）
- `saveToSlot(index)` — 手动覆盖保存当前所有数据到指定存档位（含 settings 和 debugUnlocked）
- `deleteSlot(index)` — 删除指定存档位
- `useSlot(index)` — 加载使用指定存档（或新建开档），恢复该存档的 settings/debugUnlocked 到全局变量
- `autoSave()` — 自动保存到当前活动存档（数据改变时触发），包含当前 settings 快照
- `buildSaveSlotHTML()` — 构建存档管理弹窗的 HTML

### 自动存档触发场景
- `endGame()` 游戏结算 → 点数/积分
- `buySkin()` / `equipSkin()` 商城操作
- 每日签到
- `unlockAchievement()` 成就解锁
- 清除本地数据

### 自动存档提示
- 左下角绿色"保存中"文本（`showSaveToast()`），1.2秒后自动淡出

### 关键注意
- 空存档调用 `useSlot()` 会触发新建开档（清空所有数据 + 重新加载页面）
- `saveToSlot()` 会在成功保存后自动调用 `setActiveSlot(index)`
- 清除本地数据时保留存档位（不清除 `voidSaveSlots`），只重置活动存档索引
- **设置独立于存档**：音量设置（musicVol/sfxVol）、光标隐藏（hideCursor）、音乐速率（musicRate）、调试面板解锁状态（debugUnlocked）均按存档独立保存和恢复，切换存档时自动切换为对应设置
- **自动创档**：用户首次打开游戏（所有存档位为空）时，`ensureDefaultSaveSlot()` 自动创建默认存档，玩家名"虚空旅人"，无需手动新建

## 菜单结构

### 主菜单导航（`#menu-nav-list`）
```
每日签到 → openCheckinModal()
存档 → data-modal="saveslot"（与每日签到同级，v1.8 从设定移出）

▼ 百科大全
  游戏规则 → data-modal="rules"
  档案 → openArchive('monster'/'item')

▼ 统计内容（有新成就/排名时"新内容!"跳动）
  个人排名 → data-modal="pai"
  游戏日志 → data-modal="gamelog"
  成就系统 → data-modal="achievement"

▼ 娱乐中心
  音乐厅 → openMusicHall()
  皮肤商城 → openShopModal()

▼ 设定
  更新日志 → showVersionLog()
  联系站主 → data-modal="contact"
  设置 → openSettings()
```

### 统计内容通知
- `#stats-cat-notify` 红字跳动提示，有未查看的成就或排名时显示
- `updateStatsCategoryNotify()` 同步 `#rank-badge` 和 `#ach-badge` 的可见性

## 道具系统（items.js）

### 架构概览
```
┌─ 三线程刷新 ──────────────────┐
│  爱心(35s) → spawnHeal()       │
│  武器(18s) → spawnWeapon(n)    │
│  冰霜(25s) → spawnFrost()      │
└────────────────────────────────┘
         ↓
┌─ Pending(1s闪烁) → 落地 ──────┐
│  itemPending[] 倒计时1秒后转入  │
│  items[] 正式生成，附带水波特效  │
└────────────────────────────────┘
         ↓ 拾取
┌─ Effect 系统 ──────────────────┐
│  addEffect(type, duration)     │
│  → activeEffects[] 数组        │
│  → itemUpdate() 每帧 dt 倒扣   │
│  → ef.timer ≤ 0 → 触发对应函数 │
└────────────────────────────────┘
```

### 三线程刷新机制
- **爱心线程**：间隔 35s，生效概率 `getHealChance()`（简单1.0/普通0.8/困难0.6）
- **武器线程**：间隔 18s，调用 `getWeaponCount()` 决定刷 1~3 把
- **冰霜线程**：间隔 25s，生效概率 `getFrostChance()`（同爱心）
- **开局首刷**：`doInitialSpawns()` 按难度概率各刷一个（简单必定全部出）
- **Pending 预告**：刷新点位闪烁 `?` 1 秒后落地，附带水波扩散特效

### 武器池权重
```js
// getWeaponDefs() 收集所有启用的武器定义
武器权重：炸弹(4) + 激光(4) + 辣椒(2) = 10
刷新概率：炸弹40%  激光40%  辣椒20%

// getWeaponCount() 决定单次刷新数量（按难度）
简单：25%出1把，50%出2把，25%出3把
普通：50%出1把，30%出2把，20%出3把
困难：65%出1把，25%出2把，10%出3把
```

### Effect 系统（多道具并行）
- `addEffect(type, duration)` → push 到 `activeEffects[]`，获得唯一 `id`
- `itemUpdate()` 每帧对所有 effect 做 `timer -= dt`
- 冰冻期间非 frost 的 effect 暂停计时（`if (frostFreeze && ef.type !== 'frost') continue`）
- 计时归零 → 按 `ef.type` 路由到对应 trigger 函数
- UI 能量条：`#effect-bars` 冒泡堆叠显示，每格有独立颜色+文字+进度条

### 无敌帧系统
- **全局提前量**：`invincibleLeadTime = 0.3s`（调试面板可调 0~0.5s）
- 武器类 effect（bomb/laser/pepper）在剩余时间 ≤ 提前量时触发 `player.invincible = true`，持续 1.5s
- 部分 trigger 函数底部补发无敌帧（当 `invincibleLeadTime <= 0` 时兜底）

### 武器通用生命周期
```
拾取 → addEffect(type, 3) → 3秒倒计时
                              ├─ 头顶渐变倒计时（绿→黄→红）
                              ├─ UI能量条实时更新
                              └─ ef.timer ≤ 0.3 → 无敌帧触发
                                         ↓
                              triggerXxx()
                              ├─ 记录击杀前状态 prev
                              ├─ 遍历敌人数组碰撞检测
                              ├─ 更新 killStats
                              ├─ 成就标记
                              ├─ createKillPopup()
                              └─ 播放音效 + 无敌帧
```

### 各武器详细机制

| 武器 | 触发效果 | 范围/攻击方式 | 特殊机制 |
|---|---|---|---|
| 强力炸弹 | 3秒引爆 | 圆形范围，中心在玩家 | 范围受难度影响（简单100%/普通40%起/困难20%起），每拾取+10%范围 |
| 迷你激光枪 | 3秒发射 | 四方向十字矩形，全屏穿透 | 7色随机，轨道光球旋转指示方向 |
| 火爆辣椒 | 3秒爆炸 | 原地生成火焰圈，持续5秒 | 火焰圈烧伤敌人+玩家，半径可调试(1~3倍) |
| 猫狮的祝福（爱心） | 立即恢复 | — | 回1心+1.5s无敌帧，满血提上限+1 |
| 寒冰蘑菇 | 立即冻结 | 全屏冻结1.5秒 | 冻结束减速80%持续15秒，其他effect暂停 |

### 击杀弹出系统（killPopups）
- **普通怪**：计数器 popup，颜色随数量变（绿<20 / 黄<40 / 红≥40）
- **精英怪**："击杀浪人!"/"击杀公牛!" 文字飘散
- 弹出位置围绕玩家或辣椒火焰圈中心，角度错开避免重叠
- 辣椒的击杀弹出可叠加（相同 source 累加 targetCount）

### UI 通知系统
| 组件 | 位置 | 说明 |
|---|---|---|
| `#effect-bars` | HUD顶部 | 能量条+文字，关联 activeEffects |
| 头顶倒计时 | 玩家头顶 canvas | 渐变+抖动，最近武器剩余时间 |
| `#item-spawn-notify` | HUD | 红色"?"闪烁预告 |
| `#item-status` | HUD | 拾取提示文字（6秒消失） |
| `#item-status-name` | HUD | 拾取道具名称 |
| `#bomb-range-bonus` | HUD | 炸弹范围加成百分比 |

### 道具成就追踪（itemAchFlags）
```js
var itemAchFlags = {
    usedHeal, healOverflow,          // 爱心
    bombKilledRonin, bombKilledBull, bombOneShot100,  // 炸弹
    laserKilledRonin, laserKilledBull,  // 激光
    usedFrost, frostKillN30, frostKillR, frostKillB, frost3Bulls,  // 冰霜
    usedPepper, pepperDouble, pepperTriple, pepperFrostKill, pepperBombActive,  // 辣椒
    pickedTypes: {}                   // 全道具收集
};
// endGame() 中读取这些 flags 触发对应的成就解锁
```

### 调试参数（localStorage 持久化）
| Key | 默认值 | 说明 |
|---|---|---|
| `voidInvincibleLead` | 0.3 | 无敌帧提前秒数 |
| `voidPepperFireRadius` | 1.5 | 辣椒火焰半径倍率 |
| `voidItemFilter` | null | 道具筛选数组，null=全部启用 |

## 新增道具接入指南

道具按类型分三类：**恢复类**、**武器类**、**辅助类**，三类道具的接入要求不同。

### 恢复类（Heal）

**现有成员**：猫狮的祝福（爱心）

**特点**：即时生效，不经过 effect 系统，拾取立即产生效果。

**接入清单**：
```
□ itemDefs[] 条目          type: 'instant'，无 duration
□ itemImages[] 图片加载
□ drawItem() else if 分支   兜底形状函数 drawXxxShape()
□ 拾取逻辑                  onPickup: function() { ... }
□ 道具档案介绍               modalData.item_archive
□ 刷新权重                  修改 itemDefs[] 中的 weight
□ 恢复线程 spawn 逻辑         spawnHeal() / getHealChance()
```

**示例**（爱心拾取逻辑）：
```js
onPickup: function() {
    player.invincible = true;
    if (lives < maxLives) { lives++; }
    else { maxLives++; lives++; }
}
```

---

### 武器类（Weapon）

**现有成员**：强力炸弹 / 迷你激光枪 / 火爆辣椒

**特点**：计时倒计时 3 秒，经过 effect 系统，有击杀逻辑，需要 UI 渲染。

**接入清单**：
```
□ itemDefs[] 条目          type: 'timed', duration: 3, weight: N
□ itemImages[] 图片加载
□ drawItem() else if 分支   兜底形状函数 drawXxxShape()
□ onPickup → addEffect('xxx', 3)     加入 effect 系统
□ itemUpdate() 计时归零路由    ef.type === 'xxx' → triggerXxx()
□ triggerXxx() 函数        击杀逻辑（遍历敌人 + 碰撞检测 + 粒子 + 音效）
□ killStats 注册           声明 + itemReset() 重置
□ itemRender() 渲染分支      力场 / 倒计时 / 特效
□ drawXxxField()           武器专属 UI（力场光晕等）
□ 无敌帧                    由 invincibleLeadTime 通用处理
□ 道具档案介绍               modalData.item_archive
□ 刷新权重                  在 getWeaponDefs() 中权重
□ 武器线程 spawn 逻辑         spawnWeapon() + getWeaponCount()

--- 仅首次新增时（index.js）---
□ recordGame() 累加         entry.kills.xxx 保存到存档
□ buildLogSection() 展示     日志页面击杀统计
□ getGameLogHTML() 总击杀    汇总统计
□ 道具颜色分支               rebuildEffectBars() + updateEffectBarText()
□ 成就定义                   achievements[] + getAchProgress() + itemAchFlags
□ 调试参数（可选）            debugParams + localStorage
```

**通用触发函数模板**：
```js
function triggerXxx() {
    var prev = { normal: killStats.xxx.normal, ronin: ..., bull: ... };
    // 遍历 holes / ronins / bulls → 碰撞检测 → 击杀
    // spawnDeathParticles() + killStats.xxx.*++ + addKillPoints()
    var dN = killStats.xxx.normal - prev.normal;
    var dR = killStats.xxx.ronin - prev.ronin;
    var dB = killStats.xxx.bull - prev.bull;
    if (dN+dR+dB > 0) createKillPopup(dN, dR, dB);
    playSfx(sfxXxx);
    // 成就标记
    // 补发无敌帧
}
```

**UI 颜色约定**：
```js
// rebuildEffectBars() 中
barFill.style.background = ef.type === 'xxx' ? '#HEX' : ...
var tColor = ef.type === 'xxx' ? '#HEX' : ...

// updateEffectBarText() 中
var name = ef.type === 'xxx' ? '中文名' : ...
var suffix = ef.type === 'xxx' ? '秒后爆炸' : ...
```

**固定成就模板（每把武器 7 个）**：

累计击杀成就（4 个）— `getAchProgress()` 中加对应进度显示：
```js
{ id: 'xxx_n250',  name: '…', desc: '累计击杀500只普通怪', check: () => totalXxxNormal() >= 500 }
{ id: 'xxx_n1000', name: '…', desc: '累计击杀2000只普通怪', check: () => totalXxxNormal() >= 2000 }
{ id: 'xxx_r50',   name: '…', desc: '累计击杀50只浪人',   check: () => totalXxxRonin() >= 50 }
{ id: 'xxx_b50',   name: '…', desc: '累计击杀50只公牛',   check: () => totalXxxBull() >= 50 }
```

场景成就（3 个）— 在 itemAchFlags 注册 + triggerXxx() 中标记 + endGame() 中解锁：
```js
// itemAchFlags 新增
xxxKilledRonin: false, xxxKilledBull: false, xxxOneShot100: false

// triggerXxx() 标记
if (dR > 0) itemAchFlags.xxxKilledRonin = true;
if (dB > 0) itemAchFlags.xxxKilledBull = true;
if (dN >= 100) itemAchFlags.xxxOneShot100 = true;

// endGame() 解锁
if (itemAchFlags.xxxKilledRonin) unlockAchievement('xxx_kill_r');
if (itemAchFlags.xxxKilledBull)  unlockAchievement('xxx_kill_b');
if (itemAchFlags.xxxOneShot100)  unlockAchievement('xxx_100shot');
```

> 辣椒是豪华版（普通4级+浪人4级+公牛4级），新武器默认走炸弹/激光的 2+1+1 标准模板。

---

### 辅助类（Utility）

**现有成员**：寒冰蘑菇

**特点**：特殊机制，不一定是计时器，可能有全局效果（冻结/减速等），也可能通过 effect 系统管理。

**接入清单**：
```
□ itemDefs[] 条目          type: 'timed' 或 'instant'
□ itemImages[] 图片加载
□ drawItem() else if 分支   
□ onPickup → 触发效果
□ 效果函数（如 triggerFrost()）   全局效果逻辑
□ 渲染函数（如 renderFrostMushroom()）   专属 canvas 渲染
□ 状态管理                   全局变量/effect 系统
□ 道具档案介绍
□ 刷新权重
□ 辅助线程 spawn 逻辑         spawnFrost() / getFrostChance()
□ 成就追踪                   itemAchFlags
```

**辅助类扩展方向**：
- **全局 buff**（加速/护盾/闪避）
- **敌人 debuff**（减速/混乱/弱化）
- **地形改变**（围墙/传送门/黑洞吸怪）
- **资源增益**（点数倍增/掉落率提升）

---

### 分类对比

| 维度 | 恢复类 | 武器类 | 辅助类 |
|---|---|---|---|
| 生效方式 | 即时 | 计时倒计时 | 即时/计时 |
| Effect 系统 | 不使用 | 必须使用 | 可选使用 |
| 击杀逻辑 | 无 | 必须 | 可能无 |
| killStats | 不涉及 | 必须注册 | 不涉及 |
| Canvas 渲染 | 无 | 力场/倒计时 | 专属渲染函数 |
| 刷新线程 | 爱心线程(35s) | 武器线程(18s) | 辅助线程(25s) |
| spawn 函数 | spawnHeal() | spawnWeapon()→getWeaponDefs() | spawnFrost() |
| 开局首刷 | doInitialSpawns 中 | doInitialSpawns 中 | doInitialSpawns 中 |

## 怪物系统

### 怪物档案（`modalData.monster_archive`）
保存在 `modalData` 对象中，通过 `openArchive('monster')` 打开。

### 普通怪 — 虚空
- 渲染：实心彩色圆点，白色细边
- 颜色：紫(#c084fc/#a855f7/#e879f9)、青(#22d3ee/#38bdf8/#06b6d4)、粉(#f472b6/#fb7185)、金(#fbbf24/#f59e0b/#fb923c) 随机
- 体积：小（`r = 2 * unitSize`）
- 行为：追逐玩家，每15秒加速10%，存在20秒后自动消失
- 生成：均匀分布在屏幕四边，距离玩家至少 10*unitSize

### 浪人 — 菱形精英怪
- 渲染：菱形（旋转正方形），中心"浪"字，金色闪电光晕
- 颜色状态：追逐=金色(#fbbf24)、锁定=金→红渐变、冲撞=红色(#ef4444)、眩晕=绿色(#22c55e)
- 子弹：红色圆形，四方向射击，每5秒一次
- 行为：无意识游走，移速较慢

### 公牛 — 三角形精英怪
- 渲染：三角形，中心"牛"字，橙色火焰光晕
- 颜色状态：追逐=橙色(#f97316)、锁定=橙→红渐变、突刺=红色(#ef4444)、眩晕=绿色(#22c55e)
- 子弹：蓝色火焰，突刺中发射
- 行为：锁定玩家位置 → 蓄力 → 高速突刺，撞墙眩晕5秒

### 怪物档案预览
- 每个怪物描述框右上角有 56×56 canvas 实时渲染预览
- `drawMonsterPreviews()` 在 `openArchive('monster')` 后被调用
- 普通怪：紫色圆 + 白色细边
- 浪人：金色菱形 + "浪"字
- 公牛：橙色三角形 + "牛"字

## 游戏日志（`gameLog`）

### 数据结构
```javascript
{
  easy: { plays, bestTime, pts, score, bestPts, bestScore, deaths: {}, kills: {...} },
  normal: { ... },
  hard: { ... }
}
```
- `bestPts` / `bestScore` — 单局最高点数和最高积分（v1.8 新增）
- 存储键名：`voidGameLog`
- `recordGame(diff, survived, cause)` 记录每局数据
- `buildLogSection(key, title, ...)` 构建单难度显示 HTML

### 显示
- `getGameLogHTML()` 生成游戏日志弹窗内容
- 包含：总场次、总点数、总积分、总死亡统计、总击杀统计
- 各难度独立区块显示：次数、最佳时间、点数/积分、单局最高点数/积分、死亡统计、道具击杀

## 成就系统

### 成就类型
- 场景成就：`check: function() { return false; }`，在 `endGame()` 等场景手动 `unlockAchievement(id)`
- 累计成就：check 函数实时读取 `gameLog`/`playerData`
- 进度显示：`getAchProgress(id)` 函数（支持带参数 count 的成就）

### 列表
成就定义在 `achievements[]` 数组中（index.js 第208-328行），共约70+个成就。

### v1.8 新增成就
- `catlion_name` — "猫狮大王来也"：将存档玩家名命名为"猫狮"时解锁

### 成就触发位置
- `endGame()` 检查：排名、首局、边缘触碰、静止、见精英怪、道具使用等
- `unlockAchievement()` 触发 toast 通知 + 更新角标
- `newAchievements[]` 追踪本次会话新解锁的成就
- 跨文件追踪：`itemAchFlags` (items.js) → `endGame()` (index.js) 检查解锁

## 击杀统计

### 跨武器 × 怪物分类
```javascript
killStats = { bomb: { normal: 0, ronin: 0, bull: 0 },
              laser: { normal: 0, ronin: 0, bull: 0 },
              pepper: { normal: 0, ronin: 0, bull: 0 } }
```
- `recordGame()` 累加到 `gameLog[diff].kills`
- `endGame()` 结算界面展示 + `buildLogSection()` 游戏日志展示

### 击杀统计的三处展示位置

1. **战斗内弹出**（`createKillPopup()`）：每次武器触发时，在玩家/火焰圈位置生成浮动计数
   - 普通怪：递进数字 `x1 → x2 → x43`，颜色绿→黄→红
   - 精英怪："击杀浪人!"/"击杀公牛!" 文字飘散
   - 辣椒击杀可叠加累计（同源 counter 累加 targetCount）

2. **结算界面**（`endGame()`）：游戏结束后弹出面板，按武器分行显示
   ```
   击杀统计
   💣炸弹: 普通43 浪人2 公牛1
   ⚡激光: 普通28 浪人1 公牛0
   🌶辣椒: 普通67 浪人3 公牛2
   ```

3. **游戏日志**（菜单→统计内容→游戏日志）：按难度分类的永久记录
   - 每局独立记录 `gameLog[diff].kills`
   - 日志底部汇总所有难度总击杀

### 击杀点数（killPoints）
```js
// 普通怪：简单1/普通2/困难5
// 精英怪：简单10/普通15/困难30
addKillPoints(isElite)  // → rankPoints += pt
```
- 击杀点数反馈到 `#rank-points-display`，带抖动动画

## 全局变量跨文件访问
- index.js 先加载，fantasy.js 和 items.js 后加载
- items.js 中引用 `player`, `holes`, `ronins`, `bulls`, `gameCanvas`, `ctx` 等全局变量
- 使用 `typeof xxx !== 'undefined'` 守卫访问后加载文件的变量

## 弹窗系统（`modalData`）
弹窗内容中心化管理在 `modalData` 对象中（index.js 第31行起），包含：
- `archive` — 档案入口（怪物/道具选择）
- `monster_archive` — 怪物图鉴 + 实时渲染预览
- `item_archive` — 道具图鉴
- `rules` — 游戏规则

## 更新日志（`showVersionLog()`）
- 弹窗显示历史版本记录（V1.0 ~ V1.8）
- 位置：index.js 第2811行起
- 每次大版本更新在顶部插入新的版本条目

## 调试与 Bug 修复
- **遇到 bug 第一反应：让用户按 F12 看控制台红色报错！**
- 常用断点位置：`gameLoop()` 函数、`itemUpdate()` 函数
- 调试面板解锁密码：`20061121`（设置页）

## 历史 Bug 记录（共 20 个，按严重程度排序）

### Bug 1：冰冻蘑菇导致游戏卡死（最严重）
- **现象**：蘑菇爆炸后游戏完全冻结，无法继续
- **根因**：`items.js` 中 `for` 循环缺少 `{}`：
  ```js
  // 错误写法
  for (var h = 0; h < holes.length; h++) holes[h].frostSlow = 15; holes[h].frostSlowAmt = 0.2;
  //                                                              ↑ 循环到此结束
  //                                                                holes[h].frostSlowAmt 在循环外，
  //                                                                h = holes.length，访问 undefined.frostSlowAmt 报 TypeError
  ```
- **解决**：加花括号 `{}` 确保两行赋值都在循环体内
- **F12 报错**：`Cannot set properties of undefined (setting 'frostSlowAmt')`

### Bug 2：UI 重设计后游戏无法开始
- **现象**：点击"开始坠落"后游戏不启动
- **根因**：`stopMusicHall()` 中 `document.getElementById('music-hall-btn').classList` 访问了 HTML 重设计时已移除的元素，TypeError 阻止 `startGameMusic()` 和 `beginPlay()` 执行
- **解决**：加 null 守卫：`var _mhBtn = document.getElementById('music-hall-btn'); if (_mhBtn) _mhBtn.classList.remove('spinning');`

### Bug 3：每日签到奖励翻倍
- **现象**：签到获得 200 点数、+2 天（应为 100/+1）
- **根因**：两个相同事件处理器同时绑定 — `data-modal="checkin"` 弹窗系统 + `openCheckinModal()`，两者同时触发
- **解决**：移除 HTML 中的 `data-modal="checkin"`，让弹窗系统 handler 统一委托给 `openCheckinModal()`

### Bug 4：辣椒击杀未记录到游戏日志
- **现象**：辣椒击杀数在游戏日志中丢失
- **根因**：旧存档 `entry.kills` 没有 `pepper` 字段，`entry.kills.pepper.normal += 1` 访问 undefined 报错
- **解决**：在 `recordGame()` 中添加兜底：`if (!entry.kills.pepper) { entry.kills.pepper = { normal: 0, ronin: 0, bull: 0 }; }`

### Bug 5：多个辣椒共享击杀计数器
- **现象**：后触发的辣椒覆盖之前辣椒的击杀计数
- **根因**：`pepperFire` 是单一变量，新辣椒直接覆盖旧值
- **解决**：改为 `pepperFires[]` 数组，每个辣椒有唯一 `_fireId`

### Bug 6：多个辣椒同时到期全部清除
- **现象**：一个辣椒到期导致所有辣椒火焰同时消失
- **根因**：效果过期处理 `pepperFire = null` 清除了全部辣椒
- **解决**：按 `_fireId` 精确移除：`pepperFires = pepperFires.filter(function(f) { return f._fireId !== fireId; })`

### Bug 7：怪物移速显示 NaN
- **现象**：HUD 中"普通怪移速"显示为 `NaN u/s`
- **根因**：`chaseSpeed` 在 `if (!frostActive)` 块内声明，冰冻期间 `frostActive = true` 跳过该块，外部读取为 undefined
- **解决**：在执行条件块之前预先声明：`var chaseSpeed = 16 * unitSize;`

### Bug 8：版本日志语法错误
- **现象**：版本日志 JS 字符串断裂
- **根因**：文本中 `chengj` 包含未转义的单引号
- **解决**：修正文本中的引号

### Bug 9：成就总数对不上
- **现象**：显示"88个"成就，实际只数出 78 个
- **根因**：漏数 `pts_1600`（天下无敌）和 `pts_2000`（神明在世）
- **解决**：补全计数

### Bug 10：成就进度显示数字错误
- **现象**：修改成就阈值后进度显示仍为旧数值
- **根因**：`getAchProgress()` 中硬编码数值未同步更新
- **解决**：逐一核对所有 `getAchProgress()` 与成就定义中的阈值，全部对齐

### Bug 11：音乐厅柱状图静止不动
- **现象**：音乐厅频率柱状图不跳动
- **根因**：CSS 中 `@keyframes barDance` 动画从未定义
- **解决**：在 `css/index.css` 中添加 `barDance` 关键帧动画

### Bug 12：公牛突刺太快子弹来不及发射（v1.5 新增）
- **现象**：公牛进入突刺状态后瞬间到达目标，一轮子弹都射不出
- **根因**：突刺速度 8000 u/s，锁定距离仅约 320 单位，突刺耗时约 0.04 秒，远小于子弹发射间隔 0.4 秒
- **解决**：逐步降速（8000→1000→400→200→240 u/s），增大锁定距离（5→10→100→150 单位），最终改为撞墙才停止（取消距离目标判定），保证冲锋路径足够长
- **教训**：设计高速移动 + 定时触发的组合机制时，必须确保移动持续时间 >= 触发间隔的倍数

### Bug 13：公牛 chargeVy 速度值不同步（v1.5 新增）
- **现象**：公牛突刺方向明显偏斜，不是直冲锁定位置
- **根因**：用 replace_all 将 `* 100;` 替换为 `* 400;` 时，匹配模式只覆盖了 chargeVx 行（其后紧跟 chargeVy 行），chargeVy 行末尾上下文不同未被匹配
- **解决**：后续重写整个锁定→充能代码块时一并修正
- **教训**：replace_all 对结构相似但上下文不同的相邻行可能漏替换，敏感数值修改后应 grep 验证所有出现位置

### Bug 14：Edit 工具对含特殊字符的字符串匹配失败（v1.5）
- **现象**：index.js 中包含 emoji/特殊符号的行，Edit 工具反复报 "String to replace not found"
- **根因**：Edit 工具的字符串匹配引擎对某些 Unicode 字符存在编码差异
- **解决**：改用纯 ASCII 子串作为匹配目标（如 `浪人每<b>30s</b>生成(上限<b>4</b>)`），避开特殊字符
- **教训**：Edit 匹配模式优先使用 ASCII 安全字符，涉及特殊符号的字符串先 grep 确认可匹配性

### Bug 15：Edit 工具因 tab/空格缩进不匹配导致编辑失败（v1.8）
- **现象**：对 items.js 中 `rebuildEffectBars` 的多行块做编辑时，Edit 反复报 "String to replace not found"
- **根因**：Read 工具显示的行号前缀将 tab 字符转换，导致视觉上看起来一致的缩进，实际文件中是 tab 而 old_string 中用到了空格（或反过来）
- **解决**：不复制多行代码块，改用更短更唯一的单行子串作为匹配目标（如 `var tColor = ef.type === 'bomb' ?`），缩小匹配范围避开缩进问题
- **教训**：多行 Edit 优先选最小唯一子串，不要复制大段代码；tab/空格差异肉眼不可见但 Edit 严格区分

### Bug 16：文件在 Read 和 Edit 之间被外部修改导致匹配失败（v1.8）
- **现象**：对 `drawWeaponCountdown` 函数做 Edit 时，明明刚 Read 的内容却匹配不上
- **根因**：文件的 Read 操作和 Edit 操作之间，linter 或编辑器自动格式化修改了文件内容（缩进/空行/编码），导致 old_string 与当前文件不一致
- **解决**：在 Edit 失败后立即用 Grep 重新读取目标行的当前内容，用最新内容构造 old_string 再次 Edit
- **教训**：Read 和 Edit 之间如果隔了其他操作，先 Grep 确认目标文本当前状态再 Edit

### Bug 17：Edit replace_all 对不同上下文但结构相似的相邻行漏替换（v1.8）
- **现象**：`updatePepperFireParticles` 函数中 `var r, g, b` 三个未使用变量的声明行，删除时担心 match 到其他函数中相似的 var 声明
- **根因**：`var r, g, b;` 是极常见的变量声明模式，项目中多处存在，直接 replace_all 会有副作用
- **解决**：先用 Grep 搜索确认 `r, g, b` 仅在 pepper 粒子函数中出现一次，再安全删除
- **教训**：删除/替换通用模式前必须 grep 全量搜索确认影响范围，确认唯一后再动手

### Bug 18：道具档案编辑因 tab 缩进不匹配连续失败（v1.8）
- **现象**：在 index.js 的 `item_archive` 中添加火爆辣椒介绍，两次 Edit 都报 "String to replace not found"
- **根因**：`modalData.item_archive.html` 是长拼接字符串，缩进使用 3 个 tab，Read 工具的行号前缀让 tab 看起来像空格，导致 old_string 缩进与实际文件不一致
- **解决**：改用只包含内容文字的极短子串（`'冻结期间其他道具计时器暂停。</p><br>"是不是很眼熟?"</div>' +`），不依赖缩进匹配，然后成功
- **教训**：对长拼接字符串的中间位置做 Edit，old_string 越短越安全；内容文字是最可靠的锚点

### Bug 19：未使用变量的清理遗漏（v1.8）
- **现象**：`drawPepperFireParticles` 函数中声明了 `var r, g, b` 但从未使用，JS 不报错但造成代码噪音
- **根因**：从旧代码（`drawDeathParticles` 等）复制模板时残留了颜色分量变量，但本函数使用硬编码颜色值
- **解决**：删除 `var r, g, b;` 这一行；用 Grep 验证无其他引用后安全移除
- **教训**：复制粘贴代码模板后检查残留的未使用变量；JS 引擎不会报 var 未使用的错，需人工审查

### Bug 20：`ensureDefaultSaveSlot()` 引用未初始化变量导致脚本中断（v1.8）
- **错误点**：进入游戏后规则弹窗无法关闭（点击×/背景均无效）
- **原因**：`ensureDefaultSaveSlot()` 在脚本早期（第725行）执行，使用 `JSON.parse(JSON.stringify(settings))`，但 `settings` 变量声明在第3258行（靠后位置），`var` 提升后值为 `undefined`，`JSON.parse(undefined)` 抛出 `SyntaxError: "undefined" is not valid JSON`
- **后果**：脚本执行中断，后续 `closeBtn`/`overlay` 的 click 事件监听器（第1217-1227行）未注册，弹窗无法关闭；同时存档数据中的 settings 字段因传入 `undefined` 被存为 `{musicVol:0,...,_saveTimer:null}` 等畸形值
- **修复**：将 `JSON.parse(JSON.stringify(settings))` 替换为字面量默认值 `{ musicVol: 0.6, sfxVol: 0.6, hideCursor: false, musicRate: 1.0 }`，不依赖未初始化的全局变量

### Bug 分类总结
| 类型 | Bug 编号 |
|------|----------|
| 变量作用域/声明位置错误 | 1, 5, 6, 7, 20 |
| DOM 元素被移除后仍访问 | 2 |
| 事件重复绑定 | 3 |
| 旧数据格式不兼容 | 4 |
| 字符串转义 | 8 |
| 手动计数遗漏 | 9, 10 |
| CSS 动画缺失 | 11 |
| 数值平衡/时序设计缺陷 | 12 |
| replace_all 漏替换 | 13 |
| 工具特殊字符兼容性 | 14 |
| Edit 缩进/编码不匹配 | 15, 18 |
| 外部文件修改干扰 | 16 |
| 通用模式替换确认不足 | 17, 19 |

## 已知关键点（日常开发注意事项）
- 冰冻蘑菇的 `for` 循环必须加 `{}`，否则 `frostSlowAmt` 赋值越界 → 见 Bug 1
- `pepperFire` 已改为数组 `pepperFires[]`，支持多辣椒并存 → 见 Bug 5, 6
- 旧存档 `entry.kills` 可能缺少 pepper 字段，`recordGame` 需要 `if (!entry.kills.pepper)` 兜底 → 见 Bug 4
- 音乐厅 `@keyframes barDance` 必须定义，否则柱状图静止 → 见 Bug 11
- `sfxHealPickup` 等变量在 items.js 定义，index.js 引用时需 `typeof` 守卫
- 存档 `gameLog` 必须包含三个难度键 full structure（`easy/normal/hard`），否则 `recordGame()` 在 `gameLog[key].pts` 处崩溃
- 皮肤 `'default'` 在 `skinDefs[]` 中不存在，默认皮肤必须使用 `'heart'`
- DOM 操作前必须做 null 检查，防止元素被移除后访问报错 → 见 Bug 2
- 修改数据结构时考虑旧存档兼容性，添加兜底字段 → 见 Bug 4
- 高速移动 + 定时触发组合时，确保移动持续时间 >= 触发间隔 → 见 Bug 12
- replace_all 后必须 grep 验证所有目标位置已正确替换，警惕相邻行漏改 → 见 Bug 13
- Edit 工具的 old_string 尽量用纯 ASCII 子串，避开 emoji/特殊 Unicode 字符 → 见 Bug 14
- Edit 多行块必须用最短唯一子串，避免 tab/空格缩进不匹配导致失败 → 见 Bug 15, 18
- Read 和 Edit 之间如有其他操作，先 Grep 确认当前文件状态再 Edit → 见 Bug 16
- 删除/替换通用模式前 grep 全量搜索确认影响范围 → 见 Bug 17
- 复制粘贴代码模板后检查残留的未使用变量 → 见 Bug 19
- 脚本早期执行（顶层调用）不能引用靠后才 var 初始化的变量，即使 var 提升也只有 undefined → 见 Bug 20
- 设置（settings）现在按存档独立保存，`useSlot()` 切换存档时恢复对应 settings，`autoSave()`/`saveToSlot()` 保存当前 settings 快照到存档
- `ensureDefaultSaveSlot()` 中不能引用 `settings` 变量（var 提升但未初始化），必须使用字面量默认值 → 见 Bug 20 修复
