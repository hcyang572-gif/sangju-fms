/* SJ-FMS 앰비언트 뮤직 플레이어 — Web Audio API 실시간 생성 (음원 파일·저작권 없음)
 * 패드 화음(디튠 오실레이터+로우패스) · 벨 아르페지오(+딜레이) · 강물 노이즈 · 합성 리버브
 */
(function () {
  'use strict';
  var KEY = 'sjfms.music';
  var TRACKS = [
    { name: '낙동강의 아침', mood: 'Morning on the Nakdong', root: 57, // A3
      chords: [[0, 7, 11, 14, 16], [-3, 4, 7, 11, 14], [-7, 0, 4, 9, 12], [-5, 2, 7, 11, 14]], scale: [0, 2, 4, 7, 9, 12, 14, 16, 19],
      bar: 9, bell: .3, river: .045, cutoff: 1050, wave: 'triangle' },
    { name: '경천섬 노을', mood: 'Gyeongcheon Island Sunset', root: 53, // F3
      chords: [[0, 4, 7, 11, 14], [2, 5, 9, 12, 16], [-3, 4, 7, 12, 14], [-5, 2, 5, 9, 12]], scale: [0, 2, 4, 7, 9, 11, 12, 14, 16, 19],
      bar: 10.5, bell: .24, river: .06, cutoff: 900, wave: 'triangle' },
    { name: '상주 밤하늘', mood: 'Night Sky over Sangju', root: 50, // D3
      chords: [[0, 7, 10, 14, 17], [-4, 3, 7, 10, 14], [-2, 5, 9, 12, 16], [-7, 0, 7, 10, 15]], scale: [0, 3, 5, 7, 10, 12, 15, 17, 19, 22],
      bar: 12, bell: .2, river: .03, cutoff: 760, wave: 'sine' }
  ];
  var st = { on: false, ti: 0, vol: .38 };
  try { var sv = JSON.parse(localStorage.getItem(KEY) || '{}'); if (typeof sv.ti === 'number') st.ti = sv.ti % TRACKS.length; if (typeof sv.vol === 'number') st.vol = sv.vol; st.want = !!sv.on; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ on: st.on, ti: st.ti, vol: st.vol })); } catch (e) {} }

  var ctx, master, comp, verb, verbIn, delay, dfb, an, timers = [], voices = [], riverNode, riverGain;
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function impulse(sec, decay) {
    var len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    an = ctx.createAnalyser(); an.fftSize = 128; an.smoothingTimeConstant = .85;
    verb = ctx.createConvolver(); verb.buffer = impulse(5.5, 2.6);
    verbIn = ctx.createGain(); verbIn.gain.value = .9;
    var verbOut = ctx.createGain(); verbOut.gain.value = .55;
    delay = ctx.createDelay(2); delay.delayTime.value = .74; dfb = ctx.createGain(); dfb.gain.value = .26;
    var dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 1800;
    delay.connect(dlp); dlp.connect(dfb); dfb.connect(delay); dlp.connect(verbIn);
    verbIn.connect(verb); verb.connect(verbOut); verbOut.connect(comp);
    // 귀를 찌르는 고역 차단 + 저역 정리
    var tame = ctx.createBiquadFilter(); tame.type = 'lowpass'; tame.frequency.value = 4200; tame.Q.value = .5;
    var shelf = ctx.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 2500; shelf.gain.value = -6;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 45;
    comp.connect(hp); hp.connect(shelf); shelf.connect(tame); tame.connect(master); master.connect(an); an.connect(ctx.destination);
  }
  function out(node, dry, wet) {
    var g1 = ctx.createGain(); g1.gain.value = dry; node.connect(g1); g1.connect(comp);
    var g2 = ctx.createGain(); g2.gain.value = wet; node.connect(g2); g2.connect(verbIn);
  }
  /* 패드: 음마다 디튠 오실레이터 2개 + 느린 스웰 */
  function pad(T, chord, t0, dur) {
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = .6;
    lp.frequency.setValueAtTime(T.cutoff * .5, t0); lp.frequency.linearRampToValueAtTime(T.cutoff, t0 + dur * .5); lp.frequency.linearRampToValueAtTime(T.cutoff * .6, t0 + dur);
    var g = ctx.createGain(); g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(.075, t0 + dur * .4); g.gain.linearRampToValueAtTime(.06, t0 + dur * .8); g.gain.linearRampToValueAtTime(0, t0 + dur + 2.5);
    lp.connect(g); out(g, .55, .8);
    chord.forEach(function (n, i) {
      [-7, 7].forEach(function (cents) {
        var o = ctx.createOscillator(); o.type = i === 0 ? 'sine' : T.wave;
        o.frequency.value = mtof(T.root + n - (i === 0 ? 12 : 0)); o.detune.value = cents + (Math.random() * 4 - 2);
        var og = ctx.createGain(); og.gain.value = i === 0 ? .9 : .35 / chord.length * 3;
        o.connect(og); og.connect(lp); o.start(t0); o.stop(t0 + dur + 3);
        voices.push(o);
      });
    });
  }
  /* 벨: 사인 + 배음, 긴 감쇠, 딜레이로 반짝임 */
  function bell(T, midi, t, vel) {
    var f = mtof(midi), g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.03 * vel, t + .04); g.gain.exponentialRampToValueAtTime(.0003, t + 4.5);
    [[1, 1], [2, .1], [3, .025]].forEach(function (h) {
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * h[0];
      var hg = ctx.createGain(); hg.gain.value = h[1]; o.connect(hg); hg.connect(g); o.start(t); o.stop(t + 4.6); voices.push(o);
    });
    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = Math.random() * 1.4 - .7; g.connect(pan); out(pan, .35, .9); pan.connect(delay); }
    else { out(g, .35, .9); g.connect(delay); }
  }
  /* 강물: 핑크 노이즈 → 밴드패스, 느린 LFO로 물결 */
  function river(T) {
    var len = ctx.sampleRate * 4, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0), b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; b0 = .997 * b0 + w * .029; b1 = .985 * b1 + w * .032; b2 = .95 * b2 + w * .048; d[i] = (b0 + b1 + b2) * .35; }
    riverNode = ctx.createBufferSource(); riverNode.buffer = b; riverNode.loop = true;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = .5;
    var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .07; lg.gain.value = 380; lfo.connect(lg); lg.connect(bp.frequency); lfo.start();
    riverGain = ctx.createGain(); riverGain.gain.value = 0; riverGain.gain.linearRampToValueAtTime(T.river, ctx.currentTime + 6);
    riverNode.connect(bp); bp.connect(riverGain); out(riverGain, .6, .5); riverNode.start(); voices.push(riverNode, lfo);
  }
  var nextBar = 0, barI = 0;
  function schedule() {
    var T = TRACKS[st.ti], ahead = ctx.currentTime + 1.5;
    while (nextBar < ahead) {
      var ch = T.chords[barI % T.chords.length];
      pad(T, ch, nextBar, T.bar);
      var n = 3 + Math.floor(Math.random() * 4);
      for (var k = 0; k < n; k++) {
        if (Math.random() > T.bell + .35) continue;
        var tt = nextBar + (k + Math.random() * .6) * (T.bar / n);
        var deg = T.scale[Math.floor(Math.random() * T.scale.length)];
        bell(T, T.root + 12 + deg, tt, .5 + Math.random() * .5);
      }
      nextBar += T.bar; barI++;
    }
  }
  function startEngine() {
    if (!ctx) build();
    if (ctx.state === 'suspended') ctx.resume();
    stopVoices();
    var T = TRACKS[st.ti]; nextBar = ctx.currentTime + .2; barI = 0;
    river(T); schedule(); timers.push(setInterval(schedule, 500));
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(st.vol, ctx.currentTime + 4);
  }
  function stopVoices() {
    timers.forEach(clearInterval); timers = [];
    var t = ctx ? ctx.currentTime : 0;
    voices.forEach(function (v) { try { v.stop(t + .05); } catch (e) {} }); voices = [];
  }
  function play() { st.on = true; startEngine(); ui(); save(); }
  function pause() {
    st.on = false; ui(); save(); if (!ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    setTimeout(function () { if (!st.on) { stopVoices(); ctx.suspend(); } }, 1700);
  }
  function setTrack(i) {
    st.ti = (i + TRACKS.length) % TRACKS.length; save(); ui();
    if (!st.on) return;
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    setTimeout(function () { if (st.on) startEngine(); }, 1300);
  }

  /* ---------------- 플레이어 UI ---------------- */
  var el = document.createElement('div'); el.className = 'amb'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', '배경 음악 플레이어');
  el.innerHTML =
    '<button type="button" class="amb-play" aria-label="음악 재생"><svg viewBox="0 0 24 24" class="i-play"><path d="M8 5.5v13l10.5-6.5z"/></svg><svg viewBox="0 0 24 24" class="i-pause"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/></svg></button>' +
    '<div class="amb-info"><canvas class="amb-viz" width="120" height="28" aria-hidden="true"></canvas><div class="amb-txt"><b class="amb-name"></b><small class="amb-mood"></small></div></div>' +
    '<div class="amb-ctl"><button type="button" class="amb-prev" aria-label="이전 곡"><svg viewBox="0 0 24 24"><path d="M7 6h2v12H7zM19 6v12l-9-6z"/></svg></button>' +
    '<button type="button" class="amb-next" aria-label="다음 곡"><svg viewBox="0 0 24 24"><path d="M15 6h2v12h-2zM5 6v12l9-6z"/></svg></button>' +
    '<label class="amb-vol"><span class="sr">볼륨</span><input type="range" min="0" max="1" step="0.01" aria-label="볼륨"></label>' +
    '<button type="button" class="amb-min" aria-label="플레이어 접기"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>' +
    '<div class="amb-hint">♪ 클릭하면 상주 풍경 앰비언트 음악이 흘러나와요</div>';
  document.body.appendChild(el);
  var $ = function (s) { return el.querySelector(s); };
  var vol = $('.amb-vol input'); vol.value = st.vol;
  function ui() {
    var T = TRACKS[st.ti];
    el.classList.toggle('on', st.on);
    $('.amb-play').setAttribute('aria-label', st.on ? '음악 일시정지' : '음악 재생');
    $('.amb-name').textContent = T.name; $('.amb-mood').textContent = T.mood;
  }
  ui();
  $('.amb-play').addEventListener('click', function () { st.on ? pause() : play(); el.classList.add('touched'); });
  $('.amb-prev').addEventListener('click', function () { setTrack(st.ti - 1); });
  $('.amb-next').addEventListener('click', function () { setTrack(st.ti + 1); });
  $('.amb-min').addEventListener('click', function () { el.classList.toggle('mini'); });
  vol.addEventListener('input', function () {
    st.vol = +vol.value; save();
    if (ctx && st.on) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(st.vol, ctx.currentTime, .15); }
  });
  // 이전에 켜 두었다면 첫 상호작용 때 자동 재개 (브라우저 자동재생 정책)
  if (st.want) {
    el.classList.add('touched');
    var resume = function () { if (!st.on) play(); ['pointerdown', 'keydown'].forEach(function (e) { window.removeEventListener(e, resume, true); }); };
    ['pointerdown', 'keydown'].forEach(function (e) { window.addEventListener(e, resume, true); });
  }
  setTimeout(function () { el.classList.add('touched'); }, 12000);

  /* 시각화: 금빛 막대 */
  var cv = $('.amb-viz'), cx2 = cv.getContext('2d'), buf = new Uint8Array(64);
  (function draw() {
    requestAnimationFrame(draw);
    var w = cv.width, h = cv.height; cx2.clearRect(0, 0, w, h);
    var bars = 20, bw = w / bars;
    if (an && st.on) an.getByteFrequencyData(buf);
    for (var i = 0; i < bars; i++) {
      var v = st.on && an ? buf[Math.min(63, 1 + Math.floor(i * 1.6))] / 255 : .08 + .04 * Math.sin(Date.now() / 900 + i);
      var bh = Math.max(2, v * h * .95);
      var g = cx2.createLinearGradient(0, h, 0, h - bh); g.addColorStop(0, '#9c8051'); g.addColorStop(1, '#e8d3a2');
      cx2.fillStyle = g; cx2.beginPath();
      if (cx2.roundRect) cx2.roundRect(i * bw + 1.2, h - bh, bw - 2.4, bh, 1.5); else cx2.rect(i * bw + 1.2, h - bh, bw - 2.4, bh);
      cx2.fill();
    }
  })();
  document.addEventListener('visibilitychange', function () { if (!ctx || !st.on) return; if (document.hidden) master.gain.setTargetAtTime(st.vol * .25, ctx.currentTime, .5); else master.gain.setTargetAtTime(st.vol, ctx.currentTime, .5); });
})();
