/* =========================================================
   ⚙️  CONFIG — 上线前请修改这里 / Edit before going live
   ========================================================= */
const CONFIG = {
  // WhatsApp 号码：国家代码 + 号码，不要 + 号、空格或横线。例：60123456789
  WHATSAPP_NUMBER: '60192826257',
  WA_MESSAGE: {
    zh: '你好 Casmon！我想报名 AI Video 破局实战课 🙋 请问下一期的日期和详情？',
    en: "Hi Casmon! I'd like to join the AI Video Masterclass 🙋 Could you share the next class date and details?",
  },
  PRICE: 999,                                   // 单人价格 RM
  EARLY_BIRD_DEADLINE: '2026-09-30T23:59:59+08:00', // 早鸟截止（马来西亚时间）。过期后倒数会自动隐藏
  SEATS_TOTAL: 30,                              // 本期总名额
  SEATS_LEFT: 9,                                // 剩余名额（请照实更新；设为 null 则隐藏）
  AI_TOOL_MONTHLY: 250,                         // 计算器：AI 工具月费估算 RM
};

/* ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const isEN = () => root.lang === 'en';
const t = (zh, en) => (isEN() ? en : zh);
const rm = n => 'RM' + Math.round(n).toLocaleString('en-MY');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

/* ---------- WhatsApp links + tracking ---------- */
let groupLabel = '';
function waHref(src) {
  let msg = CONFIG.WA_MESSAGE[isEN() ? 'en' : 'zh'];
  if (src === 'pricing' && groupLabel) msg += t(`（团报：${groupLabel} 人）`, ` (Group: ${groupLabel} pax)`);
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
function refreshWA() {
  $$('[data-wa]').forEach(a => {
    a.href = waHref(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-wa]');
  if (!a) return;
  a.href = waHref(a.dataset.wa);
  const data = { content_name: 'AI Video Class', placement: a.dataset.wa, language: isEN() ? 'en' : 'zh' };
  if (window.fbq) fbq('track', 'Contact', data);
  if (window.gtag) gtag('event', 'whatsapp_click', data);
  (window.dataLayer = window.dataLayer || []).push({ event: 'whatsapp_click', ...data });
});

// Track clicks to the other course and the Facebook page (so Meta/GA can show how many people went there)
document.addEventListener('click', e => {
  const a = e.target.closest('[data-xsell],[data-social]');
  if (!a) return;
  const lang = isEN() ? 'en' : 'zh';
  const [name, ev, data] = a.dataset.xsell
    ? ['OtherCourseClick', 'other_course_click', { course: a.dataset.xsell, language: lang }]
    : ['SocialClick', 'social_click', { network: a.dataset.social, language: lang }];
  if (window.fbq) fbq('trackCustom', name, data);
  if (window.gtag) gtag('event', ev, data);
  (window.dataLayer = window.dataLayer || []).push({ event: ev, ...data });
});

/* ---------- language + theme ---------- */
function applyLang() {
  document.title = t('AI Video 破局实战课 · Casmon Wong', 'AI Video Masterclass · Casmon Wong');
  refreshWA(); renderPain(); renderCalc(); renderIdeas(); renderFutures(); renderPrice(); renderSeats(); studioRelabel();
}
$('#langBtn').addEventListener('click', () => {
  root.lang = isEN() ? 'zh-Hans' : 'en';
  store('lang', isEN() ? 'en' : 'zh');
  applyLang();
  runDemo();
});
function setThemeColor() {
  $('meta[name="theme-color"]').content = root.dataset.theme === 'dark' ? '#05060F' : '#F5F6FB';
}
$('#themeBtn').addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  store('theme', root.dataset.theme);
  setThemeColor();
});

/* ---------- scroll: progress, floating CTAs ---------- */
const progress = $('#progress'), mobileCta = $('#mobileCta'), fab = $('#fab');
function onScroll() {
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (scrollY / h) * 100 + '%';
  const past = scrollY > innerHeight * 0.8;
  mobileCta.classList.toggle('show', past);
  fab.classList.toggle('show', past);
}
addEventListener('scroll', onScroll, { passive: true });

/* ---------- reveal + count-up ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    $$('[data-count]', en.target).forEach(countUp);
    if (en.target.matches('[data-count]')) countUp(en.target);
    if (en.target.id === 'seats' || en.target.contains($('#seats'))) renderSeats(true);
    io.unobserve(en.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
$$('.rv').forEach(el => io.observe(el));
function countUp(el) {
  if (el.dataset.done) return; el.dataset.done = 1;
  const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  if (reduced) { el.textContent = pre + end + suf; return; }
  const t0 = performance.now(), dur = 1400;
  (function step(now) {
    const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.round(end * e) + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- countdown ---------- */
const deadline = new Date(CONFIG.EARLY_BIRD_DEADLINE).getTime();
function tick() {
  const left = deadline - Date.now();
  if (!(left > 0)) {
    $('#promo').hidden = true; $('#finalCd').hidden = true;
    return false;
  }
  const d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60;
  const v = { d, h, m, s };
  $$('[data-cd]').forEach(el => { el.textContent = String(v[el.dataset.cd]).padStart(2, '0'); });
  return true;
}
if (tick()) setInterval(tick, 1000);

/* ---------- hero AI studio demo ---------- */
// Types the prompt → fake "generating" → plays the real AI clip → repeats when the clip ends
const DEMOS = [
  { tag: ['口播', 'Presenter'], time: ['2分48秒', '2m 48s'],
    zh: '真人实拍，真实感。一位戴黑色鸭舌帽、穿红色 CASMON 卫衣的男生走进停车场斜坡，停下来张开双手，对着镜头自然地讲解。',
    en: 'Real-life footage look. A man in a black cap and red CASMON hoodie walks up a car-park ramp, stops, opens his hands and talks naturally to camera.' },
];
let demoI = 0, demoState = 'typing', demoTimer;
const typed = $('#typed'), screen = $('#screen'), screenVid = $('#screenVid'), genBar = $('#genBar'), genLabel = $('#genLabel');
screenVid.addEventListener('ended', () => { if (demoState === 'done') { clearTimeout(demoTimer); demoTimer = setTimeout(runDemo, 800); } });
screenVid.addEventListener('play', () => screen.classList.add('playing'));
screenVid.addEventListener('pause', () => screen.classList.remove('playing'));
screen.addEventListener('click', () => { if (demoState === 'done' && screenVid.paused) screenVid.play().catch(() => {}); });
function studioRelabel() {
  const d = DEMOS[demoI];
  $('#chipTag').textContent = t(d.tag[0], d.tag[1]);
  if (demoState === 'done') genLabel.innerHTML = `<span class="done">✓ ${t('完成', 'Done')}</span> · ${t('用时', 'took')} ${t(d.time[0], d.time[1])}`;
  else if (demoState === 'gen') genLabel.textContent = t('AI 生成中…', 'AI generating…');
  else genLabel.textContent = t('等待指令…', 'Waiting for prompt…');
}
function runDemo() {
  clearTimeout(demoTimer);
  const d = DEMOS[demoI], text = t(d.zh, d.en);
  screenVid.pause();
  demoState = 'typing'; screen.classList.add('loading'); genBar.style.width = '0%'; studioRelabel();
  let i = 0;
  const speed = isEN() ? 22 : 55;
  (function type() {
    typed.textContent = text.slice(0, ++i);
    if (i < text.length) { demoTimer = setTimeout(type, reduced ? 0 : speed); return; }
    demoState = 'gen'; studioRelabel();
    if (screenVid.preload !== 'auto') { screenVid.preload = 'auto'; screenVid.load(); } // buffer during the fake render
    let p = 0;
    (function gen() {
      p += 2 + Math.random() * 4;
      genBar.style.width = Math.min(p, 100) + '%';
      if (p < 100) { demoTimer = setTimeout(gen, 60); return; }
      screen.classList.remove('loading');
      demoState = 'done'; studioRelabel();
      screenVid.currentTime = 0;
      screenVid.play().catch(() => {});      // if autoplay is blocked the poster stays and the play icon shows
      demoTimer = setTimeout(runDemo, 14000); // fallback in case 'ended' never fires
    })();
  })();
}

/* ---------- pain checklist ---------- */
const painBtns = $$('#painList .pain-item');
painBtns.forEach(b => b.addEventListener('click', () => {
  b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
  renderPain();
}));
function renderPain() {
  const n = painBtns.filter(b => b.getAttribute('aria-pressed') === 'true').length;
  $('#painCount').textContent = n;
  $('#gaugeVal').style.strokeDashoffset = 452 - (452 * n) / painBtns.length;
  const v = $('#verdict'), s = $('#verdictSub');
  if (n === 0) { v.textContent = t('还没选？诚实一点 😉', 'Nothing yet? Be honest 😉'); s.textContent = t('大部分老板至少中 3 个。', 'Most business owners tick at least 3.'); return; }
  v.textContent = n <= 2 ? t('还好，但你已经在浪费时间了 ⏳', "Not bad — but you're already losing time ⏳")
    : n <= 5 ? t('你正在用 2020 年的方法做营销 😬', "You're marketing with 2020 methods 😬")
    : t('警报！传统视频正在吃掉你的时间和钱 🚨', 'Alarm! Traditional video is eating your time and money 🚨');
  s.innerHTML = t(`好消息：这 <b>${n}</b> 个问题，AI Video 全部可以帮你解决。`, `Good news: AI Video solves all <b>${n}</b> of these.`);
}

/* ---------- calculator ---------- */
const qty = $('#qty'), cost = $('#cost');
function fill(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%'); }
function renderCalc() {
  fill(qty); fill(cost);
  $('#qtyOut').textContent = qty.value;
  $('#costOut').textContent = rm(cost.value);
  const trad = qty.value * cost.value * 12, ai = CONFIG.AI_TOOL_MONTHLY * 12, save = Math.max(trad - ai, 0);
  const perDay = save / 365, payback = perDay > 0 ? Math.max(1, Math.ceil(CONFIG.PRICE / perDay)) : '—';
  $('#tradYear').textContent = rm(trad);
  $('#aiYear').textContent = rm(ai);
  $('#saveYear').textContent = rm(save);
  $$('#perDay, .perDayEn').forEach(el => (el.textContent = rm(perDay)));
  $$('#payback, .paybackEn').forEach(el => (el.textContent = payback));
}
[qty, cost].forEach(r => r.addEventListener('input', renderCalc));

/* ---------- showcase tabs ---------- */
$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(x => x.setAttribute('aria-selected', x === tab));
  $$('.tabpanel').forEach(p => (p.hidden = p.dataset.panel !== tab.dataset.tab));
}));

/* ---------- real AI videos: autoplay muted in view, tap for sound ---------- */
const vids = $$('[data-vid]');
function muteAll(except) {
  vids.forEach(f => { if (f === except) return; const v = $('video', f); v.muted = true; f.classList.remove('sound'); });
}
vids.forEach(f => {
  const v = $('video', f), bar = $('.vbar i', f);
  f.classList.add('paused');
  v.addEventListener('play', () => f.classList.remove('paused'));
  v.addEventListener('pause', () => f.classList.add('paused'));
  v.addEventListener('timeupdate', () => { if (v.duration) bar.style.width = (v.currentTime / v.duration) * 100 + '%'; });
  f.addEventListener('click', () => {
    if (v.muted || v.paused) {
      muteAll(f);
      v.muted = false; f.classList.add('sound');
      if (v.muted === false && !f.dataset.heard) { v.currentTime = 0; f.dataset.heard = 1; }
      v.play().catch(() => {});
    } else {
      v.muted = true; f.classList.remove('sound');
    }
  });
});
const vio = new IntersectionObserver(entries => {
  entries.forEach(en => {
    const v = $('video', en.target);
    if (en.isIntersecting && en.intersectionRatio >= 0.5) {
      if (!reduced || !v.muted) v.play().catch(() => {});
    } else {
      v.pause();
    }
  });
}, { threshold: [0, 0.5] });
vids.forEach(f => vio.observe(f));

/* ---------- industry ideas ---------- */
const IDEAS = {
  property: [
    ['🏠', '空屋秒变装修好', 'Empty unit → furnished', '用首尾帧，把毛坯房变成装修好的样板间，客户马上有画面。', 'Use start–end frames to turn a bare unit into a styled show home.'],
    ['🚁', '楼盘 FPV 航拍', 'Project FPV flyover', '不用无人机，拍出整个发展区的电影级航拍。', 'Cinematic aerials of the whole development — no drone needed.'],
    ['🗣️', 'AI 分身天天讲盘', 'Your AI twin presents daily', '不用到现场，AI 分身每天帮你介绍新 Listing。', 'Your AI twin introduces new listings every day, no site visit.']],
  fnb: [
    ['🍜', '招牌菜慢镜头', 'Signature dish slow-mo', '热气、酱汁、拉丝 —— 让人看了马上肚子饿。', 'Steam, sauce, cheese pulls — instant cravings.'],
    ['🎉', '节日促销短片', 'Festive promo clips', '新年、开斋、圣诞，一天做好全年节日视频。', 'CNY, Raya, Christmas — a year of festive videos in a day.'],
    ['👨‍🍳', 'AI 老板讲故事', 'AI founder story', '不用露脸，也能讲出店的品牌故事。', 'Tell your brand story without showing your face.']],
  beauty: [
    ['✨', '疗程前后对比', 'Before & after reveals', '用 AI 做出吸睛的效果展示与转场。', 'Eye-catching result reveals with smooth AI transitions.'],
    ['💆', '店内环境导览', 'Salon tour', '把普通店面拍出高级感，提升客单价。', 'Make your salon look premium and lift average spend.'],
    ['🎙️', 'AI 美容顾问', 'AI beauty advisor', 'AI 数字人每天讲解护肤知识、推广疗程。', 'An AI avatar shares skincare tips and promotes treatments daily.']],
  retail: [
    ['📦', '产品 360° 展示', '360° product showcase', '一张产品图，就能生成旋转展示和使用场景。', 'One product photo → spinning showcase and lifestyle scenes.'],
    ['🧑‍🤝‍🧑', 'AI 模特试穿', 'AI model try-ons', '不用请模特，衣服、饰品都能「穿」起来。', 'No models needed — show clothes and accessories being worn.'],
    ['⚡', '一天 10 支广告素材', '10 ad creatives a day', '批量做不同版本，找到转化最高的那支。', 'Batch variations and find the one that converts best.']],
  edu: [
    ['📚', '课程宣传片', 'Course trailers', '把课程亮点做成吸引人的宣传短片。', 'Turn course highlights into compelling trailers.'],
    ['🧑‍🏫', 'AI 讲师录课', 'AI instructor lessons', '不用每次亲自录，AI 数字人帮你讲解。', 'An AI avatar delivers lessons so you don’t re-record.'],
    ['🎨', '知识动画短片', 'Explainer animations', '把复杂概念变成易懂的动画。', 'Turn complex ideas into easy animations.']],
  service: [
    ['🔧', '服务流程演示', 'Service walkthroughs', '装修、清洁、维修 —— 把流程拍得专业可信。', 'Renovation, cleaning, repairs — show the process professionally.'],
    ['⭐', '客户见证视频', 'Testimonial-style videos', '把真实好评做成有画面的短片（需客户同意）。', 'Turn real reviews into visual shorts (with customer consent).'],
    ['📍', '本地广告素材', 'Local ad creatives', '针对不同地区、不同客群快速做多个版本。', 'Quickly make versions for different areas and audiences.']],
};
let curInd = 'property';
function renderIdeas() {
  $('#indIdeas').innerHTML = IDEAS[curInd].map(([e, zh, en, dzh, den]) =>
    `<div class="idea"><div class="e">${e}</div><h4>${t(zh, en)}</h4><p>${t(dzh, den)}</p></div>`).join('');
}
$$('#indChips .ind-chip').forEach(c => c.addEventListener('click', () => {
  $$('#indChips .ind-chip').forEach(x => x.setAttribute('aria-selected', x === c));
  curInd = c.dataset.ind; renderIdeas();
}));

/* ---------- two futures ---------- */
const FUT = {
  a: [
    ['第 1 个月', 'Month 1', '继续花钱请人拍', 'Still paying crews', '一支几千块，一个月只敢做 1–2 支。', 'Thousands per video, so you only dare make 1–2 a month.'],
    ['第 2 个月', 'Month 2', '账号越来越安静', 'Your page goes quiet', '更新太慢，算法慢慢把你忘了。', 'Posting too slowly — the algorithm forgets you.'],
    ['第 4 个月', 'Month 4', '对手天天发 AI 视频', 'Rivals post AI video daily', '客户的注意力，被会用 AI 的同行抢走。', 'Customer attention goes to competitors who use AI.'],
    ['第 6 个月', 'Month 6', '终于想学，但晚了', 'Finally want to learn — late', '市场已经被早学的人占领，追得更辛苦。', 'Early adopters own the market; catching up is harder.']],
  b: [
    ['下课当天', 'Day 1', '做出第一支 AI 视频', 'Your first AI video', '课堂上跟着做，回家就能发。', 'Made in class, ready to post tonight.'],
    ['第 1 个月', 'Month 1', '天天都有内容发', 'Content every day', '不用再求人、等档期、背稿。', 'No more waiting on crews, schedules or scripts.'],
    ['第 3 个月', 'Month 3', '广告越跑越便宜', 'Ads get cheaper', '用 AI 批量测素材，找到最便宜拿 Lead 的那支。', 'Batch-test creatives with AI and find your cheapest lead source.'],
    ['第 6 个月', 'Month 6', '同行眼中的 AI 高手', 'The AI expert in your field', '省下几万块制作费，客户主动找上门。', 'Saved thousands on production — and customers come to you.']],
};
let curFut = 'a';
function renderFutures() {
  const box = $('#futures');
  box.className = 'futures ' + curFut;
  box.innerHTML = FUT[curFut].map(([wz, we, hz, he, pz, pe]) =>
    `<div class="card fut idea"><div class="ic"></div><div class="when">${t(wz, we)}</div><h4>${t(hz, he)}</h4><p>${t(pz, pe)}</p></div>`).join('');
}
$$('.fut-switch button').forEach(b => b.addEventListener('click', () => {
  $$('.fut-switch button').forEach(x => x.setAttribute('aria-selected', x === b));
  curFut = b.dataset.fut; renderFutures();
}));

/* ---------- pricing ---------- */
let curPrice = CONFIG.PRICE;
$$('#group button').forEach(b => b.addEventListener('click', () => {
  $$('#group button').forEach(x => x.setAttribute('aria-pressed', x === b));
  curPrice = +b.dataset.price;
  groupLabel = b.dataset.price == CONFIG.PRICE ? '' : $('b', b).textContent;
  renderPrice(); refreshWA();
}));
function renderPrice() {
  $('#priceNum').textContent = rm(curPrice);
  const saved = CONFIG.PRICE - curPrice;
  $('#priceNote').innerHTML = saved > 0
    ? t(`每人省 <b>${rm(saved)}</b> · 找朋友 / 同事一起报名更划算`, `Save <b>${rm(saved)}</b> per person · bring friends or colleagues`)
    : t('≈ 每天不到 RM3，用一整年', '≈ less than RM3 a day over a year');
  $('.mobile-cta .mc-price b').textContent = rm(CONFIG.PRICE);
}
function renderSeats(animate) {
  const wrap = $('#seats');
  if (CONFIG.SEATS_LEFT == null) { wrap.hidden = true; return; }
  $('#seatsText').innerHTML = t(`🔥 本期只剩 <b>${CONFIG.SEATS_LEFT}</b> / ${CONFIG.SEATS_TOTAL} 个名额`, `🔥 Only <b>${CONFIG.SEATS_LEFT}</b> of ${CONFIG.SEATS_TOTAL} seats left`);
  if (animate || $('#seatsBar').style.width)
    $('#seatsBar').style.width = ((CONFIG.SEATS_TOTAL - CONFIG.SEATS_LEFT) / CONFIG.SEATS_TOTAL) * 100 + '%';
}

/* ---------- lightbox ---------- */
const lb = $('#lb');
document.addEventListener('click', e => {
  const el = e.target.closest('[data-lb]');
  if (!el) return;
  const img = el.tagName === 'IMG' ? el : $('img', el);
  const cap = $('.cap', el);
  $('#lbImg').src = img.src; $('#lbImg').alt = img.alt;
  $('#lbCap').textContent = cap ? cap.innerText.trim() : '';
  lb.classList.add('open');
});
const closeLb = () => lb.classList.remove('open');
lb.addEventListener('click', e => { if (e.target === lb || e.target.id === 'lbClose') closeLb(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

/* ---------- init ---------- */
$('#yr').textContent = new Date().getFullYear();
setThemeColor();
applyLang();
onScroll();
runDemo();
