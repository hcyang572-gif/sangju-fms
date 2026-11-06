/* SJ-FMS 규칙 엔진 — window.SJ (docs/SCHEMA.md 3절) */
(function (global) {
  'use strict';

  var DOMAINS = ['소방', '승강기', '전기', '가스·에너지', '기계설비·통신', '건축·구조안전', '재난·중대재해', '보건·환경', '특수시설'];
  var CATEGORIES = ['본청·청사', '읍면동 행정복지센터', '박물관·전시관', '기념관·유적', '문화·공연시설', '체육시설', '복지·보건시설', '도서관·교육', '관광·휴양시설', '환경·기반시설', '기타'];
  var KINDS = { inspection: '점검·검사', appointment: '선임·지정', education: '교육·훈련', report: '신고·보고', insurance: '보험', measure: '측정', plan: '계획·기록', maintenance: '청소·정비' };
  var PRIORITY = { critical: '중대', high: '과태료', normal: '일반' };
  var KEYS = { fac: 'sjfms.facilities', log: 'sjfms.log', key: 'sjfms.apikey', theme: 'sjfms.theme' };

  var DEFAULTS = {
    id: '', name: '', category: '기타', address: '', jibun: '', dept: '', buildingUse: '기타', subUse: '',
    approvalDate: null, area: null, floorsAbove: null, floorsBelow: null, height: null, structure: '',
    sprinkler: false, simpleSprinkler: false, indoorHydrant: false, autoDetection: false, waterSpray: false, smokeControl: false,
    elevators: 0, escalators: 0, elevatorYear: null, receivingKW: null, voltage: null, generatorKW: null, solarKW: null, fuelL: null,
    gasType: '없음', lpgKg: null, boilers: 0, boilerKind: '없음', chillerRT: null, waterTankM3: null, sewage: '공공하수도', sewageCapacity: null,
    playground: false, seats: null, sportsFacility: false, heritage: '', asbestos: false, multiUseBiz: false, childcare: false, elderly: false,
    workers: null, evCharger: false, summary: '', safetyGrade: '', lastRepair: '', dataSource: '추정', note: ''
  };

  /* ---------- 저장소 ---------- */
  var store = {
    get: function (k, def) { try { var v = global.localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set: function (k, v) { try { global.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    getRaw: function (k) { try { return global.localStorage.getItem(k) || ''; } catch (e) { return ''; } },
    setRaw: function (k, v) { try { global.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    remove: function (k) { try { global.localStorage.removeItem(k); return true; } catch (e) { return false; } },
    KEYS: KEYS
  };

  /* ---------- 날짜 ---------- */
  var _now = null;
  function today() { var d = _now ? new Date(_now) : new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function parseISO(s) {
    if (!s) return null;
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s));
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  function iso(d) { if (!d) return ''; var m = d.getMonth() + 1, x = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (x < 10 ? '0' : '') + x; }
  function eom(idx) { var y = Math.floor(idx / 12), m = idx - y * 12; return new Date(y, m + 1, 0); } // idx = y*12+m0
  function addMonths(d, n) {
    var t = new Date(d.getFullYear(), d.getMonth() + n, 1);
    var dim = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    t.setDate(Math.min(d.getDate(), dim));
    return t;
  }
  function daysBetween(a, b) { return Math.round((b - a) / 864e5); }
  function num(v) { var n = Number(v); return isFinite(n) && n > 0 ? n : 0; }

  /* ---------- 데이터 ---------- */
  function normalize(f) {
    var o = {};
    for (var k in DEFAULTS) o[k] = DEFAULTS[k];
    if (f) for (var j in f) if (f[j] !== undefined) o[j] = f[j];
    o.elevators = Number(o.elevators) || 0; o.escalators = Number(o.escalators) || 0; o.boilers = Number(o.boilers) || 0;
    return o;
  }
  function rules() {
    var arr = Array.isArray(global.SJ_RULES) ? global.SJ_RULES : [];
    var seen = {}, out = [];
    arr.forEach(function (r) { if (r && r.id && !seen[r.id]) { seen[r.id] = 1; out.push(r); } });
    return out;
  }
  function baseFacilities() { return Array.isArray(global.SJ_FACILITIES) ? global.SJ_FACILITIES.filter(function (f) { return f && f.id; }) : []; }
  function userFacilities() { var u = store.get(KEYS.fac, []); return Array.isArray(u) ? u.filter(function (f) { return f && f.id; }) : []; }
  function facilities() {
    var map = {}, order = [];
    baseFacilities().forEach(function (f) { if (!map[f.id]) order.push(f.id); map[f.id] = f; });
    userFacilities().forEach(function (f) { if (!map[f.id]) order.push(f.id); map[f.id] = f; });
    return order.map(function (id) { return normalize(map[id]); });
  }
  function getFacility(id) { var a = facilities(); for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function isBase(id) { return baseFacilities().some(function (f) { return f.id === id; }); }
  function isModified(id) { return userFacilities().some(function (f) { return f.id === id; }); }
  function saveFacility(f) {
    var u = userFacilities().filter(function (x) { return x.id !== f.id; });
    u.push(normalize(f)); return store.set(KEYS.fac, u);
  }
  function revertFacility(id) { return store.set(KEYS.fac, userFacilities().filter(function (x) { return x.id !== id; })); }
  function newId() {
    var max = 0;
    facilities().forEach(function (f) { var m = /^U(\d+)$/.exec(f.id); if (m) max = Math.max(max, +m[1]); });
    var n = String(max + 1); while (n.length < 3) n = '0' + n; return 'U' + n;
  }

  /* ---------- 이력 ---------- */
  function getLog() { var l = store.get(KEYS.log, {}); return l && typeof l === 'object' ? l : {}; }
  function history(fid, rid) { var l = getLog(); var a = (l[fid] && l[fid][rid]) || []; return a.filter(Boolean).slice().sort(); }
  function markDone(fid, rid, isoDate) {
    var l = getLog(); l[fid] = l[fid] || {}; l[fid][rid] = l[fid][rid] || [];
    l[fid][rid].push(isoDate || iso(today())); return store.set(KEYS.log, l);
  }
  function undoDone(fid, rid) {
    var l = getLog(); if (!l[fid] || !l[fid][rid]) return false;
    var a = l[fid][rid].slice().sort(); a.pop(); l[fid][rid] = a; return store.set(KEYS.log, l);
  }

  /* ---------- 기한 계산 ---------- */
  function nextDue(rule, f, lastDoneISO) {
    if (!rule) return null;
    var cyc = num(rule.cycleMonths), anchor = rule.anchor || 'free';
    var last = parseISO(lastDoneISO);
    if (last && cyc) return addMonths(last, cyc);
    if (anchor === 'event' || !cyc) return null;
    var t = today(), tIdx = t.getFullYear() * 12 + t.getMonth();
    if (anchor === 'approval') {
      var ap = parseISO(f && f.approvalDate);
      if (ap) {
        var base = ap.getFullYear() * 12 + ap.getMonth();
        var k = Math.max(1, Math.ceil((tIdx - base) / cyc));
        var idx = base + k * cyc, d = eom(idx);
        if (d < t) d = eom(idx + cyc);
        return d;
      }
      anchor = 'free';
    }
    if (anchor === 'fixed') {
      var ms = (rule.dueMonths || []).map(Number).filter(function (m) { return m >= 1 && m <= 12; }).sort(function (a, b) { return a - b; });
      if (ms.length) {
        for (var y = t.getFullYear(); y <= t.getFullYear() + 1; y++)
          for (var i = 0; i < ms.length; i++) { var dd = eom(y * 12 + ms[i] - 1); if (dd >= t) return dd; }
      }
      anchor = 'free';
    }
    // free
    if (cyc < 12) {
      for (var j = 0; j < 24; j++) { var mi = tIdx + j, m1 = (mi % 12) + 1; if (m1 % cyc === 0) { var de = eom(mi); if (de >= t) return de; } }
    }
    return new Date(t.getFullYear(), 11, 31);
  }

  /** 해당 연도에 기한이 도래하는 월(1~12) 목록 */
  function occurrences(rule, f, year, lastDoneISO) {
    var cyc = num(rule.cycleMonths), anchor = rule.anchor || 'free', out = [];
    var last = parseISO(lastDoneISO);
    function series(baseIdx) {
      for (var m = 0; m < 12; m++) { var idx = year * 12 + m; if (idx > baseIdx && (idx - baseIdx) % cyc === 0) out.push(m + 1); }
    }
    if (!cyc) return out;
    if (last) { series(last.getFullYear() * 12 + last.getMonth()); return out; }
    if (anchor === 'event') return out;
    if (anchor === 'approval') {
      var ap = parseISO(f && f.approvalDate);
      if (ap) { series(ap.getFullYear() * 12 + ap.getMonth()); return out; }
      anchor = 'free';
    }
    if (anchor === 'fixed') {
      var ms = (rule.dueMonths || []).map(Number).filter(function (m) { return m >= 1 && m <= 12; });
      if (ms.length) return ms.sort(function (a, b) { return a - b; });
    }
    if (cyc < 12) { for (var m2 = 1; m2 <= 12; m2++) if (m2 % cyc === 0) out.push(m2); return out; }
    return [12];
  }

  function applies(rule, f) {
    if (!rule || typeof rule.applies !== 'function') return false;
    try { return !!rule.applies(f); } catch (e) { return false; }
  }
  function gradeOf(rule, f) {
    if (!rule || typeof rule.grade !== 'function') return null;
    try { var g = rule.grade(f); return g ? String(g) : null; } catch (e) { return null; }
  }
  var ORDER = { overdue: 0, soon: 1, ok: 2, event: 3 };
  function evaluate(f) {
    if (!f) return [];
    var nf = normalize(f), lg = getLog(), fl = lg[nf.id] || {}, t = today(), out = [];
    rules().forEach(function (r) {
      if (!applies(r, nf)) return;
      var hist = (fl[r.id] || []).filter(Boolean).slice().sort();
      var lastDone = hist.length ? hist[hist.length - 1] : null;
      var next = null;
      try { next = nextDue(r, nf, lastDone); } catch (e) { next = null; }
      var status = 'event', days = null;
      if (next) { days = daysBetween(t, next); status = days < 0 ? 'overdue' : days <= 30 ? 'soon' : 'ok'; }
      out.push({ rule: r, grade: gradeOf(r, nf), next: next, status: status, lastDone: lastDone, days: days, history: hist });
    });
    out.sort(function (a, b) {
      var d = ORDER[a.status] - ORDER[b.status]; if (d) return d;
      if (a.next && b.next) return a.next - b.next;
      return DOMAINS.indexOf(a.rule.domain) - DOMAINS.indexOf(b.rule.domain);
    });
    return out;
  }

  /* ---------- 요약 지표 ---------- */
  function age(f) {
    var ap = parseISO(f && f.approvalDate);
    if (!ap) return { years: null, stage: '미상', level: 'unknown' };
    var y = (today() - ap) / (365.25 * 864e5);
    var years = Math.max(0, Math.floor(y));
    if (years >= 30) return { years: years, stage: '노후', level: 'old' };
    if (years >= 15) return { years: years, stage: '주의', level: 'warn' };
    return { years: years, stage: '양호', level: 'good' };
  }
  function summarize(results) {
    var s = { total: results.length, overdue: 0, soon: 0, ok: 0, event: 0, periodic: 0, done: 0, rate: 0, critical: 0 };
    results.forEach(function (r) {
      s[r.status]++;
      if (r.rule.priority === 'critical') s.critical++;
      if (r.status !== 'event') { s.periodic++; if (r.lastDone && r.status !== 'overdue') s.done++; }
    });
    s.rate = s.periodic ? Math.round(s.done / s.periodic * 100) : 0;
    return s;
  }
  function legalTypes(results) {
    var seen = {}, out = [];
    results.forEach(function (r) {
      // 등급·종별 분류 라벨만 배지로 (주기·횟수 설명성 문구는 제외 — 업무 카드에서 표시)
      var g = r.grade && String(r.grade);
      if (g && /^별표2/.test(g)) g = '중대시민재해 공중이용시설 · ' + g.replace(/^별표2\s*제\d+호\s*/, '');
      if (g && /^별표3/.test(g)) g = '중대시민재해 공중이용시설 · ' + g.replace(/^별표3\s*/, '');
      if (g && (g.length > 40 || /\d+\s*회|마다|개월|주기|반기|분기|월\s*\d|이내/.test(g) || !/(급|종|대상|시설|후보|등급|해당|관리자|기관)/.test(g))) g = null;
      if (g && !seen[g]) { seen[g] = 1; out.push({ label: g, domain: r.rule.domain, priority: r.rule.priority }); }
      if (false) { seen[r.grade] = 1; out.push({ label: r.grade, domain: r.rule.domain, priority: r.rule.priority }); }
    });
    out.sort(function (a, b) { return DOMAINS.indexOf(a.domain) - DOMAINS.indexOf(b.domain); });
    return out;
  }

  global.SJ = {
    version: '1.0.0', DOMAINS: DOMAINS, CATEGORIES: CATEGORIES, KINDS: KINDS, PRIORITY: PRIORITY, DEFAULTS: DEFAULTS,
    store: store, evaluate: evaluate, nextDue: nextDue, occurrences: occurrences, applies: applies, gradeOf: gradeOf,
    rules: rules, facilities: facilities, baseFacilities: baseFacilities, getFacility: getFacility, normalize: normalize,
    saveFacility: saveFacility, revertFacility: revertFacility, isBase: isBase, isModified: isModified, newId: newId,
    getLog: getLog, history: history, markDone: markDone, undoDone: undoDone,
    age: age, summarize: summarize, legalTypes: legalTypes,
    today: today, parseISO: parseISO, iso: iso, addMonths: addMonths,
    _setNow: function (d) { _now = d; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
