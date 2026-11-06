/* SJ-FMS 공공데이터 연동 모듈 (window.SJ_API)
 * 국토교통부 건축HUB 건축물대장정보 서비스 (data.go.kr 오픈API, 서비스키 필요)
 *   표제부:     https://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo
 *   총괄표제부: https://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo
 * 순수 함수 위주, UI 코드 없음. 모든 비동기 함수는 throw 대신 {ok:false, error:"사람이 읽을 메시지"} 반환.
 */
(function () {
  var BASE = "https://apis.data.go.kr/1613000/BldRgstHubService/";
  var SIGUNGU = "47250"; // 경상북도 상주시

  /* 상주시 법정동코드(bjdongCd 5자리) 표.
   * - 읍·면 단위 코드(XXX00)는 행정표준코드 체계(읍 25000, 면 31000~)에 따른 값.
   * - 건축물대장 조회에는 '리' 단위 코드(예: 32021)가 필요하므로 읍면 코드만으로는 조회되지 않을 수 있음.
   * - 동(洞) 코드는 확인되지 않아 null. 담당자가 행정표준코드관리시스템(code.go.kr) 또는
   *   행정안전부 '법정동코드' 파일데이터로 확인 후 SJ_API.setBjdong(이름, 코드)로 등록할 것.
   * VERIFIED=false: 전 항목 확인 필요.
   */
  var BJDONG = {
    "함창읍": "25000", "중동면": "31000", "사벌국면": "32000", "사벌면": "32000", "낙동면": "33000",
    "청리면": "34000", "공성면": "35000", "외남면": "36000", "내서면": "37000", "모동면": "38000",
    "모서면": "39000", "화동면": "40000", "화서면": "41000", "화북면": "42000", "외서면": "43000",
    "은척면": "44000", "공검면": "45000", "이안면": "46000", "화남면": "47000",
    // 동 지역(법정동) — 코드 미확인
    "성하동": null, "성동동": null, "인봉동": null, "복룡동": null, "서성동": null, "남성동": null,
    "서문동": null, "동문동": null, "지천동": null, "오대동": null, "신봉동": null, "계산동": null,
    "부원동": null, "냉림동": null, "남장동": null, "낙양동": null, "개운동": null, "흥각동": null,
    "가장동": null, "양촌동": null, "낙상동": null, "중덕동": null, "화산동": null, "만산동": null,
    "무양동": null, "죽전동": null, "초산동": null, "남적동": null, "연원동": null, "도남동": null,
    "가산동": null, "헌신동": null, "거동동": null, "인평동": null, "서곡동": null
  };

  function setBjdong(name, code) {
    if (!name || !/^\d{5}$/.test(String(code || ""))) return false;
    BJDONG[String(name).trim()] = String(code);
    return true;
  }

  /* 지번주소 → { ok, bjdongCd, platGbCd, bun, ji, place, error }
   * 예: "경상북도 상주시 복룡동 230-10", "상주시 사벌국면 삼덕리 산18-7"
   * 리 단위 코드가 표에 있으면("삼덕리" 등) 우선 사용, 없으면 읍면/동 코드.
   */
  function parseJibun(addr) {
    var s = String(addr || "").replace(/\s+/g, " ").trim();
    if (!s) return { ok: false, error: "지번주소가 비어 있습니다." };
    s = s.replace(/^(경상북도|경북)\s*/, "").replace(/^상주시\s*/, "");
    var m = s.match(/^(\S+(?:읍|면|동))(?:\s+(\S+리))?\s+(산\s*)?(\d+)(?:-(\d+))?/);
    if (!m) return { ok: false, error: "지번을 해석할 수 없습니다. '○○동 123-4' 또는 '○○면 ○○리 123-4' 형식으로 입력하세요: " + addr };
    var umd = m[1], ri = m[2] || "", place = umd + (ri ? " " + ri : "");
    var code = (ri && BJDONG[umd + " " + ri]) || (ri && BJDONG[ri]) || BJDONG[umd];
    var res = {
      ok: !!code, place: place,
      bjdongCd: code || null,
      platGbCd: m[3] ? "1" : "0", // 0 대지, 1 산
      bun: pad4(m[4]), ji: pad4(m[5] || "0")
    };
    if (!code) res.error = "'" + place + "'의 법정동코드가 등록되어 있지 않습니다. 행정표준코드관리시스템(code.go.kr)에서 10자리 코드(47250XXXXX)의 뒤 5자리를 확인해 입력하세요.";
    else if (ri && !BJDONG[umd + " " + ri] && !BJDONG[ri]) res.warning = "리 단위 코드 미등록 — 읍면 코드(" + code + ")로 조회하면 결과가 없을 수 있습니다.";
    return res;
  }

  function pad4(n) { n = String(parseInt(n, 10) || 0); while (n.length < 4) n = "0" + n; return n; }

  function buildUrl(op, p) {
    p = p || {};
    var q = {
      serviceKey: p.serviceKey || "", sigunguCd: p.sigunguCd || SIGUNGU, bjdongCd: p.bjdongCd || "",
      platGbCd: p.platGbCd == null ? "0" : p.platGbCd, bun: p.bun || "", ji: p.ji || "",
      _type: "json", numOfRows: p.numOfRows || 10, pageNo: p.pageNo || 1
    };
    var parts = [];
    for (var k in q) {
      if (!Object.prototype.hasOwnProperty.call(q, k) || q[k] === "") continue;
      // 디코딩된 키(+,/,= 포함)와 인코딩된 키(%2B 등) 모두 허용
      var v = k === "serviceKey" && /%[0-9A-Fa-f]{2}/.test(q[k]) ? q[k] : encodeURIComponent(q[k]);
      parts.push(k + "=" + v);
    }
    return BASE + op + "?" + parts.join("&");
  }

  function toNum(v) { var n = parseFloat(v); return isFinite(n) ? n : null; }
  function toInt(v) { var n = parseInt(v, 10); return isFinite(n) ? n : null; }
  function toDate(v) {
    var s = String(v || "").replace(/\D/g, "");
    return s.length === 8 && s !== "00000000" ? s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6, 8) : null;
  }

  /* 건축물대장 주용도명 → SCHEMA buildingUse */
  var USES = ["업무시설", "문화및집회시설", "교육연구시설", "노유자시설", "운동시설", "관광휴게시설",
    "근린생활시설", "의료시설", "수련시설", "묘지관련시설", "창고시설"];
  function mapUse(nm) {
    var s = String(nm || "").replace(/\s/g, "");
    if (/제[12]종근린생활시설/.test(s)) return "근린생활시설";
    for (var i = 0; i < USES.length; i++) if (s.indexOf(USES[i]) >= 0) return USES[i];
    return s ? "기타" : "";
  }

  /* 표제부 item → SCHEMA 부분 객체 (값이 있는 필드만) */
  function mapTitle(item) {
    if (!item) return {};
    var out = {}, v;
    if ((v = toNum(item.totArea)) != null) out.area = v;
    if ((v = toInt(item.grndFlrCnt)) != null) out.floorsAbove = v;
    if ((v = toInt(item.ugrndFlrCnt)) != null) out.floorsBelow = v;
    if ((v = toNum(item.heit)) != null && v > 0) out.height = v;
    if ((v = toDate(item.useAprDay))) out.approvalDate = v;
    if (item.mainPurpsCdNm) out.buildingUse = mapUse(item.mainPurpsCdNm);
    if (item.etcPurps) out.subUse = String(item.etcPurps).trim();
    if (item.strctCdNm) out.structure = String(item.strctCdNm).trim();
    var ride = toInt(item.rideUseElvtCnt), emg = toInt(item.emgenUseElvtCnt);
    if (ride != null || emg != null) out.elevators = (ride || 0) + (emg || 0);
    if (Object.keys(out).length) out.dataSource = "건축물대장";
    return out;
  }

  /* 동일 대지 다동(多棟)일 때 연면적 최대 동을 대표로 선택 */
  function pickMain(items) {
    if (!items || !items.length) return null;
    return items.slice().sort(function (a, b) { return (toNum(b.totArea) || 0) - (toNum(a.totArea) || 0); })[0];
  }

  function extractItems(json) {
    var body = json && json.response && json.response.body;
    var items = body && body.items && body.items.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  }

  function headerError(json) {
    var h = json && json.response && json.response.header;
    if (h && h.resultCode && h.resultCode !== "00") return "API 오류(" + h.resultCode + "): " + (h.resultMsg || "");
    return null;
  }

  function explainText(txt) {
    var t = String(txt || "");
    if (/SERVICE_KEY_IS_NOT_REGISTERED|SERVICE KEY IS NOT REGISTERED/i.test(t)) return "등록되지 않은 서비스키입니다. 활용신청 승인 여부와 키(일반 인증키 Decoding/Encoding)를 확인하세요. 승인 직후에는 반영까지 1~2시간 걸릴 수 있습니다.";
    if (/LIMITED_NUMBER_OF_SERVICE_REQUESTS/i.test(t)) return "일일 호출 한도를 초과했습니다. 내일 다시 시도하거나 운영계정 전환을 신청하세요.";
    if (/SERVICE_ACCESS_DENIED|ACCESS DENIED/i.test(t)) return "이 서비스에 대한 활용 권한이 없습니다. '국토교통부_건축HUB_건축물대장정보 서비스' 활용신청을 확인하세요.";
    if (/<\?xml|<OpenAPI_ServiceResponse/i.test(t)) return "API가 오류 XML을 반환했습니다: " + t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
    return null;
  }

  function request(op, params) {
    if (!params || !params.serviceKey) return Promise.resolve({ ok: false, error: "서비스키가 없습니다. 설정에서 공공데이터포털 인증키를 입력하세요." });
    if (!params.bjdongCd || !params.bun) return Promise.resolve({ ok: false, error: "법정동코드(bjdongCd)와 본번(bun)이 필요합니다." });
    if (typeof fetch !== "function") return Promise.resolve({ ok: false, error: "이 브라우저는 fetch를 지원하지 않습니다." });
    var url = buildUrl(op, params);
    return fetch(url).then(function (r) {
      return r.text().then(function (txt) {
        if (!r.ok) return { ok: false, url: url, error: "HTTP " + r.status + " 오류. " + (explainText(txt) || "") };
        var json;
        try { json = JSON.parse(txt); } catch (e) { return { ok: false, url: url, error: explainText(txt) || "응답을 JSON으로 해석할 수 없습니다." }; }
        var he = headerError(json);
        if (he) return { ok: false, url: url, error: he };
        var items = extractItems(json);
        if (!items.length) return { ok: false, url: url, items: [], error: "해당 지번의 건축물대장이 없습니다. 법정동코드(리 단위)·본번·부번·산 여부를 확인하세요." };
        return { ok: true, url: url, items: items };
      });
    }, function (err) {
      return { ok: false, url: url, error: "네트워크/CORS 오류로 호출에 실패했습니다. 브라우저 보안정책(CORS) 또는 행정망 방화벽으로 apis.data.go.kr 직접 호출이 차단되었을 수 있습니다. 아래 URL을 새 탭에서 열어 결과를 확인하거나 세움터에서 직접 조회하세요. (" + (err && err.message || err) + ")" };
    });
  }

  function getTitle(params) { return request("getBrTitleInfo", params); }
  function getRecapTitle(params) { return request("getBrRecapTitleInfo", params); }

  /* 시설 객체(jibun 사용) → { ok, patch, items, url, error } */
  function lookupFacility(f, serviceKey) {
    var p = parseJibun(f && f.jibun);
    if (!p.ok) return Promise.resolve({ ok: false, error: p.error });
    return getTitle({ serviceKey: serviceKey, bjdongCd: p.bjdongCd, platGbCd: p.platGbCd, bun: p.bun, ji: p.ji, numOfRows: 50 })
      .then(function (r) {
        if (!r.ok) return r;
        var main = pickMain(r.items);
        return { ok: true, url: r.url, items: r.items, patch: mapTitle(main), buildings: r.items.length, warning: p.warning };
      });
  }

  window.SJ_API = {
    BASE: BASE, SIGUNGU: SIGUNGU, BJDONG: BJDONG, BJDONG_VERIFIED: false,
    setBjdong: setBjdong, parseJibun: parseJibun, buildUrl: buildUrl,
    mapTitle: mapTitle, mapUse: mapUse, pickMain: pickMain,
    getTitle: getTitle, getRecapTitle: getRecapTitle, lookupFacility: lookupFacility,
    REQUIRED_SERVICE: {
      name: "국토교통부_건축HUB_건축물대장정보 서비스",
      provider: "국토교통부",
      url: "https://www.data.go.kr/data/15134735/openapi.do"
    }
  };
})();
