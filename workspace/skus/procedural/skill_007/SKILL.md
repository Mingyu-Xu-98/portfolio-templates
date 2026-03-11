---
name: interactive-map-navigation
description: 交互式地图的缩放、标记点选择和环境信息展示流程
---

# 交互式地图导航

## 概述
用户通过缩放和点击地图标记点探索中国各地的极致环境。

## 地图操作

### 缩放控制
```
放大：点击 + 按钮，scale = min(scale + 0.3, 2.5)
缩小：点击 - 按钮，scale = max(scale - 0.3, 1.0)
```

### SVG视图框计算
```
viewBox = `${300 - 300/scale} ${250 - 250/scale} ${600/scale} ${500/scale}`
```

## 标记点交互

1. **点击标记点**
   - 更新selectedEnv状态
   - 触发onEnvironmentPress回调
   - 记录访问到visitedPOIs

2. **标记点视觉状态**
   - 未访问：白色填充 + 脉冲环动画
   - 已访问：环境色填充 + 勾选标记
   - 选中：放大尺寸

3. **环境信息卡片**
   - 显示环境名称和物种数量
   - 显示访问状态（已访问显示勾选）
   - 提供"探索"按钮打开发现模态框

## 环境位置映射
```
塔克拉玛干沙漠: (145, 155)
普若岗日冰原: (195, 220)
大兴安岭: (460, 80)
呼伦湖: (430, 65)
雅鲁藏布大峡谷: (225, 275)
喀斯特地貌: (330, 335)
三江并流: (260, 310)
```

## 类别图标
```
desert: sunny-outline
glacier: snow-outline
mountain: trail-sign-outline
lake: water-outline
canyon: layers-outline
karst: diamond-outline
rivers: git-merge-outline
```

## 预期结果
- 用户可自由缩放浏览地图
- 点击标记点进入环境详情
- 访问状态实时更新显示
