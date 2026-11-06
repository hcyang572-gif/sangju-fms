/* 상주시 캐릭터 도리·수니 — 입체(3D 클레이풍) SVG 가이드
 * 화면을 돌아다니며(걷기·카드 위로 점프·낙하), 마우스를 바라보고, 클릭/드래그/완료처리에 반응하고,
 * 현재 화면의 실제 데이터(기한·법적 유형 등)를 말풍선으로 알려준다.
 * 의존: window.SJ (engine.js). 독립 IIFE, 실패해도 앱에 영향 없음.
 */
(function () {
  'use strict';
  if (!window.SJ || !document.body) return;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 86, H = 104, HIDE_KEY = 'sjfms.mascot.hidden';

  /* ---------------- SVG 캐릭터 ---------------- */
  function figure(kind) {
    var p = 'm' + kind, dori = kind === 'dori';
    var defs = '<defs>' +
      '<radialGradient id="' + p + 'Hood" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="#ffd08a"/><stop offset=".28" stop-color="#ffa53d"/><stop offset=".68" stop-color="#f27a16"/><stop offset="1" stop-color="#c2540a"/></radialGradient>' +
      '<radialGradient id="' + p + 'Face" cx=".42" cy=".34" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#fbf6ef"/><stop offset="1" stop-color="#e9dfd2"/></radialGradient>' +
      '<radialGradient id="' + p + 'Body" cx=".38" cy=".25" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".65" stop-color="#f3eee8"/><stop offset="1" stop-color="#d9d1c6"/></radialGradient>' +
      '<radialGradient id="' + p + 'Cheek" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff8fa3" stop-opacity=".85"/><stop offset="1" stop-color="#ff8fa3" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + p + 'Leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9be15d"/><stop offset=".6" stop-color="#4fae2e"/><stop offset="1" stop-color="#2f7d1c"/></linearGradient>' +
      '<radialGradient id="' + p + 'Petal" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fbffb0"/><stop offset=".7" stop-color="#e3ee5a"/><stop offset="1" stop-color="#b9c92e"/></radialGradient>' +
      '<radialGradient id="' + p + 'Gam" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffc06a"/><stop offset=".6" stop-color="#f06a12"/><stop offset="1" stop-color="#b8480a"/></radialGradient>' +
      '<linearGradient id="' + p + 'Tray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a066"/><stop offset="1" stop-color="#8a5526"/></linearGradient>' +
      '<filter id="' + p + 'Soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4"/></filter>' +
      '</defs>';
    var eye = function (cx, cy, cls) {
      return '<g class="m-eye ' + cls + '"><ellipse cx="' + cx + '" cy="' + cy + '" rx="5.6" ry="7.6" fill="#1d1410"/>' +
        '<g class="m-pupil"><circle cx="' + (cx - 1.7) + '" cy="' + (cy - 2.8) + '" r="2" fill="#fff"/><circle cx="' + (cx + 1.8) + '" cy="' + (cy + 2.6) + '" r=".9" fill="#fff" opacity=".7"/></g></g>';
    };
    var top = dori
      ? '<path d="M60 16v-8" stroke="#3d7d22" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M60 12C52 2 40 3 34 9C42 15 53 16 60 12Z" fill="url(#' + p + 'Leaf)"/><path d="M60 12C68 2 80 3 86 9C78 15 67 16 60 12Z" fill="url(#' + p + 'Leaf)"/>' +
        '<path d="M37 9.5C45 11 53 12 59 11.6M83 9.5C75 11 67 12 61 11.6" stroke="#2f7d1c" stroke-width=".9" fill="none" opacity=".6"/>'
      : '<g transform="translate(60 9)">' + [0, 72, 144, 216, 288].map(function (a) {
          return '<ellipse rx="5.6" ry="8.4" cy="-7.2" transform="rotate(' + a + ')" fill="url(#' + p + 'Petal)" stroke="#a9b72a" stroke-width=".6"/>';
        }).join('') + '<circle r="4.2" fill="#c8d63a"/><circle r="1.8" cx="-1.2" cy="-1.2" fill="#f6ffb4"/></g>';
    var mouth = dori
      ? '<path d="M50 85q5 6 10 0q5 6 10 0" fill="none" stroke="#3a2110" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>'
      : '<path d="M53 82q7 11 14 0z" fill="#6b2323"/><ellipse cx="60.5" cy="87.4" rx="4" ry="2.4" fill="#ff8f9c"/>';
    var eyes = dori ? eye(46, 69, 'e-l') + eye(74, 69, 'e-r')
      : '<g class="m-eye e-l m-wink"><path d="M40 70q6.5-7 13 0" fill="none" stroke="#1d1410" stroke-width="2.6" stroke-linecap="round"/></g>' + eye(74, 68, 'e-r');
    var arms = dori
      ? '<ellipse cx="29" cy="117" rx="7.5" ry="6.5" fill="url(#' + p + 'Body)" stroke="#cfc5b8" stroke-width=".8"/><ellipse cx="91" cy="117" rx="7.5" ry="6.5" fill="url(#' + p + 'Body)" stroke="#cfc5b8" stroke-width=".8"/>' +
        '<ellipse cx="60" cy="118" rx="31" ry="8.6" fill="url(#' + p + 'Tray)"/><ellipse cx="60" cy="116.2" rx="27" ry="5.6" fill="#b07a44"/>' +
        [[46, 110], [60, 107], [74, 110], [53, 113.5], [67, 113.5]].map(function (c) {
          return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="7.4" fill="url(#' + p + 'Gam)"/><path d="M' + (c[0] - 3) + ' ' + (c[1] - 6.6) + 'q3 2 6 0" stroke="#3d7d22" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
            '<ellipse cx="' + (c[0] - 2.6) + '" cy="' + (c[1] - 2.6) + '" rx="2.2" ry="1.4" fill="#fff" opacity=".55"/>';
        }).join('')
      : '<ellipse cx="31" cy="116" rx="7" ry="9" fill="url(#' + p + 'Body)" stroke="#cfc5b8" stroke-width=".8" transform="rotate(18 31 116)"/>' +
        '<g class="m-wave"><ellipse cx="95" cy="96" rx="7" ry="10" fill="url(#' + p + 'Body)" stroke="#cfc5b8" stroke-width=".8" transform="rotate(-35 95 96)"/></g>';
    return '<svg class="m-svg" viewBox="0 -4 120 160" aria-hidden="true" focusable="false">' + defs +
      '<g class="m-feet"><ellipse class="m-foot fl" cx="48" cy="148" rx="10" ry="5.2" fill="url(#' + p + 'Body)" stroke="#cfc5b8" stroke-width=".8"/>' +
      '<ellipse class="m-foot fr" cx="72" cy="148" rx="10" ry="5.2" fill="url(#' + p + 'Body)" stroke="#cfc5b8" stroke-width=".8"/></g>' +
      '<path d="M35 100Q29 140 46 146H74Q91 140 85 100Z" fill="url(#' + p + 'Body)" stroke="#cfc5b8" stroke-width=".9"/>' +
      '<ellipse cx="60" cy="101" rx="24" ry="5" fill="#000" opacity=".07"/>' +
      '<g class="m-head">' + top +
      '<circle cx="60" cy="58" r="47" fill="url(#' + p + 'Hood)" stroke="#a6470b" stroke-width="1.4"/>' +
      '<path d="M30 30q12-14 30-16" fill="none" stroke="#ffe2b0" stroke-width="5" stroke-linecap="round" opacity=".55" filter="url(#' + p + 'Soft)"/>' +
      '<ellipse cx="60" cy="72" rx="36.5" ry="33" fill="url(#' + p + 'Face)"/>' +
      '<path d="M26 74q34 34 68 0" fill="none" stroke="#d8cbbb" stroke-width="2" opacity=".5"/>' +
      '<g class="m-eyes">' + eyes + '</g>' +
      '<ellipse cx="37" cy="83" rx="8" ry="5.6" fill="url(#' + p + 'Cheek)"/><ellipse cx="83" cy="83" rx="8" ry="5.6" fill="url(#' + p + 'Cheek)"/>' +
      '<g class="m-mouth">' + mouth + '</g></g>' + arms + '</svg>';
  }

  /* ---------------- 데이터 기반 안내 문구 ---------------- */
  function route() { var h = (location.hash || '#/').replace(/^#\/?/, '').split('?')[0].split('/'); return { name: h[0] || '', id: h[1] ? decodeURIComponent(h[1]) : '' }; }
  var cache = null;
  function data() {
    if (cache) return cache;
    var fs = SJ.facilities(), t = SJ.today ? SJ.today() : new Date(), month = 0, soon = 0, over = 0, urgent = null, total = 0;
    fs.forEach(function (f) {
      SJ.evaluate(f).forEach(function (r) {
        total++;
        if (r.status === 'overdue') over++; else if (r.status === 'soon') soon++;
        if (r.next && r.next.getMonth() === t.getMonth() && r.next.getFullYear() === t.getFullYear()) month++;
        if (r.days != null && r.days >= 0 && (!urgent || r.days < urgent.r.days || (r.days === urgent.r.days && /시청/.test(f.name)))) urgent = { f: f, r: r };
      });
    });
    cache = { fs: fs, month: month, soon: soon, over: over, urgent: urgent, total: total, m: t.getMonth() + 1 };
    setTimeout(function () { cache = null; }, 30000);
    return cache;
  }
  function tips() {
    var r = route(), D = data(), out = [];
    if (r.name === 'facility') {
      var f = SJ.getFacility ? SJ.getFacility(r.id) : D.fs.filter(function (x) { return x.id === r.id; })[0];
      if (f) {
        var res = SJ.evaluate(f), types = SJ.legalTypes ? SJ.legalTypes(res) : [], sm = SJ.summarize ? SJ.summarize(res) : {};
        var nx = res.filter(function (x) { return x.days != null && x.days >= 0; }).sort(function (a, b) { return a.days - b.days; })[0];
        out.push({ t: '<b>' + esc(f.name) + '</b>에는 법정업무가 <b>' + res.length + '건</b> 있어요.' });
        if (types[0]) out.push({ t: '이 건물은 <b>' + esc(types[0].label) + '</b>(으)로 판정됐어요.' + (types[1] ? ' ' + esc(types[1].label) + '도 해당돼요.' : '') });
        if (nx) out.push({ t: '가장 가까운 기한은 <b>' + esc(nx.rule.title) + '</b> — <b>D-' + nx.days + '</b>이에요!' });
        if (sm.soon) out.push({ t: '30일 안에 챙길 업무가 <b>' + sm.soon + '건</b>이에요. 위쪽 “지금 챙길 업무”를 보세요.' });
        out.push({ t: f.dataSource === '건축물대장' ? '면적·층수는 <b>국토교통부 건축물대장</b> 공공데이터 값이에요.' : '이 시설은 아직 <b>추정값</b>이에요. [건축물대장 불러오기]로 확정해 주세요.' });
        out.push({ t: '업무 카드에서 <b>완료 처리</b>를 누르면 다음 기한을 자동으로 다시 계산해요.' });
      }
    } else if (r.name === 'facilities') {
      out.push({ t: '상주시 소유 건축물 <b>' + D.fs.length + '곳</b>이에요. 카드를 누르면 해야 할 업무가 나와요.' });
      out.push({ t: '<b>상주시청 본청</b>이 맨 앞에 있어요. 분류 필터로 시설을 좁혀 보세요.' });
    } else if (r.name === 'calendar') {
      out.push({ t: '<b>연간달력</b>에서 달마다 해야 할 점검·검사를 한눈에 볼 수 있어요.' });
      out.push({ t: D.m + '월에는 기한이 도래하는 업무가 <b>' + D.month + '건</b> 있어요.' });
    } else if (r.name === 'laws') {
      out.push({ t: '9개 분야 <b>' + SJ.rules().length + '개</b> 법정업무 규칙을 찾아볼 수 있어요. 근거 조문 링크도 있어요.' });
    } else if (r.name === 'wizard') {
      out.push({ t: '용도·연면적·층수·설비를 고르면 <b>어떤 법이 적용되는지</b> 바로 알려드려요.' });
    } else if (r.name === 'settings') {
      out.push({ t: '공공데이터 <b>서비스키</b>를 넣으면 건축물대장을 실시간으로 조회해요.' });
    } else {
      out.push({ t: D.m + '월 기한이 도래하는 법정업무가 <b>' + D.month + '건</b> 있어요!', href: '#/calendar', go: '달력 보기' });
      if (D.urgent) out.push({ t: '가장 급한 업무: <b>' + esc(D.urgent.f.name) + '</b> · ' + esc(D.urgent.r.rule.title) + ' <b>D-' + D.urgent.r.days + '</b>', href: '#/facility/' + encodeURIComponent(D.urgent.f.id), go: '바로 가기' });
      if (D.over) out.push({ t: '기한이 지난 업무가 <b>' + D.over + '건</b> 있어요. 먼저 처리해 주세요!' });
      out.push({ t: '위 검색창에 담당 시설 이름을 넣으면 <b>해야 할 일</b>을 알려드려요.' });
      out.push({ t: '건물 정보는 <b>국토교통부 건축HUB 건축물대장</b> 공공데이터로 확인해요.' });
      out.push({ t: '저를 <b>끌어서</b> 옮길 수도 있어요. 놓으면 떨어져요!' });
    }
    return out;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------------- 캐릭터 객체 ---------------- */
  var root = document.createElement('div'); root.className = 'mascots'; root.setAttribute('aria-live', 'polite');
  document.body.appendChild(root);
  var dock = document.createElement('button'); dock.type = 'button'; dock.className = 'm-dock'; dock.innerHTML = '<span>도리·수니 부르기</span>';
  document.body.appendChild(dock);

  function Mascot(kind, name, x) {
    var el = document.createElement('div'); el.className = 'mascot m-' + kind;
    el.innerHTML = '<div class="m-shadow"></div><div class="m-fig" role="button" tabindex="0" aria-label="' + name + ' — 클릭하면 안내해요">' + figure(kind) + '</div>' +
      '<div class="m-bubble" role="status"><div class="m-name">' + name + '</div><div class="m-text"></div><div class="m-act"></div></div>';
    root.appendChild(el);
    this.el = el; this.kind = kind; this.name = name; this.fig = el.querySelector('.m-fig'); this.bub = el.querySelector('.m-bubble');
    this.x = x; this.y = ground(); this.vy = 0; this.mode = 'idle'; this.face = 1; this.tx = x; this.ty = this.y; this.nextAt = now() + 2500 + Math.random() * 3000;
    this.tipI = 0; this.perch = null; this.hop = null;
    var self = this;
    this.fig.addEventListener('pointerenter', function () { if (self.mode !== 'drag') { self.react('wave'); } });
    this.fig.addEventListener('pointerdown', function (e) { self.dragStart(e); });
    this.fig.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.say(); } });
    this.bub.addEventListener('pointerenter', function () { self.hold = true; });
    this.bub.addEventListener('pointerleave', function () { self.hold = false; self.autoHide(2500); });
    this.place();
  }
  function now() { return performance.now(); }
  function ground() { return window.innerHeight - H - 14; }
  function clampX(x) { return Math.max(10, Math.min(window.innerWidth - W - 10, x)); }
  Mascot.prototype.place = function () {
    this.el.style.transform = 'translate3d(' + this.x.toFixed(1) + 'px,' + this.y.toFixed(1) + 'px,0)';
    this.fig.style.setProperty('--face', this.face);
    var air = Math.max(0, ground() - this.y);
    this.el.style.setProperty('--air', this.perch ? 0 : Math.min(1, air / 300).toFixed(2));
    // 말풍선이 화면 밖으로 나가지 않게
    this.bub.classList.toggle('left', this.x > window.innerWidth - 300);
    this.bub.classList.toggle('below', this.y < 170);
  };
  Mascot.prototype.setMode = function (m) {
    this.mode = m; this.el.classList.toggle('walking', m === 'walk'); this.el.classList.toggle('air', m === 'hop' || m === 'fall' || m === 'drag');
  };
  Mascot.prototype.react = function (k) {
    var el = this.el; el.classList.remove('r-wave', 'r-jump', 'r-surprise', 'r-land'); void el.offsetWidth; el.classList.add('r-' + k);
    clearTimeout(this.rt); this.rt = setTimeout(function () { el.classList.remove('r-' + k); }, 1300);
  };
  Mascot.prototype.say = function (msg) {
    var list = tips(); if (!msg) { if (!list.length) return; msg = list[this.tipI % list.length]; this.tipI++; }
    if (typeof msg === 'string') msg = { t: msg };
    this.bub.querySelector('.m-text').innerHTML = msg.t;
    var act = '<button type="button" data-m="next">다음 팁</button>' + (msg.href ? '<a href="' + msg.href + '">' + (msg.go || '보기') + '</a>' : '') + '<button type="button" data-m="hide" aria-label="숨기기">숨기기</button>';
    this.bub.querySelector('.m-act').innerHTML = act;
    this.el.classList.add('talking'); this.react('wave');
    if (this.mode === 'walk') { this.setMode('idle'); }
    this.nextAt = now() + 7000;
    others(this).forEach(function (o) { o.hush(); });
    this.autoHide(msg.href ? 9000 : 6500);
  };
  Mascot.prototype.autoHide = function (ms) { var self = this; clearTimeout(this.ht); this.ht = setTimeout(function () { if (!self.hold) self.hush(); }, ms); };
  Mascot.prototype.hush = function () { this.el.classList.remove('talking'); };
  Mascot.prototype.dragStart = function (e) {
    var self = this, sx = e.clientX, sy = e.clientY, ox = this.x, oy = this.y, moved = false, lx = sx, ly = sy, lt = now(), vx = 0, vy = 0;
    e.preventDefault(); this.fig.setPointerCapture && this.fig.setPointerCapture(e.pointerId);
    function mv(ev) {
      var dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 6) { moved = true; self.perch = null; self.setMode('drag'); self.hush(); self.react('surprise'); }
      if (moved) {
        var t = now(), dt = Math.max(16, t - lt); vx = (ev.clientX - lx) / dt * 1000; vy = (ev.clientY - ly) / dt * 1000; lx = ev.clientX; ly = ev.clientY; lt = t;
        self.x = clampX(ox + dx); self.y = Math.min(ground(), Math.max(70, oy + dy)); self.face = vx < 0 ? -1 : 1; self.place();
      }
    }
    function up() {
      self.fig.removeEventListener('pointermove', mv); self.fig.removeEventListener('pointerup', up); self.fig.removeEventListener('pointercancel', up);
      if (!moved) { self.say(); return; }
      self.vx = Math.max(-900, Math.min(900, vx)); self.vy = Math.max(-700, Math.min(400, vy)); self.setMode('fall'); self.landMsg = true;
    }
    this.fig.addEventListener('pointermove', mv); this.fig.addEventListener('pointerup', up); this.fig.addEventListener('pointercancel', up);
  };
  Mascot.prototype.pickTarget = function () {
    var r = Math.random(), self = this;
    if (r < .32 && !RM) {
      // 카드 위로 폴짝 (화면에 보이는 카드 중 하나)
      var cands = Array.prototype.filter.call(document.querySelectorAll('.kpi, .lx-step, .main .card, .fac'), function (c) {
        var b = c.getBoundingClientRect(); return b.top > 150 && b.top < window.innerHeight - H - 60 && b.width > 180;
      });
      var c = cands[Math.floor(Math.random() * cands.length)];
      if (c) {
        var b = c.getBoundingClientRect(), tx = clampX(b.left + 20 + Math.random() * Math.max(10, b.width - W - 40)), ty = b.top - H + 10;
        if (others(this).every(function (o) { return Math.abs(o.x - tx) > 110 || Math.abs(o.y - ty) > 60; })) {
          this.hop = { x0: this.x, y0: this.y, x1: tx, y1: ty, t0: now(), dur: 750 + Math.abs(tx - this.x) * .6, el: c, top: b.top };
          this.face = tx < this.x ? -1 : 1; this.perch = null; this.setMode('hop'); return;
        }
      }
    }
    if (this.perch) { this.perch = null; this.vy = -180; this.vx = 0; this.setMode('fall'); return; }
    var tx2 = clampX(40 + Math.random() * (window.innerWidth - W - 160));
    if (others(this).some(function (o) { return Math.abs(o.x - tx2) < 120; })) tx2 = clampX(window.innerWidth - tx2 - W);
    this.tx = tx2; this.face = tx2 < this.x ? -1 : 1; this.setMode('walk');
  };
  Mascot.prototype.step = function (dt, t) {
    var g = ground();
    if (this.mode === 'walk') {
      var d = this.tx - this.x, sp = 70 * dt;
      if (Math.abs(d) <= sp) { this.x = this.tx; this.setMode('idle'); this.nextAt = t + 2500 + Math.random() * 5000; }
      else this.x += Math.sign(d) * sp;
      this.y = g;
    } else if (this.mode === 'hop') {
      var h = this.hop, k = Math.min(1, (t - h.t0) / h.dur), e = k;
      var peak = Math.min(h.y0, h.y1) - 70;
      this.x = h.x0 + (h.x1 - h.x0) * e;
      this.y = (1 - k) * (1 - k) * h.y0 + 2 * (1 - k) * k * peak + k * k * h.y1;
      if (k >= 1) { this.perch = { el: h.el, dx: h.x1 - h.el.getBoundingClientRect().left, top: h.top }; this.setMode('idle'); this.react('land'); this.nextAt = t + 4000 + Math.random() * 5000; }
    } else if (this.mode === 'fall') {
      this.vy += 1500 * dt; this.y += this.vy * dt; this.x = clampX(this.x + (this.vx || 0) * dt); this.vx = (this.vx || 0) * .985;
      if (this.y >= g) {
        this.y = g;
        if (this.vy > 260) { this.vy = -this.vy * .32; this.react('land'); }
        else { this.vy = 0; this.vx = 0; this.setMode('idle'); this.nextAt = t + 2200 + Math.random() * 3000;
          if (this.landMsg) { this.landMsg = false; this.say('휴, 깜짝이야! 😳 ' + (tips()[0] ? tips()[0].t : '')); } }
      }
    } else if (this.mode === 'idle') {
      if (this.perch) {
        var b = this.perch.el.isConnected ? this.perch.el.getBoundingClientRect() : null;
        if (!b || b.top < 90 || b.top > window.innerHeight - 40) { this.perch = null; this.vy = 0; this.vx = 0; this.setMode('fall'); }
        else { this.x = clampX(b.left + this.perch.dx); this.y = b.top - H + 10; }
      } else this.y = g;
      if (t > this.nextAt && !this.el.classList.contains('talking') && !RM) this.pickTarget();
    }
    this.place();
  };
  Mascot.prototype.look = function (mx, my) {
    var r = this.fig.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .42;
    var dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
    var ex = dx / d * 2.6 * k * this.face, ey = dy / d * 2.2 * k;
    this.fig.style.setProperty('--ex', ex.toFixed(2) + 'px'); this.fig.style.setProperty('--ey', ey.toFixed(2) + 'px');
    this.fig.style.setProperty('--tilt', (dx / d * 4 * k * this.face).toFixed(2) + 'deg');
  };

  var M = [], hidden = false;
  try { hidden = localStorage.getItem(HIDE_KEY) === '1'; } catch (e) {}
  function others(m) { return M.filter(function (o) { return o !== m; }); }
  M.push(new Mascot('suni', '수니', Math.max(20, window.innerWidth * .62)));
  M.push(new Mascot('dori', '도리', Math.max(20, window.innerWidth * .78)));
  function setHidden(h) {
    hidden = h; root.classList.toggle('off', h); dock.classList.toggle('show', h);
    try { localStorage.setItem(HIDE_KEY, h ? '1' : '0'); } catch (e) {}
  }
  setHidden(hidden);
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-m]'); if (!b) return;
    var m = M.filter(function (x) { return x.el.contains(b); })[0];
    if (b.getAttribute('data-m') === 'next' && m) m.say();
    if (b.getAttribute('data-m') === 'hide') setHidden(true);
  });
  dock.addEventListener('click', function () { setHidden(false); M[0].say('다시 왔어요! 궁금하면 저를 눌러 주세요.'); });

  /* ---------------- 루프 · 이벤트 ---------------- */
  var last = now();
  function loop(t) {
    var dt = Math.min(.05, (t - last) / 1000); last = t;
    if (!hidden) M.forEach(function (m) { m.step(dt, t); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.addEventListener('pointermove', function (e) { if (!hidden) M.forEach(function (m) { m.look(e.clientX, e.clientY); }); }, { passive: true });
  window.addEventListener('resize', function () { M.forEach(function (m) { m.x = clampX(m.x); if (!m.perch && m.mode !== 'hop') m.y = ground(); m.place(); }); });
  var scT;
  window.addEventListener('scroll', function () {
    M.forEach(function (m) { m.fig.style.setProperty('--ey', '2.2px'); });
    clearTimeout(scT); scT = setTimeout(function () { M.forEach(function (m) { m.fig.style.setProperty('--ey', '0px'); }); }, 500);
  }, { passive: true });
  window.addEventListener('hashchange', function () {
    cache = null; if (hidden) return;
    M.forEach(function (m) { if (m.perch) { m.perch = null; m.vy = 0; m.setMode('fall'); } m.tipI = 0; });
    var sp = M[Math.random() < .5 ? 0 : 1]; setTimeout(function () { sp.say(); }, 900);
  });
  window.addEventListener('sj:done', function () {
    cache = null; if (hidden) return;
    M.forEach(function (m, i) { setTimeout(function () { m.react('jump'); }, i * 160); });
    M[0].say('완료 처리했어요! 🎉 다음 기한을 자동으로 다시 계산했어요.');
  });
  var idleT; function bumpIdle() { clearTimeout(idleT); idleT = setTimeout(function () { if (!hidden) M[Math.random() < .5 ? 0 : 1].say(); bumpIdle(); }, 26000); }
  ['pointerdown', 'keydown', 'scroll'].forEach(function (ev) { window.addEventListener(ev, bumpIdle, { passive: true }); });
  bumpIdle();

  // 첫 인사
  if (!hidden) {
    setTimeout(function () { M[0].say('안녕하세요! 상주시 <b>수니</b>예요. 담당 건물의 <b>법정 유지관리 업무</b>를 알려드릴게요.'); }, 1400);
    setTimeout(function () { M[1].say(); }, 8600);
  }
  window.SJ_MASCOT = { say: function (s) { M[0].say(s); }, hide: function () { setHidden(true); }, show: function () { setHidden(false); } };
})();
