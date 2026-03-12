---
name: task-chain-completion-flow
description: 任务链的自动检测、手动触发和完成验证流程
---

# 任务链完成流程

## 概述
任务链由多个关联任务组成，完成所有任务后获得徽章奖励。系统支持自动检测已完成行为。

## 任务类型

| 类型 | 触发条件 | 自动检测 |
|------|----------|----------|
| explore_poi | 访问环境标记点 | visitedPOIs.includes(targetId) |
| read_species | 阅读物种资料 | readSpecies.includes(targetId) |
| complete_expedition | 完成探险 | completedExpeditions.includes(targetId) |
| quiz | 完成知识问答 | targetId in completedQuizzes |

## 执行流程

1. **加载任务链**
   - 显示任务链名称和关联环境
   - 显示徽章预览和获取条件

2. **检查任务状态**
   - 遍历所有任务
   - 检查是否已在completedTasks中
   - 检查是否满足自动完成条件

3. **任务交互**
   - 点击任务卡片
   - 若已满足条件：自动标记完成，发放XP
   - 若未满足：导航到对应页面

4. **导航映射**
   ```
   explore_poi → Environment页面
   read_species → SpeciesDetail页面
   complete_expedition → Expedition页面
   quiz → Quiz页面
   ```

5. **链完成检测**
   - 每次任务完成后检查
   - 所有任务完成时：
     - 标记链为已完成
     - 发放徽章

## 徽章系统
```
徽章结构：
- id: 唯一标识
- name/nameZh: 名称
- icon: 图标名称
- condition: 获取条件描述
```

## 预期结果
- 任务状态实时更新
- XP奖励即时发放
- 徽章在完成后显示在用户档案
