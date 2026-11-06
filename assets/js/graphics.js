/* SJ-FMS 자체 제작 SVG 그래픽 모음 — window.SJG
 * 외부 이미지 없이 인라인 SVG 문자열을 반환한다. 색상은 CSS 클래스(app.css)로 제어.
 */
(function (global) {
  'use strict';

  /* ---------- 공통 유틸 ---------- */
  function svg(vb, body, cls, label) {
    var aria = label ? ' role="img" aria-label="' + label + '"' : ' aria-hidden="true" focusable="false"';
    return '<svg class="' + (cls || '') + '" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg"' + aria + '>' + body + '</svg>';
  }
  function grid(x, y, cols, rows, w, h, gx, gy, seed) {
    var out = '', s = seed || 7;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        s = (s * 9301 + 49297) % 233280;
        var lit = (s / 233280) > 0.62;
        out += '<rect class="' + (lit ? 'wl' : 'w') + '" x="' + (x + c * (w + gx)) + '" y="' + (y + r * (h + gy)) + '" width="' + w + '" height="' + h + '" rx="0.8"/>';
      }
    }
    return out;
  }
  var GROUND = '<path class="hill" d="M0 118C34 92 62 96 92 104C126 86 168 74 240 106V118H0Z"/>' +
    '<path class="g" d="M6 118H234"/>' +
    '<path class="wv" d="M24 128q8-3.5 16 0t16 0t16 0t16 0M120 133q8-3.5 16 0t16 0t16 0t16 0t16 0"/>';

  /* ---------- 카테고리별 건물 일러스트 (240×140) ---------- */
  var B = {};
  B['본청·청사'] = function () {
    return GROUND +
      '<path class="s" d="M120 6V24"/><path class="a" d="M120 7h14l-3 4 3 4h-14z"/>' +
      '<rect class="f2" x="104" y="24" width="32" height="18" rx="1"/><rect class="s" x="104" y="24" width="32" height="18" rx="1"/>' +
      '<rect class="f" x="44" y="42" width="152" height="76" rx="1.5"/><rect class="s" x="44" y="42" width="152" height="76" rx="1.5"/>' +
      '<path class="s" d="M40 42H200M40 46H200"/>' +
      grid(52, 52, 5, 4, 8, 9, 4.5, 5, 3) + grid(141, 52, 5, 4, 8, 9, 4.5, 5, 11) +
      '<path class="f2" d="M108 118V78L120 70L132 78V118Z"/><path class="s" d="M106 80H134M110 80V118M116 80V118M124 80V118M130 80V118"/>' +
      grid(110, 29, 3, 1, 5, 7, 4.5, 0, 5);
  };
  B['읍면동 행정복지센터'] = function () {
    return GROUND +
      '<path class="f2" d="M52 62L120 40L188 62Z"/><path class="s" d="M48 63L120 39L192 63"/>' +
      '<rect class="f" x="58" y="62" width="124" height="56" rx="1"/><rect class="s" x="58" y="62" width="124" height="56" rx="1"/>' +
      grid(66, 70, 4, 2, 10, 10, 6, 8, 17) + grid(140, 70, 2, 2, 10, 10, 6, 8, 23) +
      '<rect class="f2" x="110" y="90" width="24" height="28"/><path class="s" d="M110 90h24v28M122 90v28"/>' +
      '<rect class="a" x="104" y="80" width="36" height="6" rx="1" opacity=".85"/>';
  };
  B['박물관·전시관'] = function () {
    var cols = '';
    for (var i = 0; i < 7; i++) {
      var x = 68 + i * 17.3;
      cols += '<rect class="f" x="' + (x - 3) + '" y="60" width="6" height="48"/><path class="s" d="M' + (x - 3) + ' 60V108M' + (x + 3) + ' 60V108M' + (x - 5) + ' 60h10M' + (x - 5) + ' 108h10"/>';
    }
    return GROUND +
      '<path class="f2" d="M56 52L120 24L184 52Z"/><path class="s" d="M54 52L120 23L186 52Z"/><circle class="a" cx="120" cy="40" r="4"/>' +
      '<rect class="f2" x="56" y="52" width="128" height="8"/><path class="s" d="M56 52h128v8H56z"/>' + cols +
      '<path class="s" d="M52 108H188V112H48V115H192V118"/>';
  };
  B['기념관·유적'] = function () {
    var lat = '';
    for (var i = 0; i < 4; i++) {
      var x = 76 + i * 24;
      lat += '<rect class="w" x="' + x + '" y="80" width="18" height="20"/><path class="s" d="M' + (x + 6) + ' 80v20M' + (x + 12) + ' 80v20M' + x + ' 86.5h18M' + x + ' 93.5h18"/>';
    }
    return GROUND +
      '<path class="f2" d="M26 76C58 72 70 66 78 52L162 52C170 66 182 72 214 76C192 69 178 61 170 44L70 44C62 61 48 69 26 76Z"/>' +
      '<path class="s" d="M26 76C58 72 70 66 78 52L162 52C170 66 182 72 214 76M70 44L170 44M82 44Q120 37 158 44M78 52Q62 66 26 76"/>' +
      '<path class="s" d="M88 48h64" opacity=".5"/>' +
      '<rect class="f" x="66" y="74" width="108" height="30"/><path class="s" d="M66 74V104M174 74V104M66 74H174"/>' + lat +
      '<path class="f2" d="M50 104H190V112H50Z"/><path class="s" d="M50 104H190V112H50ZM44 112H196V118"/>' +
      '<path class="s" d="M112 112v6M128 112v6"/>';
  };
  B['문화·공연시설'] = function () {
    var m = '';
    for (var i = 0; i < 9; i++) m += '<path class="s" d="M' + (64 + i * 14) + ' 84V118" opacity=".55"/>';
    return GROUND +
      '<path class="f" d="M36 118V72Q120 14 204 72V118Z"/><path class="s" d="M36 118V72Q120 14 204 72V118"/>' +
      '<path class="s" d="M48 74Q120 30 192 74" opacity=".6"/><path class="s" d="M60 78Q120 46 180 78" opacity=".35"/>' +
      '<rect class="w" x="58" y="84" width="124" height="34"/>' + m +
      '<path class="f2" d="M82 84H158L150 76H90Z"/><path class="s" d="M80 84H160L152 76H88Z"/>' +
      '<path class="a" d="M112 60l8-8 8 8-8 8z"/>';
  };
  B['체육시설'] = function () {
    var ribs = '';
    for (var i = 1; i < 6; i++) { var x = 30 + i * 30; ribs += '<path class="s" d="M' + x + ' ' + (78 - Math.sin(i / 6 * Math.PI) * 52) + 'V118" opacity=".35"/>'; }
    return GROUND +
      '<path class="f" d="M26 118V80Q120 6 214 80V118Z"/><path class="s" d="M26 118V80Q120 6 214 80V118"/>' +
      '<path class="s" d="M26 80Q120 22 214 80" opacity=".5"/>' + ribs +
      '<path class="w" d="M86 118V92Q120 78 154 92V118Z"/><path class="s" d="M86 118V92Q120 78 154 92V118M120 85V118"/>' +
      '<ellipse class="s" cx="120" cy="52" rx="14" ry="5" opacity=".7"/><circle class="a" cx="120" cy="52" r="2.2"/>';
  };
  B['복지·보건시설'] = function () {
    return GROUND +
      '<rect class="f" x="54" y="46" width="132" height="72" rx="8"/><rect class="s" x="54" y="46" width="132" height="72" rx="8"/>' +
      '<circle class="f2" cx="120" cy="40" r="15"/><circle class="s" cx="120" cy="40" r="15"/>' +
      '<path class="a" d="M116 31h8v5h5v8h-5v5h-8v-5h-5v-8h5z"/>' +
      grid(64, 62, 3, 2, 12, 11, 7, 8, 31) + grid(140, 62, 2, 2, 12, 11, 7, 8, 41) +
      '<rect class="f2" x="110" y="94" width="20" height="24" rx="1"/><path class="s" d="M110 118V94h20v24"/>' +
      '<path class="s" d="M186 112L214 118M186 104h8"/>';
  };
  B['도서관·교육'] = function () {
    var w = '';
    for (var i = 0; i < 8; i++) w += '<rect class="' + (i % 3 === 1 ? 'wl' : 'w') + '" x="' + (60 + i * 15.5) + '" y="62" width="8" height="42" rx="4"/>';
    return GROUND +
      '<rect class="f" x="50" y="50" width="140" height="68" rx="1.5"/><rect class="s" x="50" y="50" width="140" height="68" rx="1.5"/>' +
      '<path class="s" d="M46 50H194"/>' + w +
      '<path class="f2" d="M120 44C110 36 98 34 88 36V48C98 46 110 48 120 54C130 48 142 46 152 48V36C142 34 130 36 120 44Z"/>' +
      '<path class="s" d="M120 44C110 36 98 34 88 36V48C98 46 110 48 120 54C130 48 142 46 152 48V36C142 34 130 36 120 44V54"/>' +
      '<path class="s" d="M104 108h32v10"/>';
  };
  B['관광·휴양시설'] = function () {
    return GROUND +
      '<path class="f2" d="M56 66C74 64 80 60 86 50H154C160 60 166 64 184 66C168 60 160 54 156 44H84C80 54 72 60 56 66Z"/>' +
      '<path class="s" d="M56 66C74 64 80 60 86 50H154C160 60 166 64 184 66M84 44H156M92 44Q120 38 148 44"/>' +
      '<path class="s" d="M92 62V104M112 60V104M128 60V104M148 62V104"/>' +
      '<path class="s" d="M88 84H152" opacity=".5"/>' +
      '<path class="f" d="M80 104H160V110H80Z"/><path class="s" d="M80 104H160V110H80ZM88 110V118M152 110V118"/>' +
      '<circle class="f" cx="200" cy="80" r="16"/><circle class="s" cx="200" cy="80" r="16"/><path class="s" d="M200 96V118M200 104l-6-6"/>' +
      '<circle class="a" cx="194" cy="74" r="2.4"/><circle class="a" cx="206" cy="82" r="2.4"/><circle class="a" cx="198" cy="88" r="2"/>';
  };
  B['환경·기반시설'] = function () {
    return GROUND +
      '<rect class="f" x="120" y="64" width="80" height="54" rx="1"/><rect class="s" x="120" y="64" width="80" height="54" rx="1"/>' +
      '<path class="s" d="M178 64V22h10v42"/><path class="a" d="M180 22h6v4h-6z"/>' +
      '<path class="s" d="M190 16q-4-3 0-6M194 12q-4-3 0-6" opacity=".5"/>' + grid(128, 72, 3, 2, 10, 9, 6, 7, 51) +
      '<path class="f2" d="M44 70v40a26 8 0 0 0 52 0V70Z"/><ellipse class="f" cx="70" cy="70" rx="26" ry="8"/>' +
      '<path class="s" d="M44 70v40a26 8 0 0 0 52 0V70"/><ellipse class="s" cx="70" cy="70" rx="26" ry="8"/>' +
      '<path class="s" d="M44 86a26 8 0 0 0 52 0M44 100a26 8 0 0 0 52 0" opacity=".45"/>' +
      '<path class="s" d="M96 96H120M96 104H120"/><circle class="a" cx="108" cy="100" r="3"/>';
  };
  B['기타'] = function () {
    return GROUND +
      '<path class="f2" d="M70 66L120 36L170 66Z"/><path class="s" d="M64 68L120 34L176 68"/>' +
      '<rect class="f" x="76" y="66" width="88" height="52"/><rect class="s" x="76" y="66" width="88" height="52"/>' +
      grid(86, 76, 2, 1, 14, 12, 40, 0, 61) + '<rect class="f2" x="110" y="90" width="20" height="28"/><path class="s" d="M110 118V90h20v28"/>';
  };

  function building(category, label) {
    var fn = B[category] || B['기타'];
    return svg('0 0 240 140', fn(), 'ill', label);
  }

  /* ---------- 분야·UI 아이콘 (24×24, stroke) ---------- */
  function gearPath() {
    var d = '', n = 8;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      d += 'M' + (12 + c * 6.2).toFixed(2) + ' ' + (12 + s * 6.2).toFixed(2) + 'L' + (12 + c * 8.6).toFixed(2) + ' ' + (12 + s * 8.6).toFixed(2);
    }
    return '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.4"/><path d="' + d + '"/>';
  }
  var I = {
    '소방': '<path d="M12 2.8s5.6 4.6 5.6 10a5.6 5.6 0 0 1-11.2 0c0-2.8 1.6-4.6 2.8-5.6.3 2.1 1.3 3.2 2.6 3.5C11.4 7.8 12 5.2 12 2.8z"/><path d="M9.6 16.4a2.4 2.4 0 0 0 4.8 0c0-1.4-1.2-2.4-2.4-3.6-1.2 1.2-2.4 2.2-2.4 3.6z"/>',
    '승강기': '<rect x="4.5" y="2.5" width="15" height="19" rx="2"/><path d="M12 2.5v19M7 11l1.8-2.4L10.6 11M13.4 13l1.8 2.4L17 13"/>',
    '전기': '<path d="M13.2 2L5 13.4h6.2L10.4 22l8.4-11.6h-6.2L13.2 2z"/>',
    '가스·에너지': '<path d="M4.6 17.6a8.4 8.4 0 1 1 14.8 0"/><path d="M12 13.4l4.2-4.2"/><circle cx="12" cy="13.4" r="1.4"/><path d="M8 21h8"/>',
    '기계설비·통신': gearPath(),
    '건축·구조안전': '<path d="M3.5 21V9.5L12 4l8.5 5.5V21"/><path d="M3.5 21h17M8 21v-5h3v5M14 12h3v3h-3z"/><path d="M8 9.5h8" opacity=".6"/>',
    '재난·중대재해': '<path d="M12 2.8l8 3v6.1c0 5-3.4 8.2-8 9.3-4.6-1.1-8-4.3-8-9.3V5.8l8-3z"/><path d="M12 8v5"/><circle cx="12" cy="16.2" r=".6" fill="currentColor"/>',
    '보건·환경': '<path d="M5 19.5C5 10.4 10.6 5 20 4.6c-.2 9.6-5.4 15-14.4 15"/><path d="M5 19.5l8.2-8.2"/>',
    '특수시설': '<path d="M3 21L6.8 4h10.4L21 21"/><path d="M10 4v9M14 4v9M8.8 13h6.4"/>',
    dashboard: '<rect x="3" y="3" width="7.5" height="9" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.6"/><rect x="3" y="15" width="7.5" height="6" rx="1.6"/>',
    building: '<path d="M4 21V5.5L12 3v18M12 8.5l8 2.5v10M2.5 21h19"/><path d="M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M7.5 13.5h2M11 13.5h2M14.5 13.5h2M7.5 17h2M11 17h2"/>',
    book: '<path d="M12 6.5C10 5 7 4.4 3.5 4.6v14c3.5-.2 6.5.4 8.5 1.9 2-1.5 5-2.1 8.5-1.9v-14C17 4.4 14 5 12 6.5z"/><path d="M12 6.5v14"/>',
    wand: '<path d="M4 20L15 9M13.5 7.5l3 3"/><path d="M18 2.5v3M16.5 4h3M20.5 9.5v2.6M19.2 10.8h2.6M9 3v2.4M7.8 4.2h2.4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.9 1.9M17.5 17.5l1.9 1.9M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.9-1.9M17.5 6.5l1.9-1.9"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/>',
    moon: '<path d="M20 14.6A8.4 8.4 0 0 1 9.4 4a8.4 8.4 0 1 0 10.6 10.6z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21"/>',
    check: '<path d="M4.5 12.5l4.8 4.8L19.5 7"/>',
    print: '<path d="M6.5 9V3h11v6"/><rect x="3" y="9" width="18" height="8.5" rx="2"/><path d="M6.5 14.5h11V21h-11z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    download: '<path d="M12 3v12M7 10.5l5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 16V4M7 8.5l5-5 5 5M4 20h16"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>',
    alert: '<path d="M12 3.5L2.5 20h19L12 3.5z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>',
    clock: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7v5.2l3.4 2"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    db: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14.5 8.5l2 2"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    list: '<path d="M8.5 6H20M8.5 12H20M8.5 18H20"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6.2 8-6.2s7.2 2.2 8 6.2"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1.2"/><path d="M5 9v11h14V9M10 13h4"/>',
    gavel: '<path d="M13.5 3.5l7 7M10 7l7 7M11.8 5.2l7 7-3.6 3.6-7-7z"/><path d="M9.6 12.4L3 19l2 2 6.6-6.6M2.5 21.5h9"/>',
    target: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'
  };
  function icon(name, cls) {
    var body = I[name] || I.sparkle;
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* ---------- 브랜드 마크 (상주 — 산·강·비단) ---------- */
  function logo() {
    return '<svg class="logo" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="lgGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e7bd"/><stop offset=".45" stop-color="#d4af6a"/><stop offset=".7" stop-color="#9c7a3e"/><stop offset="1" stop-color="#e9cf93"/></linearGradient></defs>' +
      '<circle cx="24" cy="24" r="22" fill="none" stroke="url(#lgGold)" stroke-width="1.6"/>' +
      '<circle cx="24" cy="24" r="18.4" fill="none" stroke="url(#lgGold)" stroke-width=".6" opacity=".7"/>' +
      '<path d="M9 28l7-8 5 5 6-9 12 12" fill="none" stroke="url(#lgGold)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="M9.5 32.5q3.6-2.4 7.2 0t7.2 0 7.2 0 7.2 0" fill="none" stroke="url(#lgGold)" stroke-width="1.4" stroke-linecap="round"/>' +
      '<circle cx="33" cy="14.5" r="2.4" fill="url(#lgGold)"/></svg>';
  }

  /* ---------- 히어로: 상주의 밤 — 경천대 능선·낙동강·경천섬·낙강교·학전망대·상주보·자전거 ---------- */
  function hero() {
    function waves(y, amp, cls, dur) {
      var d = 'M-1200 ' + y;
      for (var x = -1200; x < 2400; x += 60) d += ' q15 ' + (-amp) + ' 30 0 t30 0';
      return '<path class="' + cls + '" style="--dur:' + dur + 's" d="' + d + '"/>';
    }
    var stars = '';
    var sx = [612, 668, 735, 790, 905, 960, 1012, 1085, 1130, 1166, 700, 1048, 860, 640, 1110];
    var sy = [42, 88, 30, 70, 26, 64, 38, 22, 80, 46, 120, 108, 48, 140, 132];
    sx.forEach(function (x, i) { stars += '<circle class="lx-star" style="--d:' + (i * .37 % 4).toFixed(2) + 's" cx="' + x + '" cy="' + sy[i] + '" r="' + (i % 3 ? 1 : 1.6) + '"/>'; });
    // 낙강교 현수교 케이블
    var cab = '', hang = '';
    cab += '<path class="lx-cable" d="M560 262 Q640 300 720 228 Q800 300 880 228 Q960 300 1040 262"/>';
    for (var hx = 580; hx <= 1020; hx += 16) {
      var t, top;
      if (hx < 720) { t = (hx - 560) / 160; top = (1 - t) * (1 - t) * 262 + 2 * (1 - t) * t * 300 + t * t * 228; }
      else if (hx < 880) { t = (hx - 720) / 160; top = (1 - t) * (1 - t) * 228 + 2 * (1 - t) * t * 300 + t * t * 228; }
      else { t = (hx - 880) / 160; top = (1 - t) * (1 - t) * 228 + 2 * (1 - t) * t * 300 + t * t * 262; }
      if (top < 268) hang += 'M' + hx + ' ' + top.toFixed(1) + 'V270';
    }
    return '<svg class="hero-art lx" viewBox="0 0 1200 400" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<radialGradient id="lxMoon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3d2" stop-opacity=".95"/><stop offset=".35" stop-color="#e8c98a" stop-opacity=".35"/><stop offset="1" stop-color="#e8c98a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="lxGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbedc6"/><stop offset=".45" stop-color="#d2ad69"/><stop offset=".7" stop-color="#9c7a3e"/><stop offset="1" stop-color="#ecd296"/></linearGradient>' +
      '<linearGradient id="lxM1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--lx-m1a)"/><stop offset="1" stop-color="var(--lx-m1b)"/></linearGradient>' +
      '<linearGradient id="lxM2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--lx-m2a)"/><stop offset="1" stop-color="var(--lx-m2b)"/></linearGradient>' +
      '<linearGradient id="lxRiver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--lx-r1)"/><stop offset="1" stop-color="var(--lx-r2)"/></linearGradient>' +
      '<linearGradient id="lxFade" x1="0" y1="0" x2="1" y2="0"><stop offset=".34" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".92"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
      '<mask id="lxMask"><rect width="1200" height="400" fill="url(#lxFade)"/></mask>' +
      '<linearGradient id="lxShine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f3dfaa" stop-opacity="0"/><stop offset=".5" stop-color="#f3dfaa" stop-opacity=".55"/><stop offset="1" stop-color="#f3dfaa" stop-opacity="0"/></linearGradient>' +
      '</defs>' +
      '<g mask="url(#lxMask)">' + stars +
      '<circle cx="1010" cy="96" r="130" fill="url(#lxMoon)" class="h-moon"/><circle cx="1010" cy="96" r="30" fill="#f8e7bb" opacity=".9"/>' +
      // 먼 능선 / 경천대 절벽
      '<path fill="url(#lxM2)" d="M380 250C450 210 520 196 590 206S700 150 770 160 860 120 930 140 1040 110 1100 150 1170 170 1200 160V400H380Z"/>' +
      '<path class="lx-ridge" d="M380 250C450 210 520 196 590 206S700 150 770 160 860 120 930 140 1040 110 1100 150 1170 170 1200 160"/>' +
      '<path fill="url(#lxM1)" d="M380 280C470 250 540 240 620 252S760 226 820 236 980 214 1060 196 1160 214 1200 206V400H380Z"/>' +
      '<path class="lx-ridge lx-r2" d="M380 280C470 250 540 240 620 252S760 226 820 236 980 214 1060 196 1160 214 1200 206"/>' +
      // 학전망대 (절벽 위 탑)
      '<g class="lx-tower"><path d="M1090 198V146M1102 198V146M1084 146h24l-12-16z"/><path d="M1086 166h20M1086 182h20"/><circle cx="1096" cy="122" r="2.2"/></g>' +
      // 강
      '<rect x="380" y="282" width="820" height="118" fill="url(#lxRiver)"/>' +
      '<rect class="lx-moonpath" x="960" y="290" width="100" height="110" fill="url(#lxShine)" opacity=".5"/>' +
      // 경천섬
      '<path class="lx-isle" d="M610 300C650 286 760 284 830 292S860 306 820 310 650 314 610 300Z"/>' +
      '<path class="lx-ridge lx-r3" d="M640 292v-10M660 290v-14M700 288v-12M740 288v-16M780 290v-10M810 292v-8"/>' +
      // 낙강교 현수교
      '<g class="lx-bridge"><path class="lx-deck" d="M540 270H1060"/><path class="lx-pylon" d="M720 274V214M716 214h8M880 274V214M876 214h8"/>' + cab +
      '<path class="lx-hang" d="' + hang + '"/>' +
      // 자전거 (자전거 도시 상주)
      '<g class="lx-bike"><circle cx="0" cy="0" r="6"/><circle cx="18" cy="0" r="6"/><path d="M0 0l6-9h9l3 9M6-9l3 9h9M15-9l-1-3h-3M9 0l-2-12"/><circle cx="7" cy="-16" r="2.4"/></g>' +
      '</g>' +
      // 상주보 수문
      '<g class="lx-weir"><path d="M1080 300h120"/><path d="M1090 300v-14h10v14M1110 300v-14h10v14M1130 300v-14h10v14M1150 300v-14h10v14M1170 300v-14h10v14"/><path d="M1086 286h108"/></g>' +
      '<g class="rw">' + waves(318, 3, 'hw', 30) + waves(338, 2.4, 'hw hw2', 38) + waves(362, 3.4, 'hw hw3', 46) + '</g>' +
      '</g></svg>';
  }
  /* ---------- 사실적 자전거 라이더 (바퀴 회전 + 다리 역기구학 페달링) ---------- */
  function cyclist() {
    var BB = [60, 62], H = [52, 30], L1 = 21, L2 = 21, CR = 8.5, N = 12, DUR = 0.9;
    function legAt(theta) {
      var P = [BB[0] + CR * Math.cos(theta), BB[1] + CR * Math.sin(theta)];
      var dx = P[0] - H[0], dy = P[1] - H[1], d = Math.min(Math.hypot(dx, dy), L1 + L2 - .01);
      var a = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)), base = Math.atan2(dy, dx);
      var K = [H[0] + L1 * Math.cos(base - a), H[1] + L1 * Math.sin(base - a)]; // 무릎은 앞쪽
      var T = [P[0] + 6, P[1] + .5];
      return 'M' + H[0] + ' ' + H[1] + 'L' + K[0].toFixed(2) + ' ' + K[1].toFixed(2) + 'L' + P[0].toFixed(2) + ' ' + P[1].toFixed(2) + 'L' + T[0].toFixed(2) + ' ' + T[1].toFixed(2);
    }
    function legVals(off) { var v = []; for (var i = 0; i <= N; i++) v.push(legAt(off + i / N * Math.PI * 2)); return v.join(';'); }
    function wheel(cx) {
      var sp = ''; for (var i = 0; i < 16; i++) { var an = i / 16 * Math.PI * 2; sp += 'M' + cx + ' 62L' + (cx + 17 * Math.cos(an)).toFixed(2) + ' ' + (62 + 17 * Math.sin(an)).toFixed(2); }
      return '<circle class="cy-tire" cx="' + cx + '" cy="62" r="19"/><circle class="cy-rim" cx="' + cx + '" cy="62" r="17"/>' +
        '<g><path class="cy-spoke" d="' + sp + '"/><animateTransform attributeName="transform" type="rotate" from="0 ' + cx + ' 62" to="360 ' + cx + ' 62" dur="' + DUR + 's" repeatCount="indefinite"/></g>' +
        '<circle class="cy-hub" cx="' + cx + '" cy="62" r="2"/>';
    }
    var crank = '<g><path class="cy-crank" d="M60 62l8.5 0M60 62l-8.5 0"/><circle class="cy-ring" cx="60" cy="62" r="5"/>' +
      '<animateTransform attributeName="transform" type="rotate" from="0 60 62" to="360 60 62" dur="' + DUR + 's" repeatCount="indefinite"/></g>';
    return '<div class="lx-rider" aria-hidden="true"><svg viewBox="0 0 120 86" focusable="false">' +
      '<ellipse class="cy-shadow" cx="60" cy="82.5" rx="46" ry="3"/>' +
      '<path class="cy-leg cy-far"><animate attributeName="d" values="' + legVals(Math.PI) + '" dur="' + DUR + 's" repeatCount="indefinite"/></path>' +
      wheel(24) + wheel(96) +
      '<path class="cy-frame" d="M24 62L44 34H84M44 34L60 62L84 34M60 62L24 62M84 34L96 62M84 34L86 26"/>' +
      '<path class="cy-bar" d="M86 26q5-1 7 3"/><path class="cy-seat" d="M38 30h12"/><path class="cy-post" d="M44 34l-2-4"/>' +
      crank +
      '<g class="cy-body">' +
      '<path class="cy-torso" d="M52 30Q62 17 76 15"/><path class="cy-arm" d="M75 16Q82 21 88 27"/>' +
      '<circle class="cy-head" cx="81" cy="9" r="5.2"/><path class="cy-helmet" d="M75.6 8.4a5.6 5.6 0 0 1 11 -.6l1.6 .8"/>' +
      '<animateTransform attributeName="transform" type="translate" values="0 0;0 .7;0 0" dur="' + (DUR / 2) + 's" repeatCount="indefinite"/></g>' +
      '<path class="cy-leg"><animate attributeName="d" values="' + legVals(0) + '" dur="' + DUR + 's" repeatCount="indefinite"/></path>' +
      '</svg></div>';
  }
  /* ---------- 학(두루미) 비행 — 날갯짓 ---------- */
  function cranes() {
    var up = 'M0 0Q-10 -12 -24 -14Q-12 -4 0 0Q12 -4 24 -14Q10 -12 0 0Z';
    var mid = 'M0 0Q-12 -3 -26 -2Q-12 2 0 0Q12 2 26 -2Q12 -3 0 0Z';
    var dn = 'M0 0Q-10 6 -22 12Q-10 2 0 0Q10 2 22 12Q10 6 0 0Z';
    function bird(i, s, d) {
      return '<g class="lx-crane" style="--cd:' + d + 's;--cs:' + s + ';--cy:' + (i * 26) + 'px"><svg viewBox="-30 -18 60 34" focusable="false">' +
        '<path class="cr-wing" d="' + mid + '"><animate attributeName="d" values="' + mid + ';' + up + ';' + mid + ';' + dn + ';' + mid + '" dur="' + (1.3 + i * .15) + 's" repeatCount="indefinite"/></path>' +
        '<path class="cr-neck" d="M0 0L13 -2.5"/><circle class="cr-head" cx="14" cy="-2.8" r="1.6"/><path class="cr-legs" d="M0 0L-15 1.2"/></svg></g>';
    }
    return '<div class="lx-cranes" aria-hidden="true">' + bird(0, 1, 0) + bird(1, .78, 1.6) + bird(2, .62, 3.1) + '</div>';
  }

  /* ---------- v2: 사실적 로드바이크 라이더 실루엣 (에어로 자세 · 관절 IK · 실제 비율) ---------- */
  function cyclist2() {
    var CAD = 1.15, WHEEL = .5, N = 16;
    var RA = [40, 84], FA = [150, 84], BB = [86, 90], R = 33;
    var HIP = [72, 31], L1 = 43, L2 = 41, CR = 16.5;
    function leg(theta) {
      var P = [BB[0] + CR * Math.cos(theta), BB[1] + CR * Math.sin(theta)];
      var dx = P[0] - HIP[0], dy = P[1] - HIP[1], d = Math.min(Math.hypot(dx, dy), L1 + L2 - .2);
      var a = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)), b = Math.atan2(dy, dx);
      var K = [HIP[0] + L1 * Math.cos(b - a), HIP[1] + L1 * Math.sin(b - a)];
      // 발목: 페달 위치에서 발끝은 약간 아래로 (실제 페달링의 앵클링)
      var ank = -0.25 + 0.35 * Math.sin(theta + 0.6);
      var heel = [P[0] - 6 * Math.cos(ank), P[1] - 6 * Math.sin(ank) - 2.5], toe = [P[0] + 9 * Math.cos(ank), P[1] + 9 * Math.sin(ank)];
      var f = function (p) { return p[0].toFixed(2) + ' ' + p[1].toFixed(2); };
      return { thigh: 'M' + f(HIP) + 'L' + f(K), shin: 'M' + f(K) + 'L' + f(heel), foot: 'M' + f(heel) + 'L' + f(toe) };
    }
    function vals(off, k) { var v = []; for (var i = 0; i <= N; i++) v.push(leg(off + i / N * Math.PI * 2)[k]); return v.join(';'); }
    function legG(off, cls) {
      return '<g class="' + cls + '">' + ['thigh', 'shin', 'foot'].map(function (k) {
        return '<path class="rs-' + k + '"><animate attributeName="d" values="' + vals(off, k) + '" dur="' + CAD + 's" repeatCount="indefinite"/></path>';
      }).join('') + '</g>';
    }
    function wheel(c) {
      var sp = ''; for (var i = 0; i < 24; i++) { var an = i / 24 * Math.PI * 2; sp += 'M' + c[0] + ' ' + c[1] + 'L' + (c[0] + (R - 3) * Math.cos(an)).toFixed(2) + ' ' + (c[1] + (R - 3) * Math.sin(an)).toFixed(2); }
      return '<g class="rs-wheel"><circle class="rs-blur" cx="' + c[0] + '" cy="' + c[1] + '" r="' + (R - 3) + '"/>' +
        '<g><path class="rs-spoke" d="' + sp + '"/><animateTransform attributeName="transform" type="rotate" from="0 ' + c[0] + ' ' + c[1] + '" to="360 ' + c[0] + ' ' + c[1] + '" dur="' + WHEEL + 's" repeatCount="indefinite"/></g>' +
        '<circle class="rs-rim" cx="' + c[0] + '" cy="' + c[1] + '" r="' + (R - 2.6) + '"/><circle class="rs-tire" cx="' + c[0] + '" cy="' + c[1] + '" r="' + R + '"/><circle class="rs-hub" cx="' + c[0] + '" cy="' + c[1] + '" r="2.6"/></g>';
    }
    var frame = 'M' + RA + 'L86 90L136 54L132 40L76 43ZM86 90L76 43M76 43L' + RA + 'M132 40L136 54L' + FA;
    var crank = '<g><path class="rs-crank" d="M86 90l16.5 0M86 90l-16.5 0"/><circle class="rs-ring" cx="86" cy="90" r="9"/>' +
      '<animateTransform attributeName="transform" type="rotate" from="0 86 90" to="360 86 90" dur="' + CAD + 's" repeatCount="indefinite"/></g>';
    return '<div class="lx-rider" aria-hidden="true"><svg viewBox="0 0 200 124" focusable="false">' +
      '<ellipse class="rs-shadow" cx="96" cy="119" rx="78" ry="3.4"/>' +
      legG(Math.PI, 'rs-far') +
      '<path class="rs-arm rs-far" d="M120 23Q127 31 139 38"/>' +
      wheel(RA) + wheel(FA) +
      '<path class="rs-frame" d="' + frame + '"/>' +
      '<path class="rs-post" d="M76 43L73 33"/><path class="rs-saddle" d="M62 32.2Q71 30 82 32.6"/>' +
      '<path class="rs-stem" d="M132 40L141 37"/><path class="rs-bar" d="M141 37Q147 37 147 44Q147 51 141 52"/>' +
      '<path class="rs-chain" d="M' + RA + 'L86 81M' + RA + 'L86 99"/>' + crank +
      '<g class="rs-body"><animateTransform attributeName="transform" type="translate" values="0 0;0 .55;0 0" dur="' + (CAD / 2) + 's" repeatCount="indefinite"/>' +
      '<path class="rs-torso" d="M70 31Q96 18 121 21"/>' +
      '<path class="rs-head" d="M124 16Q125 7.5 134 7.2Q143 7.4 145 13.5L139 15Q137 21 130 21.5Q125 21 124 16Z"/>' +
      '<path class="rs-arm" d="M120 23Q128 32 140 38"/></g>' +
      legG(0, 'rs-near') +
      '</svg></div>';
  }
  /* ---------- v2: 사실적 두루미(학) 비행 실루엣 — 연속 날개각 보간 ---------- */
  function cranes2() {
    // 날개: 어깨(0,0)에서 바깥으로, 앞전/뒷전 + 칼깃(손가락) 5개. 점 개수 고정 → 모핑 가능
    var lead = [[0, 0], [10, -1.2], [22, -1.6], [34, -.6], [44, 1.2]];
    var fingers = [[50, 4], [46, 5.4], [51.5, 7.8], [46, 8.6], [51, 11.4], [45, 11.8], [48.5, 14.6], [42, 14], [44, 16.8], [37, 15.6]];
    var trail = [[28, 15.2], [18, 14.6], [8, 12.6], [0, 9]];
    var shape = lead.concat(fingers, trail);
    function wingAt(a) { // a: 날개 상하각(rad). 화면: x = 뒤로 스윕, y = 위아래
      var ca = Math.cos(a), sa = Math.sin(a);
      return 'M' + shape.map(function (p) {
        var span = p[0], chord = p[1];
        span *= 1.12; chord *= 1.7;
        var x = -span * 0.3 - chord * 0.75, y = -span * sa + chord * 0.62 * ca;
        return (60 + x).toFixed(2) + ' ' + (28 + y).toFixed(2);
      }).join('L') + 'Z';
    }
    var seq = [], K = 18;
    for (var i = 0; i <= K; i++) { var t = i / K; seq.push(wingAt(0.95 * Math.cos(t * Math.PI * 2) + 0.12 * Math.sin(t * Math.PI * 4) - 0.05)); }
    var nearW = seq.join(';');
    var farW = seq.slice(2).concat(seq.slice(1, 3)).join(';');
    // 몸통(통통한 가슴·배) → 가늘고 긴 목 → 작은 머리 → 부리, 짧은 꼬리깃
    var body = 'M26 29.5L33 27.4Q40 24.2 52 23.6Q64 23.2 72 25.4Q79 27 85 26.2Q93 24.8 100 24.2Q104 23.6 107.5 24.4L119 26.2L107.5 27.4Q103.5 28.6 99.5 28.4Q91 28.6 84 30.4Q77 33.6 66 35.6Q52 37.4 40 35.2Q32 33.6 26 31.6Z';
    var legs = 'M30 31.4L2 33.2M30 32.2L2 34.6M2 33.2l-2.4 1M2 34.6l-2.4 1.2';
    function bird(i, w, top, d, dur, flap) {
      return '<div class="lx-crane" style="--w:' + w + 'px;--top:' + top + 'px;--cd:' + d + 's;--fd:' + dur + 's"><svg viewBox="0 -10 122 72" focusable="false">' +
        '<path class="cr2-wing cr2-far"><animate attributeName="d" values="' + farW + '" dur="' + flap + 's" repeatCount="indefinite"/></path>' +
        '<path class="cr2-legs" d="' + legs + '"/><path class="cr2-body" d="' + body + '"/><circle class="cr2-crown" cx="105.4" cy="25.2" r="1.3"/>' +
        '<path class="cr2-wing"><animate attributeName="d" values="' + nearW + '" dur="' + flap + 's" repeatCount="indefinite"/></path>' +
        '</svg></div>';
    }
    return '<div class="lx-cranes" aria-hidden="true">' + bird(0, 118, 64, 0, 58, 1.9) + bird(1, 86, 112, 9, 66, 2.1) + '</div>';
  }

  function heroOld() {
    var kam = '';
    function waves(y, amp, cls, dur) {
      var d = 'M-1200 ' + y;
      for (var x = -1200; x < 2400; x += 60) d += ' q15 ' + (-amp) + ' 30 0 t30 0';
      return '<path class="' + cls + '" style="--dur:' + dur + 's" d="' + d + '"/>';
    }
    return '<svg class="hero-art" viewBox="0 0 1200 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<radialGradient id="hgMoon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fbeac0" stop-opacity=".95"/><stop offset=".55" stop-color="#e3c27f" stop-opacity=".35"/><stop offset="1" stop-color="#e3c27f" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="hgM1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--hero-m1a)"/><stop offset="1" stop-color="var(--hero-m1b)"/></linearGradient>' +
      '<linearGradient id="hgM2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--hero-m2a)"/><stop offset="1" stop-color="var(--hero-m2b)"/></linearGradient>' +
      '<linearGradient id="hgRiver" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--hero-r)" stop-opacity="0"/><stop offset=".3" stop-color="var(--hero-r)"/><stop offset=".7" stop-color="var(--hero-r)"/><stop offset="1" stop-color="var(--hero-r)" stop-opacity="0"/></linearGradient>' +
      '</defs>' +
      '<circle cx="820" cy="120" r="120" fill="url(#hgMoon)" class="h-moon"/><circle cx="820" cy="120" r="34" fill="#f6e2b0" opacity=".55"/>' +
      '<path fill="url(#hgM2)" d="M0 230C90 190 160 150 240 168S380 120 470 140 610 200 700 178 860 112 960 130 1110 186 1200 170V360H0Z"/>' +
      '<path class="hl" d="M0 230C90 190 160 150 240 168S380 120 470 140 610 200 700 178 860 112 960 130 1110 186 1200 170"/>' +
      '<path fill="url(#hgM1)" d="M0 268C120 236 210 214 320 232S520 206 610 222 790 252 900 230 1080 214 1200 236V360H0Z"/>' +
      '<path class="hl hl2" d="M0 268C120 236 210 214 320 232S520 206 610 222 790 252 900 230 1080 214 1200 236"/>' +
      '<rect x="0" y="276" width="1200" height="84" fill="url(#hgRiver)" opacity=".5"/>' +
      '<g class="isl"><path class="hf" d="M470 290C500 270 590 266 650 276S700 294 660 298 500 304 470 290Z"/>' +
      '<path class="hl" d="M470 290C500 270 590 266 650 276S700 294 660 298 500 304 470 290Z"/>' +
      '<path class="hl" d="M520 280v-16M520 268l-6-6M520 270l5-5M560 276v-20M560 262l-7-7M560 265l6-6M600 276v-14M600 266l-5-5M630 280v-12"/></g>' +
      '<path class="hl hb" d="M300 300Q390 262 478 288"/><path class="hl hb" d="M300 300V286M330 292V278M360 286V272M390 282V268M420 280V266M450 282V270" opacity=".5"/>' +
      '<g class="rw">' + waves(306, 4, 'hw', 26) + waves(320, 3, 'hw hw2', 34) + waves(336, 5, 'hw hw3', 42) + '</g>' +
      kam +
      '</svg>';
  }

  /* ---------- 건물 단면 다이어그램 (데이터 기반) ---------- */
  function section(f) {
    f = f || {};
    var fa = Math.max(1, Math.min(60, Math.round(f.floorsAbove || 1)));
    var fb = Math.max(0, Math.min(10, Math.round(f.floorsBelow || 0)));
    var da = Math.min(fa, 8), db = Math.min(fb, 3);
    var total = da + db;
    var fh = Math.min(26, 176 / total);
    var top = 42, X0 = 96, X1 = 268;
    var ground = top + da * fh;
    var bottom = ground + db * fh;
    var H = Math.max(bottom + 34, 230);
    var o = '';
    // 지반
    o += '<rect class="sd-soil" x="0" y="' + ground + '" width="360" height="' + (H - ground) + '"/>';
    o += '<path class="sd-g" d="M0 ' + ground + 'H360"/>';
    // 층
    for (var i = 0; i < da; i++) {
      var y = ground - (i + 1) * fh;
      var n = (fa > da && i === da - 1) ? fa : i + 1;
      o += '<rect class="sd-fl" x="' + X0 + '" y="' + y + '" width="' + (X1 - X0) + '" height="' + fh + '"/>';
      o += '<text class="sd-t" x="' + (X0 - 8) + '" y="' + (y + fh / 2 + 3.5) + '" text-anchor="end">' + n + 'F</text>';
      if (fa > da && i === da - 2) o += '<path class="sd-brk" d="M' + (X0 - 4) + ' ' + (y + 3) + 'l8 -6M' + (X1 - 4) + ' ' + (y + 3) + 'l8 -6"/>';
      // 창
      for (var w = 0; w < 6; w++) o += '<rect class="sd-w" x="' + (X0 + 12 + w * 18) + '" y="' + (y + fh * 0.3) + '" width="10" height="' + (fh * 0.4) + '" rx="1"/>';
      if (f.sprinkler) for (var s = 0; s < 7; s++) o += '<circle class="sd-sp" cx="' + (X0 + 10 + s * 18) + '" cy="' + (y + 3) + '" r="1.6"/>';
      else if (f.simpleSprinkler && i === 0) for (var s2 = 0; s2 < 4; s2++) o += '<circle class="sd-sp" cx="' + (X0 + 14 + s2 * 30) + '" cy="' + (y + 3) + '" r="1.6"/>';
      if (f.autoDetection) o += '<circle class="sd-det" cx="' + (X0 + 140) + '" cy="' + (y + 4) + '" r="2.4"/>';
      if (f.indoorHydrant) o += '<rect class="sd-hy" x="' + (X0 + 4) + '" y="' + (y + fh - 10) + '" width="6" height="8" rx="1"/>';
    }
    for (var j = 0; j < db; j++) {
      var yb = ground + j * fh;
      var nb = (fb > db && j === db - 1) ? fb : j + 1;
      o += '<rect class="sd-fl sd-bf" x="' + X0 + '" y="' + yb + '" width="' + (X1 - X0) + '" height="' + fh + '"/>';
      o += '<text class="sd-t" x="' + (X0 - 8) + '" y="' + (yb + fh / 2 + 3.5) + '" text-anchor="end">B' + nb + '</text>';
      if (f.sprinkler) for (var s3 = 0; s3 < 7; s3++) o += '<circle class="sd-sp" cx="' + (X0 + 10 + s3 * 18) + '" cy="' + (yb + 3) + '" r="1.6"/>';
    }
    // 지붕
    o += '<path class="sd-roof" d="M' + (X0 - 6) + ' ' + (top) + 'H' + (X1 + 6) + '"/>';
    // 승강기 샤프트
    var labels = [];
    if ((f.elevators || 0) > 0) {
      var ex = X1 - 30;
      o += '<rect class="sd-shaft" x="' + ex + '" y="' + (top - 8) + '" width="18" height="' + (bottom - top + 8) + '"/>';
      o += '<rect class="sd-car" x="' + (ex + 3) + '" y="' + (ground - fh + 3) + '" width="12" height="' + (fh - 6) + '" rx="1.5"/>';
      o += '<path class="sd-cable" d="M' + (ex + 9) + ' ' + (top - 8) + 'V' + (ground - fh + 3) + '"/>';
      labels.push([ex + 9, top - 12, '승강기 ' + f.elevators + '대', 'mid']);
    }
    // 기계·전기실 (최하층)
    var mechY = db > 0 ? bottom - fh : ground - fh;
    var mx = X0 + 18;
    if ((f.receivingKW || 0) > 0 || f.voltage) {
      o += '<g class="sd-eq sd-elec" transform="translate(' + mx + ' ' + (mechY + fh / 2 - 7) + ')"><rect width="16" height="14" rx="2"/><path d="M9 2L5 8h4l-1 4 4-6H8z"/></g>';
      mx += 22;
    }
    if (f.generatorKW) {
      o += '<g class="sd-eq sd-gen" transform="translate(' + mx + ' ' + (mechY + fh / 2 - 7) + ')"><rect width="18" height="14" rx="2"/><circle cx="9" cy="7" r="4"/></g>';
      mx += 24;
    }
    if ((f.boilers || 0) > 0 && f.boilerKind !== '없음') {
      o += '<g class="sd-eq sd-boil" transform="translate(' + mx + ' ' + (mechY + fh / 2 - 8) + ')"><rect width="12" height="16" rx="5"/><path d="M6 4q-3 4 0 8q3-4 0-8"/></g>';
      mx += 18;
    }
    if (f.waterTankM3) {
      o += '<g class="sd-eq sd-tank" transform="translate(' + mx + ' ' + (mechY + fh / 2 - 7) + ')"><rect width="20" height="14" rx="2"/><path d="M2 8q4-3 8 0t8 0"/></g>';
      mx += 26;
    }
    if (f.chillerRT) {
      o += '<g class="sd-eq sd-chill" transform="translate(' + mx + ' ' + (mechY + fh / 2 - 7) + ')"><rect width="18" height="14" rx="2"/><path d="M9 3v8M5 5l8 4M13 5l-8 4"/></g>';
    }
    // 옥상 태양광
    if (f.solarKW) {
      for (var p = 0; p < 4; p++) o += '<path class="sd-solar" d="M' + (X0 + 20 + p * 26) + ' ' + (top - 2) + 'l6 -12h18l-6 12z"/>';
      labels.push([X0 + 60, top - 18, '태양광 ' + f.solarKW + 'kW', 'mid']);
    }
    // 외부: 가스, EV, 놀이시설, 정화조
    if (f.gasType === 'LPG') {
      o += '<g class="sd-eq sd-gas" transform="translate(' + (X1 + 22) + ' ' + (ground - 26) + ')"><rect x="2" y="0" width="16" height="26" rx="8"/><path d="M7 -3h6"/></g>';
      labels.push([X1 + 32, ground - 32, 'LPG', 'mid']);
    } else if (f.gasType === '도시가스') {
      o += '<g class="sd-eq sd-gas" transform="translate(' + (X1 + 2) + ' ' + (ground - 18) + ')"><rect width="12" height="12" rx="2"/><circle cx="6" cy="6" r="3"/></g>';
      labels.push([X1 + 20, ground - 22, '가스', 'start']);
    }
    if (f.evCharger) {
      o += '<g class="sd-eq sd-ev" transform="translate(' + (X1 + 50) + ' ' + (ground - 24) + ')"><rect width="12" height="24" rx="2"/><path d="M7 5l-3 6h4l-2 5"/></g>';
    }
    if (f.playground) {
      o += '<path class="sd-play" d="M22 ' + ground + 'l10 -30h20l10 30M36 ' + (ground - 30) + 'v16M48 ' + (ground - 30) + 'v16M34 ' + (ground - 14) + 'h16"/>';
    }
    if (f.sewage && f.sewage !== '공공하수도') {
      o += '<rect class="sd-sep" x="22" y="' + (ground + 6) + '" width="44" height="18" rx="4"/>';
      labels.push([44, ground + 36, f.sewage, 'mid']);
    }
    if (f.heritage) {
      o += '<path class="sd-her" d="M' + (X0 + 40) + ' ' + (top - 4) + 'h92" />';
    }
    labels.forEach(function (l) {
      o += '<text class="sd-lb" x="' + l[0] + '" y="' + l[1] + '" text-anchor="' + (l[3] === 'mid' ? 'middle' : 'start') + '">' + l[2] + '</text>';
    });
    if (fb > 0 || db === 0) {
      o += '<text class="sd-t sd-gl" x="352" y="' + (ground - 4) + '" text-anchor="end">GL</text>';
    }
    var label = '건물 단면도: 지상 ' + fa + '층, 지하 ' + fb + '층';
    return '<svg class="section-svg" viewBox="0 0 360 ' + Math.ceil(H) + '" role="img" aria-label="' + label + '">' + o + '</svg>';
  }

  /* ---------- 빈 상태 일러스트 ---------- */
  function empty(kind) {
    var body =
      '<ellipse class="e-sh" cx="120" cy="150" rx="74" ry="9"/>' +
      '<rect class="e-doc" x="66" y="22" width="92" height="118" rx="8"/>' +
      '<path class="e-ln" d="M82 48h50M82 62h60M82 76h40M82 90h56M82 104h34"/>' +
      '<circle class="e-lens" cx="152" cy="104" r="24"/><path class="e-ln e-h" d="M169 121l20 20"/>' +
      '<path class="e-ac" d="M144 98l6 7 10-12"/>' +
      '<circle class="e-dot" cx="52" cy="40" r="3"/><circle class="e-dot" cx="196" cy="60" r="2.4"/><circle class="e-dot" cx="186" cy="28" r="1.6"/>';
    if (kind === 'data') body += '<path class="e-ac" d="M100 128q10-6 20 0t20 0"/>';
    return svg('0 0 240 170', body, 'empty-ill');
  }

  /* ---------- 진행 링 ---------- */
  function ring(pct, size, label) {
    var r = 42, c = 2 * Math.PI * r;
    var p = Math.max(0, Math.min(100, pct || 0));
    return '<svg class="ring" viewBox="0 0 100 100" width="' + (size || 120) + '" height="' + (size || 120) + '" role="img" aria-label="' + (label || '') + ' ' + Math.round(p) + '%">' +
      '<circle class="ring-bg" cx="50" cy="50" r="' + r + '"/>' +
      '<circle class="ring-fg" cx="50" cy="50" r="' + r + '" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + c.toFixed(2) + '" data-target="' + (c * (1 - p / 100)).toFixed(2) + '" transform="rotate(-90 50 50)"/>' +
      '<circle class="ring-tick" cx="50" cy="50" r="34"/>' +
      '</svg>';
  }

  global.SJG = { building: building, icon: icon, logo: logo, hero: hero, cyclist: cyclist2, cranes: cranes2, section: section, empty: empty, ring: ring, CATEGORY_KEYS: Object.keys(B) };
})(window);
