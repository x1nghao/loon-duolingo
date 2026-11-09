# Loon Duolingo

多邻国 Loon 插件：模拟 Super/Max 会员权益 + 学习体验优化。基于 Minis 的原版脚本修改。

## 功能

**已修改**

- 模拟 Super/Max 会员状态（`subscriberLevel` / `hasPlus` / `subscriptionFeatures` 全量注入 + Max 入口 featureFlags），完成课程后不再出现课后广告
- 能量拉满 9999，做错题扣能量不影响继续做题
- 时间宝 999 个（单次 2 小时）、无限红心、xp 加成 ×5
- 安全盾有效期至 2099、成就全满

**已知边界**：Max 的 AI 类功能（视频通话/角色扮演/个性化练习等）入口已解锁，但内容依赖服务端下发，可能仍不可用；这是响应改写方案的固有上限。

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

数值在 Loon 里直接调：配置 → 插件 → 选中本插件 → 参数。

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `MAX_ENERGY` | 9999 | 能量上限与当前数值 |
| `TB` | 999 | 时间宝数量 |
| `FZ` | 999 | 连胜冻结道具数量 |

默认值写在 `duolingo_gems.js` 顶部，改完更新插件并重启多邻国生效。

## 声明

仅供学习交流与个人研究使用，账号风险自行承担，请支持正版。
