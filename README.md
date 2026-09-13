# Loon Duolingo

多邻国 Loon 插件：模拟 Super/Max 会员权益 + 学习体验优化。基于 Minis 的原版脚本修改。

## 功能

**已修改**

- 模拟 Super/Max 会员状态（`subscriberLevel` / `hasPlus` / `subscriptionFeatures` 全量注入 + Max 入口 featureFlags），完成课程后不再出现课后广告
- 能量拉满 9999，做错题扣能量不影响继续做题
- 时间宝 999 个（单次 2 小时）、无限红心、xp 加成 ×5
- 安全盾有效期至 2099、成就全满

**保持原样**

- 宝石：真实数值，商店按原价购买
- 连胜天数：真实进度，不伪造打卡历史

## 安装

Loon → 配置 → 插件 → ➕ → 粘贴链接：

```
https://raw.githubusercontent.com/x1nghao/loon-duolingo/main/duolingo.plugin
```

需开启 MITM 并安装信任证书；插件自带 hostname，无需手动添加。

## 自定义

数值集中在 `duolingo_gems.js` 顶部：`MAX_ENERGY`（能量）、`TB`（时间宝）、`FZ`（连胜冻结数量）。改完 push 后在 Loon 里重新导入插件并重启多邻国生效。

## 声明

仅供学习交流与个人研究使用，账号风险自行承担，请支持正版。
