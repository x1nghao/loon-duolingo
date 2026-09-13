// ==Plugin==
// @name        多邻国 v13（连胜/宝石不动版）
// @desc        连胜天数与宝石保持原样；能量/时间宝/红心/安全盾/全成就/Super/Max入口 按原脚本修改
// @version     13.1
// @author      Minis
// ==/Plugin==

const TB = 999, FZ = 999, MAX_ENERGY = 9999;

const MAX_FEATURES = ['NO_NETWORK_ADS','UNLIMITED_HEARTS','LEGENDARY_LEVEL','MISTAKES_INBOX',
  'MASTERY_QUIZ','EXPLAIN_MY_ANSWER','LICENSED_SONGS','CAN_ADD_SECONDARY_MEMBERS',
  'DUOLINGO_MAX','ROLE_PLAY','VIDEO_CALL','ADVANCED_MATH'];

function pushFeatures(arr) { MAX_FEATURES.forEach(f => { if (!arr.includes(f)) arr.push(f); }); }

// ===== 业务字段修改（用户模型：能量/时间宝/红心/Super 等）=====
// 注意：宝石（gems）与连胜天数（streak/streakData）一律不动
// 返回 true 表示改动了
function modUser(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  // experiments 上报响应：绝对不动，避免污染 A/B 上报链路
  if (Array.isArray(d.experiments) && d.experiments.length && d.experiments[0] && typeof d.experiments[0].name === 'string') return false;

  let m = false;

  if (d.subscriberLevel && d.subscriberLevel !== 'PREMIUM') { d.subscriberLevel = 'PREMIUM'; m = true; }
  // 国际版用户模型用 hasPlus 判断 Super/Max 权益，存在就置 true（CN 可能两个都查）
  if (typeof d.hasPlus === 'boolean' && !d.hasPlus) { d.hasPlus = true; m = true; }

  if (d.health) { d.health.unlimitedHeartsAvailable = true; m = true; }
  if (d.energyConfig) { d.energyConfig.maxEnergy = MAX_ENERGY; d.energyConfig.energy = MAX_ENERGY; m = true; }

  if (d.timerBoostConfig) {
    d.timerBoostConfig.timerBoosts = TB;
    d.timerBoostConfig.hasFreeTimerBoost = true;
    d.timerBoostConfig.hasPurchasedTimerBoost = true;
    d.timerBoostConfig.timePerBoost = 7200; m = true;
  }

  if (d.trackingProperties) {
    // 连胜保护类道具库存（不碰 d.trackingProperties.streak）
    d.trackingProperties.num_item_streak_freeze = FZ;
    d.trackingProperties.num_item_streak_freeze_total = FZ;
    d.trackingProperties.has_item_streak_freeze = true;
    d.trackingProperties.has_item_weekend_amulet = true;
    d.trackingProperties.has_item_streak_wager = true; m = true;
  }

  if (d.xpBoostMultiplier !== undefined && d.xpBoostMultiplier !== 5) { d.xpBoostMultiplier = 5; m = true; }

  // 会员功能数组：只要有 subscriptionFeatures 字段就补全（Super/Max 判定依据）
  if (Array.isArray(d.subscriptionFeatures)) { pushFeatures(d.subscriptionFeatures); m = true; }
  return m;
}

// ===== config 响应：打开 Max 视频通话相关 flag =====
function modConfig(d) {
  if (!d.featureFlags || typeof d.featureFlags !== 'object') return false;
  const ff = d.featureFlags;
  ff.ios_video_call_tab_should_force_unavailable_state = false;   // 关键：视频通话 Tab 强制不可用
  ff.ios_video_call_public_testing_indicator_china = true;        // 中国区公开测试指示
  ff.ios_role_play_on_path = true;
  ff.ios_duolingo_max_video_probability = 1.0;
  ff.ios_fetch_subscription_features = true;
  if (!Array.isArray(d.subscriptionFeatures)) d.subscriptionFeatures = [];
  pushFeatures(d.subscriptionFeatures);
  if (d.xpBoostMultiplier === undefined) d.xpBoostMultiplier = 5; else d.xpBoostMultiplier = 5;
  return true;
}

// ===== 单一已解析对象处理入口（顶层或 batch 嵌套体）=====
// 返回新字符串或 null(未改)
function handleParsed(d, url) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
  if (Array.isArray(d.experiments) && d.experiments.length && d.experiments[0] && typeof d.experiments[0].name === 'string') return null;

  // —— 安全盾：有效期拉到 2099（不动连胜天数本身）——
  if (d.streakShields || (url && url.includes('streak-shield'))) {
    d.streakShields = d.streakShields || [];
    if (d.streakShields.length === 0) {
      d.streakShields.push({userId:'716692732', startDate:{year:2026, month:1, day:1}, endDate:{year:2099, month:12, day:31}});
    } else {
      d.streakShields.forEach(s => { s.endDate = {year:2099, month:12, day:31}; s.startDate = {year:2026, month:1, day:1}; });
    }
    return JSON.stringify(d);
  }

  if (d.achievements && Array.isArray(d.achievements)) {
    d.achievements.forEach(a => {
      a.tier = 9; a.count = 99999; a.shouldShowUnlock = false; a.noProgressBar = true;
      let ts = []; let now = Date.now();
      for (let t = 0; t < (a.tierCounts ? a.tierCounts.length : 10); t++) ts.push(now - (10-t) * 86400000);
      a.unlockTimestamps = ts;
    });
    return JSON.stringify(d);
  }

  // —— config ——
  if (d.featureFlags && typeof d.featureFlags === 'object') {
    if (modConfig(d)) return JSON.stringify(d);
  }

  // —— 通用用户模型 ——
  if (modUser(d)) return JSON.stringify(d);
  return null;
}

function modBatch(b) {
  try {
    let o = JSON.parse(b);
    if (!o.responses) return b;
    let changed = false;
    for (let r of o.responses) {
      if (r.status === 400 && r.body === '') { r.status = 200; r.body = '{}'; changed = true; continue; }
      if (r.status !== 200 || typeof r.body !== 'string') continue;
      let d;
      try { d = JSON.parse(r.body); } catch(e) { continue; }
      const out = handleParsed(d, r.url || '');
      if (out) { r.body = out; changed = true; }
    }
    return changed ? JSON.stringify(o) : b;
  } catch(e) { return b; }
}

function standalone(url, b) {
  try {
    let d = JSON.parse(b);
    if (typeof d !== 'object' || d === null) return b;
    const out = handleParsed(d, url);
    return out ? out : b;
  } catch(e) { return b; }
}

const isReq = typeof $response === 'undefined' || $response === null;
try {
  if (isReq) {
    $done({});
  } else {
    const url = ($request && $request.url) || '';
    const body = $response.body || '';
    if (!body) { $done({}); return; }
    if (url.includes('/batch')) { $done({ body: modBatch(body) }); }
    else { $done({ body: standalone(url, body) }); }
  }
} catch(e) { $done({}); }
