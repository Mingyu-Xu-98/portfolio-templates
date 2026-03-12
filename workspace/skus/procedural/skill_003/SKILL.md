---
name: puzzle-solving-workflow
description: 处理四种谜题类型（问答、识别、推理、排序）的统一解答流程
---

# 谜题解答工作流

## 概述
探险过程中遇到四种类型的谜题，每种有不同的交互方式和验证逻辑。

## 谜题类型处理

### 1. Quiz（知识问答）
```
交互：单选按钮选择
验证：selectedAnswer === correctAnswer
反馈：显示正确/错误状态和解释
```

### 2. Identify（物种识别）
```
交互：根据描述选择对应物种
验证：selectedAnswer === correctAnswer
反馈：高亮正确答案，显示物种信息
```

### 3. Reasoning（环境推理）
```
交互：选择最合理的解释
验证：selectedAnswer === correctAnswer
反馈：解释推理逻辑
```

### 4. Ordering（排序挑战）
```
交互：依次点击选项构建顺序
状态：orderingAnswer数组记录当前顺序
      - 点击未选项：添加到末尾
      - 点击已选项：从列表移除
验证：JSON.stringify(orderingAnswer) === JSON.stringify(correctAnswer)
反馈：显示正确顺序
```

## 通用流程

1. **显示谜题**
   - 显示谜题类型图标和标签
   - 显示问题文本

2. **用户作答**
   - 根据类型提供相应交互
   - 排序题显示当前已选顺序

3. **提示系统**
   - 点击"需要提示？"显示hint内容
   - 提示以警告色背景展示

4. **提交验证**
   - 检查是否满足提交条件
   - 排序题需选满所有选项
   - 其他类型需选择一个答案

5. **结果反馈**
   - 正确：绿色成功提示
   - 错误：红色错误提示，可重试
   - 显示explanation解释内容

6. **重试机制**
   - 错误后显示"重新作答"按钮
   - 重置所有选择状态

## 预期结果
- 正确解答触发onSolved回调
- 解锁rewardCardId指定的卡牌
- 用户获得30 XP奖励
