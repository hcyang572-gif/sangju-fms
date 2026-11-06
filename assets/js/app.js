/* SJ-FMS UI — 해시 라우팅 단일 페이지 */
(function () {
  'use strict';
  var SJ = window.SJ, G = window.SJG;
  if (!SJ || !G) { document.getElementById('main').innerHTML = '<p style="padding:40px">엔진/그래픽 모듈을 불러오지 못했습니다.</p>'; return; }

  var main = document.getElementById('main');
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STATUS = { overdue: '기한 경과', soon: '30일 이내', ok: '예정', event: '사유 발생 시' };
  var STATUS_B = { overdue: 'b-danger', soon: 'b-warn', ok: 'b-ok', event: 'b-event' };
  var PRI_B = { critical: 'b-danger', high: 'b-warn', normal: 'b-muted' };
  var state = { cat: '전체', q: '', lawDom: '전체', lawQ: '', calFac: '', detDom: '전체', wiz: null, donePop: null };

  /* ---------- 유틸 ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtN(n) { return n == null || n === '' ? '-' : Number(n).toLocaleString('ko-KR'); }
  function fmtD(d) { if (!d) return '-'; return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate(); }
  function dday(r) { if (r.status === 'event' || r.days == null) return '수시'; if (r.days === 0) return 'D-DAY'; return r.days < 0 ? 'D+' + (-r.days) : 'D-' + r.days; }
  function ic(n, c) { return G.icon(n, c); }
  function toast(msg) {
    var w = document.getElementById('toasts'), t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg; w.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 2600);
    setTimeout(function () { t.remove(); }, 3100);
  }
  function lawLink(r) {
    var u = r.lawUrl || ('https://www.law.go.kr/법령/' + String(r.law || '').replace(/\s+/g, ''));
    return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + ic('link') + ' ' + esc(r.law || '법령') + (r.basis ? ' · ' + esc(r.basis) : '') + '</a>';
  }

  /* 전체 평가 캐시 (렌더마다 갱신) */
  var cache = null;
  function all() {
    if (cache) return cache;
    var facs = SJ.facilities().slice(), map = {};
    // 상주시청 본청을 항상 맨 앞에 (나머지는 원래 순서 유지)
    var isHall = function (f) { return f.id === 'F001' || /상주시청\s*본청/.test(f.name || ''); };
    facs = facs.filter(isHall).concat(facs.filter(function (f) { return !isHall(f); }));
    facs.forEach(function (f) { var res = SJ.evaluate(f); map[f.id] = { f: f, res: res, sum: SJ.summarize(res) }; });
    cache = { facs: facs, map: map, rules: SJ.rules() };
    return cache;
  }
  function invalidate() { cache = null; }

  /* ---------- 라우팅 ---------- */
  var NAV = [['dashboard', '#/', '대시보드'], ['building', '#/facilities', '시설'], ['calendar', '#/calendar', '연간달력'], ['book', '#/laws', '법령사전'], ['wand', '#/wizard', '유형진단'], ['settings', '#/settings', '설정']];
  function route() {
    var h = (location.hash || '#/').replace(/^#/, '');
    var parts = h.split('?')[0].split('/').filter(Boolean);
    return { name: parts[0] || '', id: parts[1] ? decodeURIComponent(parts[1]) : '' };
  }
  function renderNav(r) {
    var cur = r.name === 'facility' ? '#/facilities' : '#/' + r.name;
    if (cur === '#/') cur = '#/';
    document.getElementById('nav').innerHTML = NAV.map(function (n) {
      return '<a href="' + n[1] + '"' + (n[1] === cur ? ' aria-current="page"' : '') + '>' + ic(n[0]) + '<span>' + n[2] + '</span></a>';
    }).join('');
  }
  function render() {
    var r = route(); invalidate(); renderNav(r);
    var V = { '': vDashboard, facilities: vFacilities, facility: vFacility, calendar: vCalendar, laws: vLaws, wizard: vWizard, settings: vSettings }[r.name] || vDashboard;
    var html;
    try { html = V(r); } catch (e) { console.error(e); html = emptyBox('화면을 그리는 중 오류가 발생했습니다', esc(e && e.message)); }
    main.innerHTML = crumbs(r) + '<div class="view ' + (navDir < 0 ? 'v-back' : 'v-fwd') + '">' + html + '</div>';
    after();
  }
  /* ---------- 화면 전환: 뒤로가기 · 이동경로 · 이전/다음 시설 ---------- */
  var TITLES = { facilities: '시설 목록', facility: '시설 상세', calendar: '연간달력', laws: '법령사전', wizard: '유형진단', settings: '설정' };
  var navStack = [], navDir = 1;
  function parentOf(r) { return r.name === 'facility' ? '#/facilities' : '#/'; }
  function crumbs(r) {
    if (!r.name) return '';
    var A = all(), items = ['<a href="#/">' + ic('dashboard') + '대시보드</a>'];
    if (r.name === 'facility') {
      var f = A.map[r.id] && A.map[r.id].f;
      items.push('<a href="#/facilities">시설 목록</a>');
      items.push('<span aria-current="page">' + esc(f ? f.name : '시설 상세') + '</span>');
    } else items.push('<span aria-current="page">' + (TITLES[r.name] || '') + '</span>');
    var pn = '';
    if (r.name === 'facility') {
      var i = A.facs.findIndex(function (x) { return x.id === r.id; });
      var p = A.facs[i - 1], n = A.facs[i + 1];
      pn = '<div class="cr-pn">' +
        (p ? '<a class="btn btn-sm" href="#/facility/' + encodeURIComponent(p.id) + '" title="' + esc(p.name) + '">' + ic('arrowLeft') + '<span>이전 시설</span></a>' : '') +
        '<span class="cr-count">' + (i + 1) + ' / ' + A.facs.length + '</span>' +
        (n ? '<a class="btn btn-sm" href="#/facility/' + encodeURIComponent(n.id) + '" title="' + esc(n.name) + '"><span>다음 시설</span>' + ic('arrowRight') + '</a>' : '') + '</div>';
    }
    return '<nav class="crumbs" aria-label="현재 위치"><button type="button" class="btn btn-sm cr-back" data-nav="back" aria-label="뒤로 가기">' + ic('arrowLeft') + '<span>뒤로</span></button>' +
      '<ol>' + items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' + pn + '</nav>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-nav="back"]');
    if (!b) return;
    e.preventDefault();
    if (navStack.length > 1) { history.back(); }
    else { navDir = -1; location.hash = parentOf(route()); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace' && !/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || '')) && !e.target.isContentEditable && route().name) {
      e.preventDefault(); var b = document.querySelector('[data-nav="back"]'); if (b) b.click();
    }
  });
  // 맨 위로
  var topBtn = document.createElement('button');
  topBtn.type = 'button'; topBtn.className = 'btn to-top'; topBtn.setAttribute('aria-label', '맨 위로'); topBtn.innerHTML = ic('arrowRight');
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); });
  document.body.appendChild(topBtn);
  // 스크롤 안내: 아래에 내용이 남아 있으면 표시, 다음 섹션 이름을 함께 안내
  var cue = document.createElement('button');
  cue.type = 'button'; cue.className = 'scroll-cue'; cue.setAttribute('aria-label', '아래로 스크롤해 더 보기');
  cue.innerHTML = '<span class="mouse" aria-hidden="true"></span><span class="cue-t">아래로 스크롤해 더 보기</span><span class="chev" aria-hidden="true"><i></i><i></i></span>';
  document.body.appendChild(cue);
  function nextSectionName() {
    var hs = main.querySelectorAll('h2, .card-title span, .lx-dl'), lim = window.innerHeight * .9;
    for (var i = 0; i < hs.length; i++) { var t = hs[i].getBoundingClientRect().top; if (t > lim) return (hs[i].textContent || '').trim().slice(0, 18); }
    return '';
  }
  function updCue() {
    var left = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    var show = left > 160 && !document.querySelector('.modal-root .modal');
    cue.classList.toggle('show', show);
    if (show) { var n = nextSectionName(); cue.querySelector('.cue-t').innerHTML = n ? '아래로 스크롤 <small>· ' + esc(n) + '</small>' : '아래로 스크롤해 더 보기'; }
  }
  cue.addEventListener('click', function () { window.scrollBy({ top: Math.round(window.innerHeight * .75), behavior: RM ? 'auto' : 'smooth' }); });
  var cueT; window.addEventListener('scroll', function () { clearTimeout(cueT); cueT = setTimeout(updCue, 60); }, { passive: true });
  window.addEventListener('resize', updCue);
  window.addEventListener('scroll', function () { topBtn.classList.toggle('show', window.scrollY > 520); }, { passive: true });

  /* ---------- 공공데이터(건축물대장) 출처 · 실시간 조회 표시 ---------- */
  function regOf(f) { return f && (window.SJ_REGISTRY || {})[f.id]; }
  function apiKey() { return SJ.store.getRaw(SJ.store.KEYS.key); }
  function fmtDT(iso) { var d = new Date(iso); return isNaN(d) ? '' : d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function liveQuery(R) {
    var t0 = performance.now();
    return window.SJ_API.getTitle({ serviceKey: apiKey(), bjdongCd: R.bjdongCd, platGbCd: R.platGbCd || '0', bun: R.bun, ji: R.ji, numOfRows: 50 })
      .then(function (r) { r.ms = Math.round(performance.now() - t0); return r; });
  }
  function dataPanel(A) {
    var M = window.SJ_REGISTRY_META || {}, n = A.facs.filter(regOf).length;
    return '<section class="card lx-data rise" style="--i:5"><div class="ld-head"><div class="ld-badge"><span class="ld-pulse" id="livePulse"></span>' + ic('db') + '</div>' +
      '<div><div class="eyebrow">Public Data · data.go.kr</div><h3>공공데이터 건축물대장 연동</h3>' +
      '<p>시설의 연면적·층수·사용승인일·승강기 대수는 <b>국토교통부 건축HUB 건축물대장정보 서비스</b>(공공데이터포털 Open API)에서 조회한 값으로 법적 유형을 판정합니다.</p></div></div>' +
      '<div class="ld-grid">' +
      '<div><small>연동 서비스</small><b>건축HUB 건축물대장 · 표제부</b><span>apis.data.go.kr/1613000</span></div>' +
      '<div><small>건축물대장 확정</small><b>' + n + ' / ' + A.facs.length + ' 시설</b><span>나머지는 추정값(담당자 확인 필요)</span></div>' +
      '<div><small>최근 일괄 조회</small><b>' + (M.fetchedAt ? fmtDT(M.fetchedAt) : '-') + '</b><span>시설 상세에서 개별 재조회</span></div>' +
      '<div id="liveBox"><small>실시간 연결</small><b id="liveState">' + (apiKey() ? '확인 중…' : '서비스키 미입력') + '</b><span id="liveSub">' + (apiKey() ? 'apis.data.go.kr 호출 중' : '<a href="#/settings">설정</a>에서 키 입력 시 실시간 조회') + '</span></div>' +
      '</div></section>';
  }
  function provenance(f) {
    var R = regOf(f), g = R && R._reg;
    if (g) return '<div class="prov rise"><span class="pv-ic">' + ic('db') + '</span><div><b>국토교통부 건축HUB 건축물대장(표제부) 기준</b>' +
      '<span>' + esc(g.newPlatPlc || g.platPlc || '') + (g.buildings > 1 ? ' · ' + g.buildings + '개 동 합산' : '') + ' · 주용도 ' + esc(g.mainPurps || '') + ' · 조회 ' + fmtDT(g.fetchedAt || (window.SJ_REGISTRY_META || {}).fetchedAt) + '</span></div>' +
      '<div class="pv-live" id="provLive">' + (apiKey() && g.bjdongCd ? '<i class="ld-dot"></i>실시간 재확인 중…' : '<a href="#/settings">키 입력 시 실시간 재확인</a>') + '</div></div>';
    return '<div class="prov pv-est rise"><span class="pv-ic">' + ic('alert') + '</span><div><b>건축물대장 미확정 — 추정값</b><span>지번·법정동코드 확인 후 [건축물대장 불러오기]로 공공데이터를 실시간 조회해 확정하세요.</span></div></div>';
  }
  function liveAfter(r) {
    if (!window.SJ_API || !apiKey()) return;
    var A = all();
    if (!r.name) {
      var f = A.facs.find(function (x) { var R = regOf(x); return R && R._reg && R._reg.bjdongCd; });
      if (!f) return;
      liveQuery(regOf(f)._reg).then(function (res) {
        var s = document.getElementById('liveState'), sub = document.getElementById('liveSub'), p = document.getElementById('livePulse');
        if (!s) return;
        if (res.ok) { s.innerHTML = '<i class="ld-dot ok"></i>실시간 연결됨'; sub.textContent = fmtDT(new Date().toISOString()) + ' · 응답 ' + res.ms + 'ms · ' + f.name + ' 조회 성공'; if (p) p.classList.add('on'); }
        else { s.innerHTML = '<i class="ld-dot bad"></i>연결 실패'; sub.textContent = res.error || ''; }
      });
    } else if (r.name === 'facility') {
      var ff = A.map[r.id] && A.map[r.id].f, R = regOf(ff);
      if (!R || !R._reg || !R._reg.bjdongCd) return;
      liveQuery(R._reg).then(function (res) {
        var el = document.getElementById('provLive'); if (!el) return;
        if (!res.ok) { el.innerHTML = '<i class="ld-dot bad"></i>' + esc(res.error || '조회 실패'); return; }
        var area = res.items.reduce(function (s, i) { return s + (+i.totArea || 0); }, 0);
        var same = Math.abs(area - (R.area || 0)) < 1;
        el.innerHTML = '<i class="ld-dot ok"></i>실시간 재확인 ' + fmtDT(new Date().toISOString()) + ' · ' + res.ms + 'ms · 연면적 ' + area.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) + '㎡ ' + (same ? '<b class="pv-ok">일치</b>' : '<b class="pv-diff">변경 감지</b>');
      });
    }
  }

  /* ---------- 재미 요소: 금가루·물결·자석 버튼·시차·스크롤 등장 ---------- */
  function burst(x, y) {
    if (RM) return;
    var seal = document.createElement('div'); seal.className = 'fx-seal'; seal.style.left = x + 'px'; seal.style.top = y + 'px';
    seal.innerHTML = '<svg viewBox="0 0 64 64"><circle class="s-ring" cx="32" cy="32" r="30"/><circle class="s-disc" cx="32" cy="32" r="22"/><path class="s-check" d="M22 33l7 7 14-15"/></svg>';
    document.body.appendChild(seal);
    setTimeout(function () { seal.classList.add('out'); }, 1100); setTimeout(function () { seal.remove(); }, 1700);
    var wrap = document.createElement('div'); wrap.className = 'fx-burst'; wrap.style.left = x + 'px'; wrap.style.top = y + 'px';
    for (var i = 0; i < 22; i++) {
      var p = document.createElement('i'), an = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 70;
      p.style.setProperty('--tx', (Math.cos(an) * dist).toFixed(1) + 'px');
      p.style.setProperty('--ty', (Math.sin(an) * dist - 30).toFixed(1) + 'px');
      p.style.setProperty('--r', (Math.random() * 540 - 270).toFixed(0) + 'deg');
      p.style.animationDelay = (Math.random() * 80).toFixed(0) + 'ms';
      if (i % 3 === 0) p.className = 'c';
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap); setTimeout(function () { wrap.remove(); }, 1400);
  }
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn'); if (!b || RM) return;
    var r = b.getBoundingClientRect(), s = document.createElement('span'), d = Math.max(r.width, r.height) * 2;
    s.className = 'fx-ripple'; s.style.width = s.style.height = d + 'px';
    s.style.left = (e.clientX - r.left - d / 2) + 'px'; s.style.top = (e.clientY - r.top - d / 2) + 'px';
    b.appendChild(s); setTimeout(function () { s.remove(); }, 700);
  });
  if (!RM && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var m = e.target.closest && e.target.closest('.btn-gold, .lx-cta .btn');
      document.querySelectorAll('.fx-mag').forEach(function (x) { if (x !== m) { x.classList.remove('fx-mag'); x.style.translate = ''; } });
      if (m) { var r = m.getBoundingClientRect(); m.classList.add('fx-mag'); m.style.translate = ((e.clientX - r.left - r.width / 2) * .05).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .08).toFixed(1) + 'px'; }
      var hero = e.target.closest && e.target.closest('.lx-photo-hero');
      if (hero) {
        var hr = hero.getBoundingClientRect(), px = (e.clientX - hr.left) / hr.width - .5, py = (e.clientY - hr.top) / hr.height - .5;
        hero.style.setProperty('--px', px.toFixed(3)); hero.style.setProperty('--py', py.toFixed(3));
      }
    }, { passive: true });
  }
  var revealIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove('sr-wait'); revealIO.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function scrollReveal() {
    if (!revealIO || RM) return;
    var vh = window.innerHeight;
    main.querySelectorAll('.rise').forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * .95) { el.classList.add('sr-wait'); revealIO.observe(el); }
    });
  }

  function rerender() { var y = window.scrollY; render(); window.scrollTo(0, y); }

  /* 렌더 후 애니메이션 */
  function after() {
    scrollReveal();
    setTimeout(function () { try { updCue(); } catch (e) {} }, 400);
    try { liveAfter(route()); } catch (e) { console.warn(e); }
    main.querySelectorAll('[data-count]').forEach(function (el) {
      var to = +el.getAttribute('data-count') || 0;
      if (RM || to === 0) { el.textContent = fmtN(to); return; }
      var t0 = performance.now(), dur = 900;
      (function step(t) { var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmtN(Math.round(to * e)); if (p < 1) requestAnimationFrame(step); })(t0);
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        main.querySelectorAll('.ring-fg').forEach(function (c) { c.style.strokeDashoffset = c.getAttribute('data-target'); });
        main.querySelectorAll('.bar-fill').forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; });
      });
    });
  }
  function emptyBox(title, desc, actions, kind) {
    return '<div class="card empty rise">' + G.empty(kind) + '<h3>' + title + '</h3><p>' + (desc || '') + '</p>' + (actions ? '<div class="btn-row">' + actions + '</div>' : '') + '</div>';
  }
  function dataWarn() {
    var A = all(), w = '';
    if (!A.rules.length) w += '<div class="notice rise">' + ic('alert') + '<div><b>법정업무 규칙 데이터가 아직 로드되지 않았습니다.</b><br><span class="small muted">data/rules/*.js 파일을 확인하세요. 규칙이 없으면 업무가 0건으로 표시됩니다.</span></div></div>';
    return w;
  }

  /* ---------- 대시보드 ---------- */
  function vDashboard() {
    var A = all(), facs = A.facs, tot = 0, month = 0, over = 0, soon = 0, dom = {}, up = [], t = SJ.today();
    facs.forEach(function (f) {
      var e = A.map[f.id];
      tot += e.res.length; over += e.sum.overdue; soon += e.sum.soon;
      e.res.forEach(function (r) {
        dom[r.rule.domain] = (dom[r.rule.domain] || 0) + 1;
        if (r.next && r.next.getFullYear() === t.getFullYear() && r.next.getMonth() === t.getMonth()) month++;
        if (r.next && r.days <= 75) up.push({ f: f, r: r });
      });
    });
    up.sort(function (a, b) { return a.r.next - b.r.next; });
    var maxD = Math.max.apply(null, [1].concat(SJ.DOMAINS.map(function (d) { return dom[d] || 0; })));
    var mm = t.getMonth() + 1;

    var h = '<section class="hero lx-hero lx-photo-hero rise">' +
      '<div class="lx-photo" data-parallax><img src="assets/img/gyeongcheonseom.jpg" alt="상주 경천섬과 낙강교, 학전망대 전경" decoding="async"></div>' +
      '<div class="lx-haze"></div><div class="lx-glint"></div>' +
      '<div class="lx-scrim"></div>' + G.cranes() +
      '<div class="lx-road"><i></i></div>' + G.cyclist() +
      '<a class="lx-credit" href="https://korean.visitkorea.or.kr" target="_blank" rel="noopener">사진: 경천섬 · 한국관광공사 (공공누리 제1유형)</a>' +
      '<div class="hero-inner"><div class="lx-kicker"><span class="lx-seal">尙州</span><span>상주시 공공건축물 · 법정 유지관리 업무 안내</span></div>' +
      '<h1><span class="lx-l1">건물마다 다른 법정 의무,</span><b class="lx-l2">한 화면에서 정리합니다</b></h1>' +
      '<p class="lead">시설 담당자가 <strong>“내 건물은 어떤 유형이고, 어떤 법 때문에, 언제, 무엇을 해야 하는가”</strong>를 바로 알 수 있도록 ' +
      '건축물대장 정보와 9개 분야 법령을 대조해 점검·검사·선임·교육·보고 일정을 자동으로 안내합니다.</p>' +
      '<div class="finder"><label class="sr" for="finder">시설 검색</label><div class="search">' + ic('search') +
      '<input id="finder" class="input" type="search" autocomplete="off" placeholder="담당 시설명을 입력하세요  ·  예) 상주시청, 상주박물관, 함창읍" data-input="finder" aria-controls="finderList"></div>' +
      '<div class="finder-list" id="finderList" role="listbox"></div></div>' +
      '<div class="lx-cta"><a class="btn btn-gold" href="#/facilities">' + ic('building') + '내 시설 업무 보기</a><a class="btn" href="#/wizard">' + ic('wand') + '건물 유형 진단</a></div>' +
      '</div></section>';

    // 처음 보는 사람을 위한 사용 흐름
    h += '<section class="lx-steps">' + [
      ['01', 'building', '시설 선택', '상주시 소유 건축물 ' + facs.length + '곳 중 담당 시설을 고릅니다. 연면적·층수·사용승인일은 건축물대장에서 가져옵니다.'],
      ['02', 'target', '법적 유형 자동 판정', '규모·용도·설비로 소방안전관리 등급, 시설물안전법 종별, 중대시민재해 공중이용시설 여부 등을 판정합니다.'],
      ['03', 'calendar', '해야 할 업무와 기한', '점검·검사·선임·교육·보고 업무를 주기와 다음 기한, 근거 조문, 과태료까지 정리하고 완료 이력을 관리합니다.']
    ].map(function (s, i) {
      return '<div class="lx-step rise" style="--i:' + (i + 1) + '"><div class="lx-num">' + s[0] + '</div><div class="lx-medal">' + ic(s[1]) + '</div>' +
        '<h3>' + s[2] + '</h3><p>' + s[3] + '</p></div>';
    }).join('<div class="lx-arrow" aria-hidden="true">' + ic('arrowRight') + '</div>') + '</section>';

    h += '<section class="lx-domains rise" style="--i:4"><div class="lx-dl">검토하는 법령 분야</div><div class="lx-dchips">' +
      SJ.DOMAINS.map(function (d) { return '<span class="lx-dchip">' + ic(d) + '<b>' + d + '</b><i>' + (dom[d] || 0) + '</i></span>'; }).join('') +
      '</div></section>';
    h += dataPanel(A);

    h += dataWarn();
    if (!facs.length) {
      h += '<div class="mt">' + emptyBox('등록된 시설 데이터가 없습니다', 'data/facilities.js가 아직 없거나 비어 있습니다. 유형 진단 마법사로 시설을 직접 등록할 수 있습니다.', '<a class="btn btn-gold" href="#/wizard">' + ic('wand') + '유형 진단으로 시설 등록</a>', 'data') + '</div>';
      return h;
    }
    h += '<div class="grid g-4 mt-l">' +
      kpi('building', '관리 시설', facs.length, '개소', '상주시 소유 공공건축물', '', 1) +
      kpi('list', '총 법정업무', tot, '건', '시설별 적용 업무 합계', '', 2) +
      kpi('calendar', mm + '월 기한 도래', month, '건', '이번 달 말까지 처리', month ? 'k-warn' : '', 3) +
      kpi('alert', '기한 경과', over, '건', soon + '건은 30일 이내 임박', over ? 'k-danger' : '', 4) + '</div>';

    h += '<div class="grid g-main mt">';
    h += '<div class="card rise" style="--i:5"><div class="card-title">' + ic('clock') + '<span>임박 업무 타임라인</span><small>75일 이내</small></div>';
    if (!up.length) h += '<p class="muted small">75일 이내 도래하는 업무가 없습니다.</p>';
    else h += '<ul class="tl">' + up.slice(0, 10).map(function (x) {
      return '<li><div class="d"><b>' + (x.r.next.getMonth() + 1) + '.' + x.r.next.getDate() + '</b>' + dday(x.r) + '</div><i class="dot ' + x.r.status + '"></i>' +
        '<div class="t"><a href="#/facility/' + encodeURIComponent(x.f.id) + '">' + esc(x.r.rule.title) + '</a><div>' + esc(x.f.name) + ' · ' + esc(x.r.rule.domain) + '</div></div></li>';
    }).join('') + '</ul>';
    if (up.length > 10) h += '<p class="small muted" style="margin-top:8px">외 ' + (up.length - 10) + '건 — <a href="#/calendar">연간달력에서 보기</a></p>';
    h += '</div>';
    h += '<div class="card rise" style="--i:6"><div class="card-title">' + ic('target') + '<span>분야별 업무 분포</span><small>전 시설 합계</small></div><div class="bars">' +
      SJ.DOMAINS.map(function (d) {
        var v = dom[d] || 0;
        return '<div class="bar-row">' + ic(d) + '<span>' + d + '</span><div class="bar-track"><div class="bar-fill" data-w="' + (v / maxD * 100).toFixed(1) + '"></div></div><span class="v">' + v + '</span></div>';
      }).join('') + '</div></div>';
    h += '</div>';

    // 주의 시설
    var risk = facs.map(function (f) { return A.map[f.id]; }).filter(function (e) { return e.sum.overdue || e.sum.soon; })
      .sort(function (a, b) { return (b.sum.overdue * 10 + b.sum.soon) - (a.sum.overdue * 10 + a.sum.soon); });
    var hall = facs[0] && A.map[facs[0].id];
    if (hall) risk = [hall].concat(risk.filter(function (e) { return e !== hall; }));
    // 12곳: 위험 순 → 부족하면 나머지 시설로 채움
    facs.forEach(function (f) { var e = A.map[f.id]; if (risk.length < 12 && risk.indexOf(e) < 0) risk.push(e); });
    risk = risk.slice(0, 12);
    h += '<div class="section-head"><div><div class="eyebrow">Attention</div><h2>먼저 챙겨야 할 시설</h2></div><a class="btn btn-sm" href="#/facilities">전체 시설 ' + ic('arrowRight') + '</a></div>';
    h += risk.length ? '<div class="fac-grid">' + risk.map(function (e, i) { return facCard(e, i); }).join('') + '</div>'
      : '<div class="fac-grid">' + facs.slice(0, 6).map(function (f, i) { return facCard(A.map[f.id], i); }).join('') + '</div>';
    return h;
  }
  function kpi(icon, label, v, unit, sub, cls, i) {
    return '<div class="card kpi tilt rise ' + cls + '" style="--i:' + i + '"><div class="k-ic">' + ic(icon) + '</div><div class="k-l">' + label + '</div>' +
      '<div class="k-v"><span data-count="' + v + '">0</span><small>' + unit + '</small></div><div class="k-s">' + sub + '</div><i class="spark"></i></div>';
  }

  /* ---------- 시설 목록 ---------- */
  function facCard(e, i) {
    var f = e.f, s = e.sum, ag = SJ.age(f);
    var top = SJ.legalTypes(e.res).slice(0, 2);
    return '<a class="card fac tilt rise" style="--i:' + Math.min(i, 12) + '" href="#/facility/' + encodeURIComponent(f.id) + '">' +
      '<div class="fac-art">' + G.building(f.category) + '<span class="badge b-gold tag">' + esc(f.category) + '</span>' +
      (f.dataSource === '추정' ? '<span class="badge b-muted tag2">추정 데이터</span>' : '<span class="badge b-jade tag2">' + esc(f.dataSource) + '</span>') + '</div>' +
      '<div class="fac-body"><h3>' + esc(f.name) + '</h3><div class="fac-meta"><span>연면적 ' + fmtN(f.area) + '㎡</span><span>지상' + (f.floorsAbove || '-') + '/지하' + (f.floorsBelow || 0) + '</span>' +
      (ag.years != null ? '<span>준공 ' + ag.years + '년 경과</span>' : '') + '</div>' +
      (top.length ? '<div class="chips">' + top.map(function (t) { return '<span class="badge b-gold">' + esc(t.label) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="fac-foot"><span class="cnt">' + s.total + '<small>건 업무</small></span><span class="sp">' +
      (s.overdue ? '<span class="badge b-danger">경과 ' + s.overdue + '</span>' : '') + (s.soon ? '<span class="badge b-warn">임박 ' + s.soon + '</span>' : '') +
      (!s.overdue && !s.soon ? '<span class="badge b-ok">' + ic('check') + '정상</span>' : '') + '</span></div></div></a>';
  }
  function vFacilities() {
    var A = all(), facs = A.facs, q = state.q.trim().toLowerCase();
    var counts = {}; facs.forEach(function (f) { counts[f.category] = (counts[f.category] || 0) + 1; });
    var list = facs.filter(function (f) {
      if (state.cat !== '전체' && f.category !== state.cat) return false;
      if (!q) return true;
      return (f.name + ' ' + f.address + ' ' + f.jibun + ' ' + f.subUse + ' ' + f.dept).toLowerCase().indexOf(q) >= 0;
    });
    var h = '<div class="section-head" style="margin-top:6px"><div><div class="eyebrow">Facilities</div><h2>시설 목록</h2><p>' + facs.length + '개 시설 · 카드를 누르면 해당 건물의 법정업무를 확인합니다.</p></div>' +
      '<a class="btn btn-gold" href="#/wizard">' + ic('plus') + '시설 등록</a></div>';
    h += dataWarn();
    h += '<div class="card rise" style="padding:16px"><div class="search">' + ic('search') + '<input class="input" type="search" placeholder="시설명·주소·세부용도·부서 검색" value="' + esc(state.q) + '" data-input="q" aria-label="시설 검색"></div>' +
      '<div class="chips mt">' + ['전체'].concat(SJ.CATEGORIES).filter(function (c) { return c === '전체' || counts[c]; }).map(function (c) {
        return '<button class="chip" type="button" data-action="cat" data-v="' + esc(c) + '" aria-pressed="' + (state.cat === c) + '">' + esc(c) + ' <span class="n">' + (c === '전체' ? facs.length : counts[c]) + '</span></button>';
      }).join('') + '</div></div>';
    h += '<div id="facList" class="mt">' + facListHtml(list) + '</div>';
    return h;
  }
  function facListHtml(list) {
    if (!list.length) return emptyBox('조건에 맞는 시설이 없습니다', '검색어나 분류를 바꿔 보세요.');
    var A = all();
    return '<div class="fac-grid">' + list.map(function (f, i) { return facCard(A.map[f.id], i); }).join('') + '</div>';
  }

  /* ---------- 시설 상세 ---------- */
  function vFacility(r) {
    var A = all(), e = A.map[r.id];
    if (!e) return emptyBox('시설을 찾을 수 없습니다', '삭제되었거나 잘못된 주소입니다.', '<a class="btn" href="#/facilities">' + ic('arrowLeft') + '시설 목록</a>');
    var f = e.f, res = e.res, s = e.sum, ag = SJ.age(f), types = SJ.legalTypes(res);
    var agB = { old: 'b-danger', warn: 'b-warn', good: 'b-ok', unknown: 'b-muted' }[ag.level];
    var gradeB = { A: 'b-ok', B: 'b-ok', C: 'b-warn', D: 'b-danger', E: 'b-danger' }[f.safetyGrade] || 'b-muted';
    var hasApi = !!(window.SJ_API && typeof window.SJ_API.lookupFacility === 'function');
    var h = provenance(e.f);

    h += '<section class="card det-hero rise"><div>' +
      '<div class="chips"><span class="badge b-gold">' + esc(f.category) + '</span>' + (f.subUse ? '<span class="badge b-muted">' + esc(f.subUse) + '</span>' : '') +
      '<span class="badge ' + (f.dataSource === '추정' ? 'b-warn' : 'b-jade') + '">' + ic('db') + '데이터: ' + esc(f.dataSource) + '</span></div>' +
      '<h1>' + esc(f.name) + '</h1><div class="addr"><span>' + esc(f.address || f.jibun || '주소 미상') + '</span>' + (f.dept ? '<span>관리 ' + esc(f.dept) + '</span>' : '') + '</div>' +
      (f.summary ? '<p class="sum">' + esc(f.summary) + '</p>' : '') +
      '<div class="stats">' +
      stat('준공 경과', ag.years != null ? ag.years + '<small>년</small>' : '-', '<span class="badge ' + agB + '">' + ag.stage + '</span>') +
      stat('안전등급', f.safetyGrade ? f.safetyGrade + '<small>등급</small>' : '-', '<span class="badge ' + gradeB + '">' + (f.safetyGrade ? '최근 점검' : '미상') + '</span>') +
      stat('연면적', fmtN(f.area) + '<small>㎡</small>', '<span class="small muted">지상 ' + (f.floorsAbove || '-') + ' · 지하 ' + (f.floorsBelow || 0) + '</span>') +
      stat('법정업무', s.total + '<small>건</small>', '<span class="small muted">중대 ' + s.critical + '건</span>') + '</div>' +
      (f.lastRepair ? '<p class="small muted mt">' + ic('edit') + ' 최근 보수: ' + esc(f.lastRepair) + '</p>' : '') +
      '<div class="btn-row mt">' +
      '<button class="btn btn-gold" type="button" data-action="print">' + ic('print') + '연간 업무계획서</button>' +
      '<a class="btn" href="#/calendar?f=' + encodeURIComponent(f.id) + '" data-action="calFor" data-id="' + esc(f.id) + '">' + ic('calendar') + '연간달력</a>' +
      '<button class="btn" type="button" data-action="edit">' + ic('edit') + '속성 편집</button>' +
      '<button class="btn" type="button" data-action="api"' + (hasApi ? '' : ' disabled title="API 모듈 없음"') + '>' + ic('db') + (hasApi ? '건축물대장 불러오기' : 'API 모듈 없음') + '</button>' +
      '</div></div>' +
      '<div class="stack"><div class="det-art">' + G.building(f.category, f.name + ' 일러스트') + '</div>' +
      '<div class="status-panel"><div class="ring-wrap">' + G.ring(s.rate, 132, '법정업무 이행 기록률') + '<div class="rv"><b>' + s.rate + '%</b><span>이행 기록률</span></div></div>' +
      '<div class="lights"><div class="light r' + (s.overdue ? ' on' : '') + '"><i></i>기한 경과<b>' + s.overdue + '</b></div>' +
      '<div class="light y' + (s.soon ? ' on' : '') + '"><i></i>30일 이내 임박<b>' + s.soon + '</b></div>' +
      '<div class="light g' + (s.ok ? ' on' : '') + '"><i></i>정상 예정<b>' + s.ok + '</b></div>' +
      '<div class="light"><i></i>사유 발생 시<b>' + s.event + '</b></div></div></div></div></section>';

    if (f.dataSource === '추정') h += '<div class="notice mt rise">' + ic('alert') + '<div><b>이 시설의 속성은 추정값입니다.</b> 연면적·층수·설비 유무에 따라 적용 업무가 달라지므로 건축물대장·소방시설 현황으로 확인 후 수정하세요.</div><button class="btn btn-sm" type="button" data-action="edit">' + ic('edit') + '확인·수정</button></div>';

    // 지금 할 일
    var now = res.filter(function (x) { return x.status !== 'event'; }).slice(0, 4);
    if (now.length) h += '<div class="section-head"><div><div class="eyebrow">To-do</div><h2>지금 챙길 업무</h2></div><p>기한이 가까운 순</p></div><div class="todo-strip">' +
      now.map(function (x, i) {
        return '<button type="button" class="todo rise ' + x.status + '" style="--i:' + i + '" data-action="jump" data-id="' + esc(x.rule.id) + '"><div class="dd">' + dday(x) + '</div><div><div class="tt">' + esc(x.rule.title) + '</div><div class="ts">' + esc(x.rule.domain) + ' · ' + fmtD(x.next) + '</div></div></button>';
      }).join('') + '</div>';

    // 법적 유형
    h += '<div class="section-head"><div><div class="eyebrow">Legal Profile</div><h2>이 건물의 법적 유형</h2></div><p>규모·용도·설비로 판정된 관리대상 구분</p></div>';
    h += types.length ? '<div class="chips">' + types.map(function (t, i) {
      return '<span class="legal rise" style="--i:' + i + '"><span class="lg-i">' + ic(t.domain) + '</span><span><small>' + esc(t.domain) + '</small>' + esc(t.label) + '</span></span>';
    }).join('') + '</div>' : '<p class="muted small">판정된 등급·종별이 없습니다' + (res.length ? '' : ' (적용 업무 없음)') + '.</p>';

    // 프로필 + 단면
    h += '<div class="profile mt-l"><div class="card rise"><div class="card-title">' + ic('building') + '<span>건물 프로필</span><small>' + esc(f.id) + '</small></div><dl class="kv">' +
      [['주용도', f.buildingUse], ['세부용도', f.subUse], ['사용승인일', f.approvalDate], ['구조', f.structure], ['높이', f.height ? f.height + 'm' : ''], ['상시 인원', f.workers ? f.workers + '명' : ''],
       ['승강기', f.elevators + '대' + (f.elevatorYear ? ' (' + f.elevatorYear + ')' : '')], ['에스컬레이터', f.escalators + '대'], ['수전', (f.voltage || '') + (f.receivingKW ? ' ' + fmtN(f.receivingKW) + 'kW' : '')],
       ['비상발전기', f.generatorKW ? f.generatorKW + 'kW' : '없음'], ['태양광', f.solarKW ? f.solarKW + 'kW' : '없음'], ['가스', f.gasType + (f.lpgKg ? ' ' + f.lpgKg + 'kg' : '')],
       ['보일러', f.boilers ? f.boilers + '대(' + f.boilerKind + ')' : '없음'], ['냉동기', f.chillerRT ? f.chillerRT + 'RT' : '없음'], ['저수조', f.waterTankM3 ? f.waterTankM3 + '㎥' : '없음'], ['오수', f.sewage],
       ['객석', f.seats ? fmtN(f.seats) + '석' : '-'], ['국가유산', f.heritage || '해당없음']].map(function (kv) {
        return '<div><dt>' + kv[0] + '</dt><dd>' + esc(kv[1] || '-') + '</dd></div>';
      }).join('') + '</dl>' +
      '<div class="chips mt">' + [['sprinkler', '스프링클러'], ['simpleSprinkler', '간이스프링클러'], ['indoorHydrant', '옥내소화전'], ['autoDetection', '자동화재탐지'], ['waterSpray', '물분무등'], ['smokeControl', '제연'],
        ['playground', '어린이놀이시설'], ['sportsFacility', '체육시설'], ['asbestos', '석면건축물'], ['multiUseBiz', '다중이용업소'], ['childcare', '아동시설'], ['elderly', '노인시설'], ['evCharger', 'EV충전']]
        .filter(function (k) { return f[k[0]]; }).map(function (k) { return '<span class="badge b-sky">' + k[1] + '</span>'; }).join('') + '</div></div>' +
      '<div class="card rise" style="--i:1"><div class="card-title">' + ic('target') + '<span>건물 단면 다이어그램</span><small>데이터 기반 개략도</small></div>' + G.section(f) +
      '<div class="legend"><span><i style="background:var(--sky)"></i>스프링클러 헤드</span><span><i style="background:var(--danger)"></i>옥내소화전</span><span><i style="border:1.5px solid var(--warn)"></i>감지기</span>' +
      '<span><i style="background:var(--gold)"></i>승강기</span><span><i style="background:var(--warn)"></i>수전·전기</span><span><i style="background:var(--persimmon)"></i>발전기·가스</span></div></div></div>';

    // 분야별 업무
    var doms = SJ.DOMAINS.filter(function (d) { return res.some(function (x) { return x.rule.domain === d; }); });
    res.forEach(function (x) { if (doms.indexOf(x.rule.domain) < 0) doms.push(x.rule.domain); });
    h += '<div class="section-head" id="tasks"><div><div class="eyebrow">Statutory Duties</div><h2>분야별 법정업무 ' + res.length + '건</h2></div>' +
      '<div class="chips">' + ['전체'].concat(doms).map(function (d) {
        var n = d === '전체' ? res.length : res.filter(function (x) { return x.rule.domain === d; }).length;
        return '<button class="chip" type="button" data-action="detDom" data-v="' + esc(d) + '" aria-pressed="' + (state.detDom === d) + '">' + esc(d) + ' <span class="n">' + n + '</span></button>';
      }).join('') + '</div></div>';
    if (!res.length) h += emptyBox('적용되는 법정업무가 없습니다', SJ.rules().length ? '현재 속성 기준으로 해당 규칙이 없습니다. 속성이 정확한지 확인하세요.' : '규칙 데이터가 로드되지 않았습니다.');
    doms.forEach(function (d) {
      if (state.detDom !== '전체' && state.detDom !== d) return;
      var items = res.filter(function (x) { return x.rule.domain === d; });
      h += '<div class="dom-group"><div class="dom-head"><span class="di">' + ic(d) + '</span><h3>' + esc(d) + '</h3><span class="badge b-gold">' + items.length + '건</span><span class="ln"></span></div><div class="tasks">' +
        items.map(function (x, i) { return taskCard(f, x, i); }).join('') + '</div></div>';
    });
    return h;
  }
  function stat(l, v, extra) { return '<div class="stat"><div class="l">' + l + '</div><div class="v">' + v + '</div>' + (extra || '') + '</div>'; }
  function taskCard(f, x, i) {
    var r = x.rule, tasks = Array.isArray(r.tasks) ? r.tasks : [];
    var pop = state.donePop === r.id;
    return '<article class="card task rise ' + x.status + '" style="--i:' + Math.min(i, 8) + '" id="rule-' + esc(r.id) + '">' +
      '<div class="task-top"><h4>' + esc(r.title) + '<small>' + esc(r.cycleText || '') + '</small></h4>' +
      '<div class="due ' + x.status + '"><b>' + dday(x) + '</b><span>' + (x.next ? fmtD(x.next) : STATUS.event) + '</span></div></div>' +
      '<div class="badges"><span class="badge ' + STATUS_B[x.status] + '">' + STATUS[x.status] + '</span>' +
      '<span class="badge ' + PRI_B[r.priority || 'normal'] + '">' + (SJ.PRIORITY[r.priority] || '일반') + '</span>' +
      (r.kind ? '<span class="badge b-sky">' + esc(SJ.KINDS[r.kind] || r.kind) + '</span>' : '') +
      (x.grade ? '<span class="badge b-gold">' + esc(x.grade) + '</span>' : '') +
      (r.verify ? '<span class="badge b-pers" title="수치·조문 확인 필요">' + ic('alert') + '확인필요</span>' : '') + '</div>' +
      (r.target ? '<div class="target"><b>대상 사유</b>' + esc(r.target) + '</div>' : '') +
      (tasks.length ? '<ul class="checklist">' + tasks.map(function (t, k) { return '<li><label><input type="checkbox" aria-label="할 일 ' + (k + 1) + '"><span>' + esc(t) + '</span></label></li>'; }).join('') + '</ul>' : '') +
      '<dl class="meta-dl">' +
      (r.deadline ? '<dt>' + ic('clock') + '후속 기한</dt><dd>' + esc(r.deadline) + '</dd>' : '') +
      (r.performer ? '<dt>' + ic('user') + '수행자</dt><dd>' + esc(r.performer) + '</dd>' : '') +
      (r.records ? '<dt>' + ic('archive') + '보관</dt><dd>' + esc(r.records) + '</dd>' : '') +
      (r.penalty ? '<dt>' + ic('gavel') + '벌칙</dt><dd class="pen">' + esc(r.penalty) + '</dd>' : '') +
      '<dt>' + ic('book') + '근거</dt><dd>' + lawLink(r) + '</dd></dl>' +
      (r.notes ? '<details class="more"><summary>비고 보기</summary><p class="small muted">' + esc(r.notes) + '</p></details>' : '') +
      '<div class="task-foot"><span class="hist">' + (x.lastDone ? '최근 이행 ' + esc(x.lastDone) + ' · ' + x.history.length + '회 기록' : '이행 기록 없음') + '</span>' +
      (pop ? '<span class="done-pop"><label class="sr" for="dd-' + esc(r.id) + '">이행일</label><input id="dd-' + esc(r.id) + '" class="input" type="date" value="' + SJ.iso(SJ.today()) + '" max="' + SJ.iso(SJ.today()) + '">' +
        '<button class="btn btn-gold btn-sm" type="button" data-action="doneSave" data-id="' + esc(r.id) + '">' + ic('check') + '저장</button><button class="btn btn-ghost btn-sm" type="button" data-action="doneCancel">취소</button></span>'
        : (x.lastDone ? '<button class="btn btn-ghost btn-sm" type="button" data-action="undo" data-id="' + esc(r.id) + '" title="최근 기록 취소">' + ic('undo') + '</button>' : '') +
          '<button class="btn btn-gold btn-sm" type="button" data-action="done" data-id="' + esc(r.id) + '">' + ic('check') + '완료 처리</button>') +
      '</div></article>';
  }

  /* ---------- 인쇄: 연간 업무계획서 ---------- */
  function printPlan(f) {
    var res = SJ.evaluate(f), y = SJ.today().getFullYear();
    var rows = res.map(function (x) {
      var occ = SJ.occurrences(x.rule, f, y, x.lastDone), cells = '';
      for (var m = 1; m <= 12; m++) cells += '<td class="c">' + (occ.indexOf(m) >= 0 ? '●' : '') + '</td>';
      return '<tr><td>' + esc(x.rule.domain) + '</td><td><b>' + esc(x.rule.title) + '</b>' + (x.grade ? '<br>' + esc(x.grade) : '') + '</td><td>' + esc(x.rule.cycleText || '') + '</td>' + cells +
        '<td>' + (x.next ? fmtD(x.next) : '수시') + '</td><td>' + esc(x.rule.performer || '') + '</td><td>' + esc(x.rule.law || '') + ' ' + esc(x.rule.basis || '') + '</td><td></td></tr>';
    }).join('');
    var head = ''; for (var m = 1; m <= 12; m++) head += '<th>' + m + '월</th>';
    document.getElementById('printRoot').innerHTML = '<h1>' + y + '년 ' + esc(f.name) + ' 유지관리 법정업무 연간계획서</h1>' +
      '<div class="pm">' + esc(f.address || '') + ' · 관리부서 ' + esc(f.dept || '-') + ' · 연면적 ' + fmtN(f.area) + '㎡ · 지상 ' + (f.floorsAbove || '-') + '/지하 ' + (f.floorsBelow || 0) + '층 · 사용승인 ' + esc(f.approvalDate || '-') + ' · 출력일 ' + SJ.iso(SJ.today()) + '</div>' +
      '<table><thead><tr><th>분야</th><th>업무</th><th>주기</th>' + head + '<th>차기 기한</th><th>수행자</th><th>근거</th><th>확인</th></tr></thead><tbody>' + (rows || '<tr><td colspan="19">적용 업무 없음</td></tr>') + '</tbody></table>' +
      '<div class="sig"><div>담당</div><div>팀장</div><div>과장</div></div>';
    window.print();
  }

  /* ---------- 연간 달력 ---------- */
  function vCalendar() {
    var A = all(), y = SJ.today().getFullYear(), cm = SJ.today().getMonth() + 1;
    var m = /[?&]f=([^&]+)/.exec(location.hash); if (m) state.calFac = decodeURIComponent(m[1]);
    var sel = state.calFac && A.map[state.calFac] ? state.calFac : '';
    var h = '<div class="section-head" style="margin-top:6px"><div><div class="eyebrow">Annual Calendar</div><h2>' + y + '년 연간 업무 달력</h2><p>' + (sel ? '선택 시설의 월별 기한' : '전체 시설: 월별 기한 도래 시설 수') + '</p></div>' +
      '<div style="min-width:min(100%,320px)"><label class="sr" for="calSel">시설 선택</label><select id="calSel" class="input" data-input="calFac"><option value="">전체 시설</option>' +
      A.facs.map(function (f) { return '<option value="' + esc(f.id) + '"' + (f.id === sel ? ' selected' : '') + '>' + esc(f.name) + '</option>'; }).join('') + '</select></div></div>';
    h += dataWarn();
    var head = '<tr><th class="name">업무</th>'; for (var i = 1; i <= 12; i++) head += '<th' + (i === cm ? ' class="now"' : '') + '>' + i + '월</th>'; head += '</tr>';
    var body = '';
    var rows = [];
    if (sel) {
      var e = A.map[sel];
      e.res.forEach(function (x) { rows.push({ r: x.rule, sub: (x.grade || x.rule.cycleText || ''), occ: SJ.occurrences(x.rule, e.f, y, x.lastDone) }); });
    } else {
      A.rules.forEach(function (r) {
        var cnt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], nf = 0;
        A.facs.forEach(function (f) {
          var x = A.map[f.id].res.filter(function (z) { return z.rule.id === r.id; })[0];
          if (!x) return; nf++;
          SJ.occurrences(r, f, y, x.lastDone).forEach(function (mm) { cnt[mm]++; });
        });
        if (nf) rows.push({ r: r, sub: nf + '개 시설 적용', cnt: cnt, nf: nf });
      });
    }
    if (!rows.length) return h + emptyBox('표시할 업무가 없습니다', '시설 또는 규칙 데이터를 확인하세요.');
    SJ.DOMAINS.concat(['기타']).forEach(function (d) {
      var rs = rows.filter(function (x) { return d === '기타' ? SJ.DOMAINS.indexOf(x.r.domain) < 0 : x.r.domain === d; });
      if (!rs.length) return;
      body += '<tr class="dom"><td colspan="13">' + esc(d) + '</td></tr>';
      rs.forEach(function (x) {
        var cells = '', any = false;
        for (var mm = 1; mm <= 12; mm++) {
          var v = x.cnt ? x.cnt[mm] : (x.occ.indexOf(mm) >= 0 ? 1 : 0);
          if (v) any = true;
          cells += '<td>' + (v ? (x.cnt ? '<span class="m h" style="--h:' + Math.round(25 + 75 * v / x.nf) + '" title="' + v + '개 시설">' + v + '</span>' : '<span class="m">●</span>') : '') + '</td>';
        }
        if (!any) cells = '<td colspan="12" class="ev">' + (x.r.anchor === 'event' || !x.r.cycleMonths ? '사유 발생 시 수행' : '올해 도래 없음 (' + esc(x.r.cycleText || '') + ')') + '</td>';
        body += '<tr><td class="name">' + esc(x.r.title) + '<small>' + esc(x.sub) + '</small></td>' + cells + '</tr>';
      });
    });
    h += '<div class="card rise" style="padding:0"><div class="cal-wrap"><table class="cal"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div></div>';
    if (sel) h += '<div class="btn-row mt"><a class="btn" href="#/facility/' + encodeURIComponent(sel) + '">' + ic('building') + '시설 상세로</a><button class="btn btn-gold" type="button" data-action="printCal">' + ic('print') + '연간 업무계획서 인쇄</button></div>';
    return h;
  }

  /* ---------- 법령 사전 ---------- */
  function vLaws() {
    var A = all(), q = state.lawQ.trim().toLowerCase();
    var h = '<div class="section-head" style="margin-top:6px"><div><div class="eyebrow">Statute Library</div><h2>법령 사전</h2><p>규칙 ' + A.rules.length + '건 · 분야·법령별 의무와 적용 시설 수</p></div></div>';
    if (!A.rules.length) return h + emptyBox('규칙 데이터가 없습니다', 'data/rules/*.js 파일이 로드되면 이곳에 법정업무가 표시됩니다.', '', 'data');
    var cnt = {}; A.rules.forEach(function (r) { cnt[r.domain] = (cnt[r.domain] || 0) + 1; });
    h += '<div class="card rise" style="padding:16px"><div class="search">' + ic('search') + '<input class="input" type="search" placeholder="업무명·법령·조문·대상 검색" value="' + esc(state.lawQ) + '" data-input="lawQ" aria-label="법령 검색"></div><div class="chips mt">' +
      ['전체'].concat(SJ.DOMAINS.filter(function (d) { return cnt[d]; })).map(function (d) {
        return '<button class="chip" type="button" data-action="lawDom" data-v="' + esc(d) + '" aria-pressed="' + (state.lawDom === d) + '">' + (d === '전체' ? '' : ic(d)) + esc(d) + ' <span class="n">' + (d === '전체' ? A.rules.length : cnt[d]) + '</span></button>';
      }).join('') + '</div></div><div id="lawList">' + lawList() + '</div>';
    return h;
  }
  function lawList() {
    var A = all(), q = state.lawQ.trim().toLowerCase(), h = '';
    var rs = A.rules.filter(function (r) {
      if (state.lawDom !== '전체' && r.domain !== state.lawDom) return false;
      if (!q) return true;
      return [r.title, r.law, r.basis, r.target, r.id].join(' ').toLowerCase().indexOf(q) >= 0;
    });
    if (!rs.length) return '<div class="mt">' + emptyBox('검색 결과가 없습니다', '다른 검색어를 입력해 보세요.') + '</div>';
    SJ.DOMAINS.concat(['기타']).forEach(function (d) {
      var dr = rs.filter(function (r) { return d === '기타' ? SJ.DOMAINS.indexOf(r.domain) < 0 : r.domain === d; });
      if (!dr.length) return;
      h += '<div class="dom-group"><div class="dom-head"><span class="di">' + ic(d) + '</span><h3>' + esc(d) + '</h3><span class="badge b-gold">' + dr.length + '건</span><span class="ln"></span></div>';
      var laws = []; dr.forEach(function (r) { if (laws.indexOf(r.law) < 0) laws.push(r.law); });
      laws.forEach(function (lw) {
        var lr = dr.filter(function (r) { return r.law === lw; });
        h += '<div class="law-name">' + ic('book') + esc(lw || '법령 미기재') + (lr[0].lawUrl ? ' <a href="' + esc(lr[0].lawUrl) + '" target="_blank" rel="noopener">' + ic('link') + '원문</a>' : '') + '</div>';
        lr.forEach(function (r) {
          var facs = A.facs.filter(function (f) { return A.map[f.id].res.some(function (x) { return x.rule.id === r.id; }); });
          h += '<details class="rule-item"><summary><span class="badge ' + PRI_B[r.priority || 'normal'] + '">' + (SJ.PRIORITY[r.priority] || '일반') + '</span><span class="rt">' + esc(r.title) + '</span>' +
            '<span class="rc">' + esc(r.cycleText || '') + '</span><span class="badge b-jade">' + facs.length + '개 시설</span></summary><div class="rb">' +
            (r.target ? '<div class="notice info">' + ic('target') + '<div><b>적용 조건</b><br>' + esc(r.target) + '</div></div>' : '') +
            '<dl class="meta-dl">' + (r.kind ? '<dt>유형</dt><dd>' + esc(SJ.KINDS[r.kind] || r.kind) + '</dd>' : '') +
            (r.deadline ? '<dt>후속 기한</dt><dd>' + esc(r.deadline) + '</dd>' : '') + (r.performer ? '<dt>수행자</dt><dd>' + esc(r.performer) + '</dd>' : '') +
            (r.records ? '<dt>보관</dt><dd>' + esc(r.records) + '</dd>' : '') + (r.penalty ? '<dt>벌칙</dt><dd class="pen">' + esc(r.penalty) + '</dd>' : '') +
            '<dt>근거</dt><dd>' + lawLink(r) + '</dd><dt>ID</dt><dd>' + esc(r.id) + (r.verify ? ' <span class="badge b-pers">확인필요</span>' : '') + '</dd></dl>' +
            (r.notes ? '<p class="small muted">' + esc(r.notes) + '</p>' : '') +
            (facs.length ? '<div class="fac-links">' + facs.map(function (f) { return '<a href="#/facility/' + encodeURIComponent(f.id) + '">' + esc(f.name) + '</a>'; }).join('') + '</div>' : '<p class="small muted">현재 적용 시설 없음</p>') +
            '</div></details>';
        });
      });
      h += '</div>';
    });
    return h;
  }

  /* ---------- 유형 진단 마법사 ---------- */
  function vWizard() {
    if (!state.wiz) state.wiz = { step: 0, f: SJ.normalize({ id: '', name: '', category: '본청·청사', buildingUse: '업무시설', dataSource: '사용자입력' }) };
    var w = state.wiz, f = w.f, names = ['① 용도', '② 규모', '③ 설비', '④ 결과'];
    var h = '<div class="section-head" style="margin-top:6px"><div><div class="eyebrow">Type Diagnosis</div><h2>유형 진단 마법사</h2><p>질문에 답하면 적용되는 법정업무를 미리 보여주고, 신규 시설로 등록할 수 있습니다.</p></div></div>';
    h += '<div class="card rise"><div class="steps">' + names.map(function (n, i) { return '<span class="' + (i === w.step ? 'on' : i < w.step ? 'done' : '') + '">' + n + '</span>'; }).join('') + '</div>';
    if (w.step === 0) {
      h += '<div class="pick">' + SJ.CATEGORIES.map(function (c) { return '<button type="button" data-action="wizCat" data-v="' + esc(c) + '" aria-pressed="' + (f.category === c) + '">' + G.building(c) + esc(c) + '</button>'; }).join('') + '</div>' +
        '<div class="form-grid mt">' + fld('name', '시설명', 'text') + sel('buildingUse', '건축법 주용도', ['업무시설', '문화및집회시설', '교육연구시설', '노유자시설', '운동시설', '관광휴게시설', '근린생활시설', '의료시설', '수련시설', '묘지관련시설', '창고시설', '기타']) + fld('subUse', '세부용도 (예: 박물관)', 'text') + '</div>';
    } else if (w.step === 1) {
      h += '<div class="form-grid">' + fld('area', '연면적(㎡)', 'number') + fld('floorsAbove', '지상층수', 'number') + fld('floorsBelow', '지하층수', 'number') + fld('approvalDate', '사용승인일', 'date') + fld('height', '높이(m)', 'number') + fld('workers', '상시 근무 인원', 'number') + fld('seats', '객석 수', 'number') + '</div>';
    } else if (w.step === 2) {
      h += equipForm();
    } else {
      var res = SJ.evaluate(f), sm = SJ.summarize(res), types = SJ.legalTypes(res);
      h += '<div class="grid g-3">' + stat('적용 업무', res.length + '<small>건</small>') + stat('중대(형사처벌)', sm.critical + '<small>건</small>') + stat('법적 유형', types.length + '<small>종</small>') + '</div>' +
        (types.length ? '<div class="chips mt">' + types.map(function (t) { return '<span class="legal"><span class="lg-i">' + ic(t.domain) + '</span><span><small>' + esc(t.domain) + '</small>' + esc(t.label) + '</span></span>'; }).join('') + '</div>' : '') +
        '<div class="mt">' + (res.length ? SJ.DOMAINS.map(function (d) {
          var it = res.filter(function (x) { return x.rule.domain === d; }); if (!it.length) return '';
          return '<div class="law-name">' + ic(d) + esc(d) + ' <span class="badge b-gold">' + it.length + '</span></div><div class="chips">' + it.map(function (x) { return '<span class="badge ' + PRI_B[x.rule.priority || 'normal'] + '">' + esc(x.rule.title) + '</span>'; }).join('') + '</div>';
        }).join('') : '<p class="muted">적용 업무가 없습니다' + (SJ.rules().length ? '.' : ' (규칙 데이터 미로드).') + '</p>') + '</div>';
    }
    h += '<div class="btn-row mt-l"><button class="btn" type="button" data-action="wizPrev"' + (w.step ? '' : ' disabled') + '>' + ic('arrowLeft') + '이전</button>' +
      (w.step < 3 ? '<button class="btn btn-gold" type="button" data-action="wizNext">다음 ' + ic('arrowRight') + '</button>' : '<button class="btn btn-gold" type="button" data-action="wizSave">' + ic('plus') + '이 내용으로 시설 등록</button>') +
      '<button class="btn btn-ghost" type="button" data-action="wizReset">' + ic('reset') + '처음부터</button></div></div>';
    return h;
  }
  function fld(k, label, type, src) {
    var f = src || state.wiz.f, v = f[k] == null ? '' : f[k];
    return '<label class="field">' + label + '<input class="input" type="' + type + '" data-f="' + k + '" value="' + esc(v) + '"' + (type === 'number' ? ' step="any" min="0" inputmode="decimal"' : '') + '></label>';
  }
  function sel(k, label, opts, src) {
    var f = src || state.wiz.f;
    return '<label class="field">' + label + '<select class="input" data-f="' + k + '">' + opts.map(function (o) { return '<option' + (String(f[k]) === String(o) ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></label>';
  }
  function chk(k, label, src) { var f = src || state.wiz.f; return '<label class="chk"><input type="checkbox" data-f="' + k + '"' + (f[k] ? ' checked' : '') + '>' + label + '</label>'; }
  function equipForm(src) {
    return '<div class="form-grid"><div class="form-sec">소방시설</div>' + chk('sprinkler', '스프링클러설비', src) + chk('simpleSprinkler', '간이스프링클러', src) + chk('indoorHydrant', '옥내소화전', src) + chk('autoDetection', '자동화재탐지설비', src) + chk('waterSpray', '물분무등소화설비', src) + chk('smokeControl', '제연설비', src) +
      '<div class="form-sec">승강기·전기</div>' + fld('elevators', '승강기 대수', 'number', src) + fld('escalators', '에스컬레이터 대수', 'number', src) + fld('elevatorYear', '최고(最古) 승강기 설치연도', 'number', src) +
      sel('voltage', '수전전압', ['', '저압', '고압', '특고압'], src) + fld('receivingKW', '수전용량(kW)', 'number', src) + fld('generatorKW', '비상발전기(kW)', 'number', src) + fld('solarKW', '태양광(kW)', 'number', src) + fld('fuelL', '경유 저장량(L)', 'number', src) + chk('evCharger', '전기차충전시설', src) +
      '<div class="form-sec">가스·기계·환경</div>' + sel('gasType', '가스', ['없음', '도시가스', 'LPG'], src) + fld('lpgKg', 'LPG 저장능력(kg)', 'number', src) + fld('boilers', '보일러 대수', 'number', src) + sel('boilerKind', '보일러 종류', ['없음', '가스', '기름', '전기'], src) +
      fld('chillerRT', '냉동기(RT)', 'number', src) + fld('waterTankM3', '저수조(㎥)', 'number', src) + sel('sewage', '오수처리', ['공공하수도', '정화조', '오수처리시설'], src) + fld('sewageCapacity', '처리대상인원/용량', 'number', src) +
      '<div class="form-sec">특수 여건</div>' + chk('playground', '어린이놀이시설', src) + chk('sportsFacility', '체육시설', src) + chk('asbestos', '석면건축물', src) + chk('multiUseBiz', '다중이용업소 입점', src) + chk('childcare', '어린이집/아동시설', src) + chk('elderly', '노인복지시설', src) +
      sel('heritage', '국가유산', ['', '국가지정', '시도지정', '등록'], src) + '</div>';
  }
  var NUMF = ['area', 'floorsAbove', 'floorsBelow', 'height', 'workers', 'seats', 'elevators', 'escalators', 'elevatorYear', 'receivingKW', 'generatorKW', 'solarKW', 'fuelL', 'lpgKg', 'boilers', 'chillerRT', 'waterTankM3', 'sewageCapacity'];
  var ZEROF = ['elevators', 'escalators', 'boilers'];
  function readField(el, f) {
    var k = el.getAttribute('data-f'), v;
    if (el.type === 'checkbox') v = el.checked;
    else if (NUMF.indexOf(k) >= 0) { v = el.value === '' ? (ZEROF.indexOf(k) >= 0 ? 0 : null) : Number(el.value); if (!isFinite(v)) v = null; }
    else if (k === 'voltage' || k === 'approvalDate') v = el.value || null;
    else v = el.value;
    f[k] = v;
  }

  /* ---------- 시설 편집 모달 ---------- */
  function openEdit(f, apiPatch) {
    var d = SJ.normalize(f);
    if (apiPatch) for (var k in apiPatch) if (apiPatch[k] != null && apiPatch[k] !== '' && k in SJ.DEFAULTS) d[k] = apiPatch[k];
    var w = { f: d }; state.edit = w;
    var root = document.getElementById('modalRoot');
    root.innerHTML = '<div class="modal-back" data-action="modalBack"><div class="card modal" role="dialog" aria-modal="true" aria-labelledby="mdT">' +
      '<div class="modal-head"><h2 id="mdT">' + esc(d.name) + ' 속성 편집</h2><button class="btn btn-icon btn-ghost" type="button" data-action="modalClose" aria-label="닫기">' + ic('close') + '</button></div>' +
      (apiPatch ? '<div class="notice info">' + ic('db') + '<div>건축물대장 조회값이 반영되었습니다. 확인 후 저장하세요.</div></div>' : '') +
      '<div class="form-grid" id="editForm">' + fld('name', '시설명', 'text', d) + sel('category', '분류', SJ.CATEGORIES, d) + fld('dept', '관리부서', 'text', d) +
      '<div class="wide">' + fld('address', '도로명주소', 'text', d) + '</div><div class="wide">' + fld('jibun', '지번주소 (건축물대장 조회용)', 'text', d) + '</div>' +
      sel('buildingUse', '주용도', ['업무시설', '문화및집회시설', '교육연구시설', '노유자시설', '운동시설', '관광휴게시설', '근린생활시설', '의료시설', '수련시설', '묘지관련시설', '창고시설', '기타'], d) + fld('subUse', '세부용도', 'text', d) + fld('structure', '구조', 'text', d) +
      fld('approvalDate', '사용승인일', 'date', d) + fld('area', '연면적(㎡)', 'number', d) + fld('height', '높이(m)', 'number', d) + fld('floorsAbove', '지상층수', 'number', d) + fld('floorsBelow', '지하층수', 'number', d) + fld('workers', '상시 인원', 'number', d) +
      fld('seats', '객석 수', 'number', d) + sel('safetyGrade', '안전등급', ['', 'A', 'B', 'C', 'D', 'E'], d) + fld('lastRepair', '최근 보수', 'text', d) +
      '<div class="wide"><label class="field">시설 소개<textarea class="input" rows="2" data-f="summary">' + esc(d.summary) + '</textarea></label></div></div>' +
      equipForm(d).replace('<div class="form-grid">', '<div class="form-grid" id="editForm2">') +
      '<div class="btn-row mt-l"><button class="btn btn-gold" type="button" data-action="editSave">' + ic('check') + '저장하고 재판정</button>' +
      (SJ.isModified(d.id) && SJ.isBase(d.id) ? '<button class="btn" type="button" data-action="editRevert">' + ic('reset') + '원본 데이터로 되돌리기</button>' : '') +
      '<button class="btn btn-ghost" type="button" data-action="modalClose">취소</button></div></div></div>';
    var first = root.querySelector('input'); if (first) first.focus();
  }
  function closeModal() { document.getElementById('modalRoot').innerHTML = ''; state.edit = null; }
  function runApi(f) {
    var key = SJ.store.getRaw(SJ.store.KEYS.key);
    if (!key) { toast('설정에서 공공데이터 서비스키를 먼저 입력하세요.'); location.hash = '#/settings'; return; }
    if (!f.jibun) { toast('지번주소가 없어 조회할 수 없습니다. 속성 편집에서 입력하세요.'); return; }
    toast('건축물대장 조회 중…');
    try {
      window.SJ_API.lookupFacility(f, key).then(function (r) {
        if (!r || !r.ok) { toast((r && r.error) || '조회 실패'); return; }
        if (r.warning) toast(r.warning);
        var p = r.patch || {}; p.dataSource = '건축물대장';
        openEdit(f, p);
      }, function (e) { toast('조회 실패: ' + (e && e.message || e)); });
    } catch (e) { toast('API 호출 오류: ' + e.message); }
  }

  /* ---------- 설정 ---------- */
  function vSettings() {
    var A = all(), key = SJ.store.getRaw(SJ.store.KEYS.key), dc = {}, ver = 0;
    A.rules.forEach(function (r) { dc[r.domain] = (dc[r.domain] || 0) + 1; if (r.verify) ver++; });
    var api = window.SJ_API;
    var h = '<div class="section-head" style="margin-top:6px"><div><div class="eyebrow">Settings</div><h2>설정 · 데이터</h2></div></div><div class="grid g-2">';
    h += '<div class="card rise"><div class="card-title">' + ic('key') + '<span>공공데이터 서비스키</span></div>' +
      '<p class="small muted">' + (api && api.REQUIRED_SERVICE ? '<a href="' + esc(api.REQUIRED_SERVICE.url) + '" target="_blank" rel="noopener">' + esc(api.REQUIRED_SERVICE.name) + '</a> 활용신청 후 발급받은 일반 인증키(Decoding)를 입력하세요.' : 'API 모듈(assets/js/api.js)이 로드되지 않았습니다.') + ' 키는 이 브라우저에만 저장됩니다.</p>' +
      '<div class="mt"><label class="sr" for="apikey">서비스키</label><input id="apikey" class="input" type="password" autocomplete="off" value="' + esc(key) + '" placeholder="서비스키 입력"></div>' +
      '<div class="btn-row mt"><button class="btn btn-gold" type="button" data-action="keySave">' + ic('check') + '저장</button><button class="btn" type="button" data-action="keyShow">표시/숨김</button><button class="btn btn-ghost" type="button" data-action="keyDel">삭제</button></div></div>';
    h += '<div class="card rise" style="--i:1"><div class="card-title">' + ic('db') + '<span>데이터 현황</span></div><dl class="kv">' +
      '<div><dt>시설</dt><dd>' + A.facs.length + '개</dd></div><div><dt>사용자 수정·등록</dt><dd>' + (SJ.store.get(SJ.store.KEYS.fac, []) || []).length + '개</dd></div>' +
      '<div><dt>규칙</dt><dd>' + A.rules.length + '건</dd></div><div><dt>확인필요 규칙</dt><dd>' + ver + '건</dd></div>' +
      SJ.DOMAINS.map(function (d) { return '<div><dt>' + d + '</dt><dd>' + (dc[d] || 0) + '건</dd></div>'; }).join('') +
      '<div><dt>API 모듈</dt><dd>' + (api ? '로드됨' : '없음') + '</dd></div><div><dt>엔진</dt><dd>v' + SJ.version + '</dd></div></dl></div>';
    h += '<div class="card rise" style="--i:2"><div class="card-title">' + ic('download') + '<span>내보내기 · 가져오기</span></div><p class="small muted">완료 이력과 수정한 시설 속성은 이 브라우저(localStorage)에 저장됩니다. 정기적으로 백업하세요.</p>' +
      '<div class="btn-row mt"><button class="btn btn-gold" type="button" data-action="expJson">' + ic('download') + 'JSON 백업</button><button class="btn" type="button" data-action="expCsv">' + ic('download') + '업무목록 CSV</button>' +
      '<label class="btn">' + ic('upload') + 'JSON 가져오기<input type="file" accept=".json,application/json" data-input="import" class="sr"></label></div></div>';
    h += '<div class="card rise" style="--i:3"><div class="card-title">' + ic('reset') + '<span>초기화</span></div><p class="small muted">완료 이력 또는 사용자 수정 데이터를 삭제합니다. 되돌릴 수 없습니다.</p>' +
      '<div class="btn-row mt"><button class="btn" type="button" data-action="resetLog">완료 이력 삭제</button><button class="btn btn-danger" type="button" data-action="resetAll">전체 초기화</button></div></div></div>';
    return h;
  }
  function download(name, text, type) {
    var b = new Blob([text], { type: type }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function csvCell(v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }

  /* ---------- 이벤트 ---------- */
  var ACT = {
    cat: function (el) { state.cat = el.getAttribute('data-v'); rerender(); },
    detDom: function (el) { state.detDom = el.getAttribute('data-v'); rerender(); },
    lawDom: function (el) { state.lawDom = el.getAttribute('data-v'); rerender(); },
    jump: function (el) { var t = document.getElementById('rule-' + el.getAttribute('data-id')); if (!t) { state.detDom = '전체'; rerender(); t = document.getElementById('rule-' + el.getAttribute('data-id')); } if (t) { t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); t.animate && t.animate([{ boxShadow: '0 0 0 3px var(--gold)' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 1400 }); } },
    done: function (el) { state.donePop = el.getAttribute('data-id'); rerender(); var i = document.getElementById('dd-' + state.donePop); if (i) i.focus(); },
    doneCancel: function () { state.donePop = null; rerender(); },
    doneSave: function (el) {
      var id = el.getAttribute('data-id'), inp = document.getElementById('dd-' + id), v = inp && inp.value;
      if (!v) { toast('이행일을 선택하세요.'); return; }
      var rc = el.getBoundingClientRect(); burst(rc.left + rc.width / 2, rc.top + rc.height / 2);
      SJ.markDone(route().id, id, v); state.donePop = null; rerender(); toast('완료 처리되었습니다. 차기 기한이 재계산되었습니다.');
    },
    undo: function (el) { if (!confirm('가장 최근 이행 기록을 취소할까요?')) return; SJ.undoDone(route().id, el.getAttribute('data-id')); rerender(); toast('최근 기록을 취소했습니다.'); },
    print: function () { var f = SJ.getFacility(route().id); if (f) printPlan(f); },
    printCal: function () { var f = SJ.getFacility(state.calFac); if (f) printPlan(f); },
    calFor: function (el, ev) { ev.preventDefault(); state.calFac = el.getAttribute('data-id'); location.hash = '#/calendar?f=' + encodeURIComponent(state.calFac); },
    edit: function () { var f = SJ.getFacility(route().id); if (f) openEdit(f); },
    api: function () { var f = SJ.getFacility(route().id); if (f && window.SJ_API) runApi(f); },
    modalClose: closeModal,
    modalBack: function (el, ev) { if (ev.target === el) closeModal(); },
    editSave: function () {
      var f = state.edit.f;
      document.querySelectorAll('#modalRoot [data-f]').forEach(function (el) { readField(el, f); });
      if (!f.name) { toast('시설명을 입력하세요.'); return; }
      if (f.dataSource !== '건축물대장') f.dataSource = '사용자입력';
      SJ.saveFacility(f); closeModal(); rerender(); toast('저장되었습니다. 법정업무가 재판정되었습니다.');
    },
    editRevert: function () { if (!confirm('사용자 수정 내용을 지우고 원본 데이터로 되돌릴까요?')) return; SJ.revertFacility(state.edit.f.id); closeModal(); rerender(); toast('원본 데이터로 되돌렸습니다.'); },
    wizCat: function (el) { collectWiz(); state.wiz.f.category = el.getAttribute('data-v'); rerender(); },
    wizNext: function () { collectWiz(); if (state.wiz.step === 0 && !state.wiz.f.name) { toast('시설명을 입력하세요.'); return; } state.wiz.step++; rerender(); },
    wizPrev: function () { collectWiz(); state.wiz.step = Math.max(0, state.wiz.step - 1); rerender(); },
    wizReset: function () { state.wiz = null; rerender(); },
    wizSave: function () { var f = state.wiz.f; f.id = SJ.newId(); f.dataSource = '사용자입력'; SJ.saveFacility(f); state.wiz = null; toast('시설이 등록되었습니다.'); location.hash = '#/facility/' + f.id; },
    keySave: function () { SJ.store.setRaw(SJ.store.KEYS.key, (document.getElementById('apikey').value || '').trim()); toast('서비스키를 저장했습니다.'); },
    keyShow: function () { var i = document.getElementById('apikey'); i.type = i.type === 'password' ? 'text' : 'password'; },
    keyDel: function () { SJ.store.remove(SJ.store.KEYS.key); rerender(); toast('서비스키를 삭제했습니다.'); },
    expJson: function () {
      download('sjfms-backup-' + SJ.iso(SJ.today()) + '.json', JSON.stringify({ app: 'SJ-FMS', exported: new Date().toISOString(), facilities: SJ.store.get(SJ.store.KEYS.fac, []), log: SJ.getLog() }, null, 2), 'application/json');
    },
    expCsv: function () {
      var A = all(), rows = [['시설ID', '시설명', '분류', '분야', '업무ID', '업무', '등급', '주기', '차기기한', '상태', '최근이행', '수행자', '근거법령', '조문', '벌칙']];
      A.facs.forEach(function (f) { A.map[f.id].res.forEach(function (x) { rows.push([f.id, f.name, f.category, x.rule.domain, x.rule.id, x.rule.title, x.grade || '', x.rule.cycleText || '', x.next ? SJ.iso(x.next) : '', STATUS[x.status], x.lastDone || '', x.rule.performer || '', x.rule.law || '', x.rule.basis || '', x.rule.penalty || '']); }); });
      download('sjfms-tasks-' + SJ.iso(SJ.today()) + '.csv', '﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n'), 'text/csv;charset=utf-8');
    },
    resetLog: function () { if (confirm('완료 이력을 모두 삭제할까요?')) { SJ.store.remove(SJ.store.KEYS.log); rerender(); toast('완료 이력을 삭제했습니다.'); } },
    resetAll: function () { if (confirm('완료 이력·시설 수정본·서비스키를 모두 삭제할까요?')) { [SJ.store.KEYS.log, SJ.store.KEYS.fac, SJ.store.KEYS.key].forEach(SJ.store.remove); rerender(); toast('초기화했습니다.'); } }
  };
  function collectWiz() { if (!state.wiz) return; main.querySelectorAll('[data-f]').forEach(function (el) { readField(el, state.wiz.f); }); }

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-action]');
    if (!el) return;
    var fn = ACT[el.getAttribute('data-action')];
    if (fn) fn(el, ev);
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && state.edit) closeModal(); });

  var tmr;
  main.addEventListener('input', function (ev) {
    var el = ev.target, k = el.getAttribute('data-input');
    if (k === 'q') { state.q = el.value; clearTimeout(tmr); tmr = setTimeout(function () { var A = all(), q = state.q.trim().toLowerCase(); document.getElementById('facList').innerHTML = facListHtml(A.facs.filter(function (f) { return (state.cat === '전체' || f.category === state.cat) && (!q || (f.name + ' ' + f.address + ' ' + f.jibun + ' ' + f.subUse + ' ' + f.dept).toLowerCase().indexOf(q) >= 0); })); }, 120); }
    else if (k === 'lawQ') { state.lawQ = el.value; clearTimeout(tmr); tmr = setTimeout(function () { document.getElementById('lawList').innerHTML = lawList(); }, 150); }
    else if (k === 'finder') {
      var q = el.value.trim().toLowerCase(), box = document.getElementById('finderList'), A = all();
      if (!q) { box.classList.remove('open'); box.innerHTML = ''; return; }
      var hits = A.facs.filter(function (f) { return (f.name + ' ' + f.address + ' ' + f.subUse).toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
      box.innerHTML = hits.length ? hits.map(function (f) { return '<a role="option" href="#/facility/' + encodeURIComponent(f.id) + '">' + esc(f.name) + '<span>' + A.map[f.id].res.length + '건 · ' + esc(f.category) + '</span></a>'; }).join('') : '<p class="small muted" style="padding:10px">일치하는 시설이 없습니다.</p>';
      box.classList.add('open');
    }
  });
  main.addEventListener('change', function (ev) {
    var el = ev.target, k = el.getAttribute('data-input');
    if (k === 'calFac') { state.calFac = el.value; location.hash = el.value ? '#/calendar?f=' + encodeURIComponent(el.value) : '#/calendar'; }
    else if (k === 'import' && el.files && el.files[0]) {
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var d = JSON.parse(rd.result);
          if (Array.isArray(d.facilities)) SJ.store.set(SJ.store.KEYS.fac, d.facilities);
          if (d.log && typeof d.log === 'object') SJ.store.set(SJ.store.KEYS.log, d.log);
          rerender(); toast('가져오기 완료');
        } catch (e) { toast('JSON 형식이 올바르지 않습니다.'); }
      };
      rd.readAsText(el.files[0]);
    }
  });
  main.addEventListener('keydown', function (ev) {
    if (ev.target.id === 'finder' && ev.key === 'Enter') { var a = document.querySelector('#finderList a'); if (a) location.hash = a.getAttribute('href'); }
  });

  /* 3D tilt (경미) */
  if (!RM && window.matchMedia('(hover: hover)').matches) {
    main.addEventListener('pointermove', function (ev) {
      var c = ev.target.closest && ev.target.closest('.tilt'); if (!c) return;
      var b = c.getBoundingClientRect(), x = (ev.clientX - b.left) / b.width - .5, y = (ev.clientY - b.top) / b.height - .5;
      c.style.transform = 'perspective(1400px) rotateX(' + (-y * 1.6).toFixed(2) + 'deg) rotateY(' + (x * 2).toFixed(2) + 'deg) translateY(-2px)';
    });
    main.addEventListener('pointerout', function (ev) { var c = ev.target.closest && ev.target.closest('.tilt'); if (c && !c.contains(ev.relatedTarget)) c.style.transform = ''; });
  }

  /* 테마 */
  var tbtn = document.getElementById('themeToggle');
  function curTheme() { var t = document.documentElement.getAttribute('data-theme'); return t === 'dark' ? 'dark' : 'light'; }
  function paintTheme() { var t = curTheme(); tbtn.innerHTML = ic(t === 'dark' ? 'sun' : 'moon'); tbtn.setAttribute('aria-label', t === 'dark' ? '밝은 테마로 전환' : '어두운 테마로 전환'); }
  tbtn.addEventListener('click', function () { var t = curTheme() === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', t); SJ.store.setRaw(SJ.store.KEYS.theme, t); paintTheme(); });
  paintTheme();
  document.getElementById('brandMark').innerHTML = G.logo();

  window.addEventListener('hashchange', function () {
    var r = route(), key = location.hash || '#/';
    // 방향 판정: 직전 화면으로 돌아가면 뒤로(-1), 아니면 앞으로(+1)
    if (navStack.length > 1 && navStack[navStack.length - 2] === key) { navStack.pop(); navDir = -1; }
    else { navStack.push(key); navDir = 1; }
    if (r.name !== 'facility') { state.detDom = '전체'; }
    state.donePop = null; closeModal();
    render(); window.scrollTo({ top: 0, behavior: 'auto' }); main.focus({ preventScroll: true });
  });
  navStack.push(location.hash || '#/');
  render();
})();
