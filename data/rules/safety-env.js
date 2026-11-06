/* SJ-FMS 규칙: 재난·중대재해 / 보건·환경 (law-safety-env)
 * 기준일: 2026-11 현행 법령. 불확실 수치는 verify:true.
 * 확인됨: 중대재해처벌법 시행령 별표2(law.go.kr 별표 원문), 실내공기질 관리법 대상·측정주기·교육주기(서울시 환경 누리집 요약).
 */
(function () {
  var S = function (v) { return String(v == null ? "" : v); };
  var N = function (v) { var n = Number(v); return isFinite(n) ? n : 0; };
  var has = function (f, kw) {
    var t = S(f && f.subUse) + " " + S(f && f.name) + " " + S(f && f.buildingUse);
    for (var i = 0; i < kw.length; i++) { if (t.indexOf(kw[i]) >= 0) return true; }
    return false;
  };
  var isEdu = function (f) { return has(f, ["학교", "유치원"]); }; // 교육시설안전법 교육시설은 중대시민재해 공중이용시설 제외

  /* 중대재해처벌법 시행령 별표2 (법 제2조제4호가목 — 실내공기질관리법 시설군) 중 상주시 건축물 관련 항목 */
  function sapaAnnex2(f) {
    if (!f) return null;
    var a = N(f.area), seats = N(f.seats);
    if (has(f, ["도서관"]) && a >= 3000) return "별표2 제7호 도서관(연면적 3천㎡ 이상)";
    if (has(f, ["박물관", "미술관"]) && a >= 3000) return "별표2 제8호 박물관·미술관(연면적 3천㎡ 이상)";
    if ((S(f.buildingUse) === "의료시설" || has(f, ["병원", "의원"])) && a >= 2000) return "별표2 제9호 의료기관(연면적 2천㎡ 이상)";
    if (has(f, ["노인요양", "요양원"]) && a >= 1000) return "별표2 제10호 노인요양시설(연면적 1천㎡ 이상)";
    if ((!!f.childcare || has(f, ["어린이집"])) && has(f, ["어린이집"]) && a >= 430) return "별표2 제11호 어린이집(연면적 430㎡ 이상)";
    if (has(f, ["장례식장"]) && N(f.floorsBelow) > 0 && a >= 1000) return "별표2 제14호 지하 장례식장(연면적 1천㎡ 이상) — 지하 위치 여부 확인";
    if (has(f, ["전시장", "전시관", "전시시설"]) && a >= 2000) return "별표2 제15호 옥내 전시시설(연면적 2천㎡ 이상)";
    if (S(f.buildingUse) === "업무시설" && a >= 3000) return "별표2 제16호 업무시설(연면적 3천㎡ 이상)";
    if (has(f, ["공연장"]) && seats >= 1000) return "별표2 제18호 실내 공연장(객석 1천석 이상)";
    if (!!f.sportsFacility && seats >= 1000) return "별표2 제19호 실내 체육시설(관람석 1천석 이상)";
    return null;
  }
  /* 별표3: 시설물안전법 1·2종 시설물(건축물) — 개략 판정 */
  function sapaAnnex3(f) {
    if (!f) return null;
    var a = N(f.area), fl = N(f.floorsAbove);
    var multi = ["문화및집회시설", "의료시설", "관광휴게시설", "판매시설", "운수시설", "종교시설"].indexOf(S(f.buildingUse)) >= 0;
    if (fl >= 21 || a >= 50000) return "별표3 제1종시설물(건축물)";
    if (fl >= 16 || a >= 30000 || (multi && a >= 5000)) return "별표3 제2종시설물(건축물)";
    return null;
  }
  function sapaPublic(f) {
    try { if (isEdu(f)) return null; return sapaAnnex2(f) || sapaAnnex3(f); } catch (e) { return null; }
  }

  /* 실내공기질 관리법 시행령 제2조 다중이용시설 (상주시 건축물 관련 항목) */
  function iaq(f) {
    if (!f) return null;
    var a = N(f.area), seats = N(f.seats);
    if (has(f, ["도서관"]) && a >= 3000) return "도서관(연면적 3천㎡ 이상)";
    if (has(f, ["박물관", "미술관"]) && a >= 3000) return "박물관·미술관(연면적 3천㎡ 이상)";
    if ((S(f.buildingUse) === "의료시설" || has(f, ["병원", "의원"])) && a >= 2000) return "의료기관(연면적 2천㎡ 이상)";
    if (has(f, ["노인요양", "요양원"]) && a >= 1000) return "노인요양시설(연면적 1천㎡ 이상)";
    if (has(f, ["어린이집"]) && a >= 430) return "어린이집(연면적 430㎡ 이상)";
    if (has(f, ["실내놀이", "키즈카페", "어린이놀이"]) && a >= 430) return "실내 어린이놀이시설(연면적 430㎡ 이상)";
    if (has(f, ["장례식장"]) && N(f.floorsBelow) > 0 && a >= 1000) return "지하 장례식장(연면적 1천㎡ 이상)";
    if (has(f, ["목욕장", "목욕탕", "찜질"]) && a >= 1000) return "목욕장(연면적 1천㎡ 이상)";
    if (has(f, ["산후조리원"]) && a >= 500) return "산후조리원(연면적 500㎡ 이상)";
    if (has(f, ["전시장", "전시관", "전시시설"]) && a >= 2000) return "옥내 전시시설(연면적 2천㎡ 이상)";
    if (S(f.buildingUse) === "업무시설" && a >= 3000) return "업무시설(연면적 3천㎡ 이상)";
    if (has(f, ["공연장"]) && seats >= 1000) return "실내 공연장(객석 1천석 이상)";
    if (!!f.sportsFacility && seats >= 1000) return "실내 체육시설(관람석 1천석 이상)";
    return null;
  }
  function iaqSafe(f) { try { return iaq(f); } catch (e) { return null; } }

  var L_SAPA = "https://www.law.go.kr/법령/중대재해처벌등에관한법률시행령";
  var L_OSH = "https://www.law.go.kr/법령/산업안전보건법";
  var L_IAQ = "https://www.law.go.kr/법령/실내공기질관리법";
  var L_WATER = "https://www.law.go.kr/법령/수도법";
  var L_SEWER = "https://www.law.go.kr/법령/하수도법";
  var L_INF = "https://www.law.go.kr/법령/감염병의예방및관리에관한법률";
  var L_ASB = "https://www.law.go.kr/법령/석면안전관리법";

  var staffed = function (f) { return f && (N(f.workers) > 0 || f.workers == null); };

  (window.SJ_RULES = window.SJ_RULES || []).push(
    /* ───────── 재난·중대재해: 중대시민재해 ───────── */
    {
      id: "SAPA-001", domain: "재난·중대재해",
      law: "중대재해 처벌 등에 관한 법률",
      basis: "법 제9조제2항, 시행령 제3조·제10조제1항제4호, 별표2·별표3",
      lawUrl: L_SAPA, kind: "plan",
      title: "공중이용시설 안전계획 수립·이행 (중대시민재해)",
      target: "시행령 별표2(실내공기질법 다중이용시설 중 도서관·박물관 3천㎡, 의료기관 2천㎡, 노인요양 1천㎡, 어린이집 430㎡, 업무시설 3천㎡, 옥내전시 2천㎡, 실내공연장 1천석, 실내체육 관람석 1천석 등) 또는 별표3(시설물안전법 1·2종 시설물) 해당 공중이용시설. 교육시설은 제외",
      applies: function (f) { return !!sapaPublic(f); },
      grade: function (f) { return sapaPublic(f); },
      cycleMonths: 12, anchor: "fixed", dueMonths: [1],
      cycleText: "연 1회 안전계획 수립, 충실히 이행",
      tasks: ["연간 안전계획 수립(안전점검·정밀안전진단, 보수·보강, 인력·예산 포함)", "안전계획을 경영책임자(시장) 결재로 확정", "계획 이행 실적 관리"],
      deadline: "연초(통상 1~2월) 수립 권장",
      performer: "시설 관리부서(중대재해 전담부서 협조)",
      records: "안전계획 및 이행 증빙 보관(5년 권장)",
      penalty: "중대시민재해 발생 시 경영책임자 1년 이상 징역 또는 10억원 이하 벌금(사망), 법인 50억원 이하 벌금",
      priority: "critical", verify: false,
      notes: "별표2 연면적은 둘 이상 건축물로 이루어진 시설은 합산. 별표2 제17호(둘 이상 용도 복합건축물 2천㎡)는 데이터로 판정 불가하므로 담당자 확인. 별표3 1·2종 판정은 개략치(구조 분야 규칙 참조)."
    },
    {
      id: "SAPA-002", domain: "재난·중대재해",
      law: "중대재해 처벌 등에 관한 법률",
      basis: "법 제9조제2항, 시행령 제10조제1항제4호·제5호",
      lawUrl: L_SAPA, kind: "inspection",
      title: "공중이용시설 안전계획 이행 반기 점검",
      target: "SAPA-001 대상 공중이용시설",
      applies: function (f) { return !!sapaPublic(f); },
      grade: function (f) { return sapaPublic(f); },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "반기 1회 이상",
      tasks: ["안전계획 이행 여부 점검(직접 또는 위탁)", "안전·보건 관계 법령 의무이행 점검(시행령 제11조)", "점검 결과에 따른 인력 배치·예산 추가 편성 등 조치", "결과를 경영책임자에게 보고"],
      deadline: "점검 후 지체 없이 경영책임자 보고",
      performer: "시설 관리부서 / 중대재해 전담부서",
      records: "점검·조치 결과 기록 보관",
      penalty: "중대시민재해 발생 시 형사처벌 근거(의무 불이행 입증)",
      priority: "critical", verify: false, notes: ""
    },
    {
      id: "SAPA-003", domain: "재난·중대재해",
      law: "중대재해 처벌 등에 관한 법률",
      basis: "법 제9조제2항, 시행령 제10조제1항제1호·제2호·제3호",
      lawUrl: L_SAPA, kind: "appointment",
      title: "공중이용시설 안전점검 인력 배치·예산 편성",
      target: "SAPA-001 대상 공중이용시설",
      applies: function (f) { return !!sapaPublic(f); },
      grade: function (f) { return sapaPublic(f); },
      cycleMonths: 12, anchor: "fixed", dueMonths: [10],
      cycleText: "연 1회 (본예산 편성 시기)",
      tasks: ["관계법령상 안전점검 등 수행 인력 확보·배치", "안전점검·정밀안전진단·보수보강 예산 편성", "유해·위험요인 점검 업무 담당자 지정"],
      deadline: "차년도 본예산 편성 시",
      performer: "시설 관리부서·예산부서",
      records: "인력 배치 및 예산 편성 내역",
      penalty: "중대시민재해 발생 시 형사처벌 근거",
      priority: "high", verify: true,
      notes: "시행령 제10조제1항 각 호 순번 재확인 필요."
    },
    {
      id: "SAPA-004", domain: "재난·중대재해",
      law: "중대재해 처벌 등에 관한 법률",
      basis: "법 제9조제2항, 시행령 제10조제1항제6호",
      lawUrl: L_SAPA, kind: "plan",
      title: "중대시민재해 비상대응 매뉴얼(위험징후·대피) 마련",
      target: "SAPA-001 대상 공중이용시설",
      applies: function (f) { return !!sapaPublic(f); },
      grade: function (f) { return null; },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "마련 후 연 1회 이상 검토 권장",
      tasks: ["이용자 대피·위험징후 발견 시 조치 매뉴얼 마련", "매뉴얼 숙지 교육 및 비치"],
      deadline: "",
      performer: "시설 관리부서",
      records: "매뉴얼 및 교육 기록",
      penalty: "중대시민재해 발생 시 형사처벌 근거",
      priority: "high", verify: true,
      notes: "시행령 제10조 제1항 해당 호 번호 확인 필요. 도급·용역·위탁 시 수급자 안전 확보 기준 마련도 포함."
    },

    /* ───────── 재난·중대재해: 중대산업재해 ───────── */
    {
      id: "SAPA-010", domain: "재난·중대재해",
      law: "중대재해 처벌 등에 관한 법률",
      basis: "법 제4조, 시행령 제4조제3호",
      lawUrl: L_SAPA, kind: "inspection",
      title: "유해·위험요인 확인·개선 절차 이행 점검 (중대산업재해)",
      target: "상시 근로자(공무직·기간제 포함) 또는 종사자가 근무하는 모든 시설 (지자체는 상시근로자 5명 이상 사업장)",
      applies: function (f) { return staffed(f); },
      grade: function (f) { return null; },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "반기 1회 이상",
      tasks: ["시설별 유해·위험요인 확인(위험성평가로 갈음 가능)", "개선조치 실시", "이행 여부 점검 결과 중대재해 전담부서 제출"],
      deadline: "반기 말까지",
      performer: "시설 관리부서(관리감독자)",
      records: "점검·개선 결과",
      penalty: "중대산업재해 발생 시 경영책임자 1년 이상 징역 또는 10억원 이하 벌금(사망)",
      priority: "critical", verify: false,
      notes: "산업안전보건법 제36조 위험성평가를 실시한 경우 이 절차를 갖춘 것으로 봄(시행령 제4조제3호 단서)."
    },
    {
      id: "SAPA-011", domain: "재난·중대재해",
      law: "중대재해 처벌 등에 관한 법률",
      basis: "법 제4조, 시행령 제4조제7호",
      lawUrl: L_SAPA, kind: "report",
      title: "종사자 의견 청취 및 개선방안 이행 점검",
      target: "종사자가 근무하는 모든 시설",
      applies: function (f) { return staffed(f); },
      grade: function (f) { return null; },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "반기 1회 이상 점검",
      tasks: ["종사자(공무직·용역·위탁 포함) 안전·보건 의견 청취(간담회·설문 등)", "개선방안 마련·이행", "이행 여부 반기 점검"],
      deadline: "반기 말까지",
      performer: "시설 관리부서",
      records: "의견청취 결과·개선 이행 기록",
      penalty: "중대산업재해 발생 시 형사처벌 근거",
      priority: "high", verify: false,
      notes: "산업안전보건위원회 등에서 논의한 경우 갈음 가능."
    },
    {
      id: "SAPA-012", domain: "재난·중대재해",
      law: "중대재해 처벌 등에 관한 법률",
      basis: "법 제4조, 시행령 제4조제8호",
      lawUrl: L_SAPA, kind: "plan",
      title: "중대산업재해 비상조치 매뉴얼 마련·점검",
      target: "종사자가 근무하는 모든 시설",
      applies: function (f) { return staffed(f); },
      grade: function (f) { return null; },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "반기 1회 이상 점검",
      tasks: ["작업중지·근로자 대피·위험요인 제거·구호조치·추가피해방지 매뉴얼 마련", "매뉴얼에 따른 조치 여부 반기 점검"],
      deadline: "반기 말까지",
      performer: "시설 관리부서",
      records: "매뉴얼·점검 기록",
      penalty: "중대산업재해 발생 시 형사처벌 근거",
      priority: "high", verify: false, notes: ""
    },
    {
      id: "SAPA-013", domain: "재난·중대재해",
      law: "중대재해 처벌 등에 관한 법률",
      basis: "법 제4조, 시행령 제4조제9호",
      lawUrl: L_SAPA, kind: "inspection",
      title: "도급·용역·위탁 시 수급인 안전보건 확보 기준·절차 점검",
      target: "청소·경비·시설관리·공사 등 도급·용역·위탁을 주는 시설",
      applies: function (f) { return !!f; },
      grade: function (f) { return null; },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "반기 1회 이상 점검",
      tasks: ["수급인의 안전보건 관리능력·관리비용·공사기간 평가기준 마련", "업체 선정 시 기준 적용", "이행 여부 반기 점검"],
      deadline: "반기 말까지",
      performer: "계약·시설 관리부서",
      records: "평가·선정 기록",
      penalty: "중대산업재해 발생 시 형사처벌 근거",
      priority: "high", verify: false,
      notes: "용역 미발주 시설은 해당 없음으로 처리."
    },
    {
      id: "SAPA-014", domain: "재난·중대재해",
      law: "중대재해 처벌 등에 관한 법률",
      basis: "법 제4조, 시행령 제5조제2항",
      lawUrl: L_SAPA, kind: "inspection",
      title: "안전·보건 관계 법령 의무이행 점검 및 교육 이행 확인",
      target: "종사자가 근무하는 모든 시설",
      applies: function (f) { return staffed(f); },
      grade: function (f) { return null; },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "반기 1회 이상",
      tasks: ["산업안전보건법 등 관계 법령 의무 이행 여부 점검(직접 또는 전문기관 위탁)", "유해·위험 작업 안전보건교육 실시 여부 확인", "미이행 시 인력·예산 조치", "결과 경영책임자 보고"],
      deadline: "점검 후 지체 없이 보고",
      performer: "시설 관리부서 / 중대재해 전담부서",
      records: "점검·보고 기록",
      penalty: "중대산업재해 발생 시 형사처벌 근거",
      priority: "critical", verify: false, notes: ""
    },

    /* ───────── 재난·중대재해: 산업안전보건법 ───────── */
    {
      id: "SAPA-020", domain: "재난·중대재해",
      law: "산업안전보건법",
      basis: "법 제36조, 시행규칙 제37조, 사업장 위험성평가에 관한 지침(고용노동부 고시)",
      lawUrl: L_OSH, kind: "plan",
      title: "위험성평가 (정기·수시)",
      target: "공무직·기간제 등 근로자(현업업무종사자)가 작업하는 시설",
      applies: function (f) { return staffed(f); },
      grade: function (f) { return null; },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "최초평가 후 매년 정기 재검토, 설비 변경·공사·재해 발생 시 수시",
      tasks: ["유해·위험요인 파악(근로자 참여)", "위험성 결정 및 감소대책 수립·실행", "결과 근로자 공유", "기록 보존"],
      deadline: "",
      performer: "관리감독자·근로자 참여",
      records: "위험성평가 결과 3년 보존",
      penalty: "실시 자체 미이행 직접 과태료는 없으나 기록 미보존 등 과태료, 중대재해 시 핵심 입증자료",
      priority: "high", verify: true,
      notes: "2023.5 고시 개정으로 정기평가 '매년'으로 변경. 과태료 조항 확인 필요."
    },
    {
      id: "SAPA-021", domain: "재난·중대재해",
      law: "산업안전보건법",
      basis: "법 제29조, 시행규칙 제26조 별표4",
      lawUrl: L_OSH, kind: "education",
      title: "근로자 정기 안전보건교육",
      target: "현업업무종사자(청소·시설관리·조경 등 공무직) 근무 시설",
      applies: function (f) { return staffed(f); },
      grade: function (f) { return null; },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "매반기 사무직 6시간 이상 / 그 밖의 근로자 12시간 이상",
      tasks: ["반기별 정기교육 실시(집체·온라인)", "신규 채용 시 채용 시 교육(8시간) 실시", "작업내용 변경 시 변경 교육"],
      deadline: "반기 말까지",
      performer: "안전보건관리책임자·관리감독자 또는 위탁기관",
      records: "교육 실시 기록 3년 보존",
      penalty: "미실시 시 근로자 1인당 과태료(500만원 이하 범위)",
      priority: "high", verify: true,
      notes: "지자체는 현업업무종사자에 한해 산안법 전면 적용. 교육시간·과태료액 확인 필요."
    },
    {
      id: "SAPA-022", domain: "재난·중대재해",
      law: "산업안전보건법",
      basis: "법 제16조·제32조, 시행규칙 제26조 별표4",
      lawUrl: L_OSH, kind: "education",
      title: "관리감독자 지정 및 정기교육",
      target: "현업업무종사자를 지휘·감독하는 부서가 있는 시설",
      applies: function (f) { return staffed(f); },
      grade: function (f) { return null; },
      cycleMonths: 12, anchor: "fixed", dueMonths: [12],
      cycleText: "연간 16시간 이상",
      tasks: ["관리감독자 지정(부서장·팀장 등)", "연 16시간 이상 정기교육 이수", "업무(작업 전 점검, 보호구 착용 지도 등) 수행"],
      deadline: "연말까지",
      performer: "관리감독자",
      records: "교육 이수 기록",
      penalty: "교육 미실시 과태료",
      priority: "high", verify: true, notes: ""
    },
    {
      id: "SAPA-023", domain: "재난·중대재해",
      law: "산업안전보건법",
      basis: "법 제63조·제64조",
      lawUrl: L_OSH, kind: "inspection",
      title: "도급인의 안전조치 (공사·용역 수급인 근로자)",
      target: "시설 내에서 도급 공사·용역(청소·경비·보수 등)을 수행하는 경우",
      applies: function (f) { return !!f; },
      grade: function (f) { return null; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "도급 작업 시",
      tasks: ["안전보건협의체 구성·운영(월 1회)", "작업장 순회점검(2일 1회 이상, 건설업 등)", "위험작업 사전 안전조치 확인", "합동 안전보건점검(분기 1회)"],
      deadline: "",
      performer: "발주부서(도급인)",
      records: "협의체 회의록·점검 기록",
      penalty: "안전조치 미이행으로 사망 시 7년 이하 징역 또는 1억원 이하 벌금(제167조)",
      priority: "critical", verify: true,
      notes: "지자체가 '건설공사발주자'에 해당하는 경우(제67조 등)와 도급인 판정 구분 필요."
    },

    /* ───────── 보건·환경: 실내공기질 ───────── */
    {
      id: "ENV-001", domain: "보건·환경",
      law: "실내공기질 관리법",
      basis: "법 제12조, 시행규칙 제11조",
      lawUrl: L_IAQ, kind: "measure",
      title: "실내공기질 유지기준 측정",
      target: "다중이용시설: 도서관·박물관·미술관 3천㎡, 의료기관 2천㎡, 노인요양 1천㎡, 어린이집·실내어린이놀이시설 430㎡, 지하 장례식장 1천㎡, 목욕장 1천㎡, 옥내전시 2천㎡, 업무시설 3천㎡, 실내공연장 1천석, 실내체육 관람석 1천석, 실내주차장 2천㎡ 등",
      applies: function (f) { return !!iaqSafe(f); },
      grade: function (f) { return iaqSafe(f); },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "연 1회 (PM10·PM2.5·CO2·폼알데하이드·총부유세균·CO)",
      tasks: ["측정대행업체 의뢰 또는 자가측정", "측정 결과 실내공기질 관리 종합정보망 입력", "기준 초과 시 환기설비 개선"],
      deadline: "",
      performer: "측정대행업자",
      records: "측정결과 10년 보존(종합정보망 입력 시 갈음)",
      penalty: "미측정 500만원 이하 과태료 / 유지기준 위반 1천만원 이하 과태료",
      priority: "high", verify: false,
      notes: "실내주차장(연면적 2천㎡ 이상, 기계식 제외)은 시설 데이터로 판정 불가하므로 담당자 확인. 어린이집 등은 측정항목 상이."
    },
    {
      id: "ENV-002", domain: "보건·환경",
      law: "실내공기질 관리법",
      basis: "법 제12조, 시행규칙 제11조",
      lawUrl: L_IAQ, kind: "measure",
      title: "실내공기질 권고기준 측정",
      target: "ENV-001 대상 다중이용시설",
      applies: function (f) { return !!iaqSafe(f); },
      grade: function (f) { return iaqSafe(f); },
      cycleMonths: 24, anchor: "free", dueMonths: [],
      cycleText: "2년 1회 (NO2·라돈·TVOC·곰팡이 등)",
      tasks: ["측정대행업체 의뢰", "결과 종합정보망 입력"],
      deadline: "",
      performer: "측정대행업자",
      records: "측정결과 10년 보존",
      penalty: "미측정 과태료",
      priority: "normal", verify: false, notes: ""
    },
    {
      id: "ENV-003", domain: "보건·환경",
      law: "실내공기질 관리법",
      basis: "법 제7조, 시행규칙 제5조",
      lawUrl: L_IAQ, kind: "education",
      title: "실내공기질 관리자 교육 (신규·보수)",
      target: "ENV-001 대상 다중이용시설의 소유자등이 지정한 관리자",
      applies: function (f) { return !!iaqSafe(f); },
      grade: function (f) { return null; },
      cycleMonths: 36, anchor: "free", dueMonths: [],
      cycleText: "신규: 관리자가 된 날부터 1년 이내 / 보수: 신규교육 후 3년마다",
      tasks: ["관리자 지정", "한국환경공단 등 교육기관 교육 이수", "담당자 변경 시 신규교육 재이수"],
      deadline: "",
      performer: "시설 관리자",
      records: "교육 이수증",
      penalty: "교육 미이수 500만원 이하 과태료",
      priority: "high", verify: false, notes: ""
    },

    /* ───────── 보건·환경: 수도법 저수조 ───────── */
    {
      id: "ENV-010", domain: "보건·환경",
      law: "수도법",
      basis: "법 제33조, 시행령 제50조, 시행규칙 제22조의3",
      lawUrl: L_WATER, kind: "maintenance",
      title: "저수조 청소",
      target: "저수조를 설치한 건축물 중 연면적 5천㎡ 이상(공동주택 등 별도 기준) 또는 다중이용시설 등 대통령령 대상. 용량 5㎥ 미만 저수조 제외",
      applies: function (f) { return !!f && N(f.waterTankM3) >= 5 && N(f.area) >= 5000; },
      grade: function (f) { return null; },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "반기 1회 이상",
      tasks: ["저수조청소업자에 의뢰", "청소 후 수질 확인(잔류염소 등)", "청소 결과 기록"],
      deadline: "",
      performer: "저수조청소업자",
      records: "청소·위생점검·수질검사 기록 2년 보관",
      penalty: "미청소 과태료(500만원 이하)",
      priority: "high", verify: true,
      notes: "시행령 제50조 대상 범위(연면적 5천㎡, 다중이용시설 포함 여부 등) 원문 확인 필요. 대상 외라도 위생관리 권장."
    },
    {
      id: "ENV-011", domain: "보건·환경",
      law: "수도법",
      basis: "법 제33조, 시행규칙 제22조의3 별표",
      lawUrl: L_WATER, kind: "inspection",
      title: "저수조 위생상태 점검",
      target: "ENV-010 대상 저수조",
      applies: function (f) { return !!f && N(f.waterTankM3) >= 5 && N(f.area) >= 5000; },
      grade: function (f) { return null; },
      cycleMonths: 1, anchor: "free", dueMonths: [],
      cycleText: "월 1회 이상",
      tasks: ["저수조 주위 청결·잠금·맨홀·월류관·통기관 방충망 점검", "점검표 작성"],
      deadline: "",
      performer: "시설 관리자",
      records: "위생점검 기록 2년 보관",
      penalty: "과태료",
      priority: "normal", verify: true, notes: ""
    },
    {
      id: "ENV-012", domain: "보건·환경",
      law: "수도법",
      basis: "법 제33조, 시행규칙 제22조의3",
      lawUrl: L_WATER, kind: "measure",
      title: "저수조 수질검사",
      target: "ENV-010 대상 저수조",
      applies: function (f) { return !!f && N(f.waterTankM3) >= 5 && N(f.area) >= 5000; },
      grade: function (f) { return null; },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "연 1회 이상 (탁도·pH·잔류염소·일반세균·총대장균군·대장균 등)",
      tasks: ["먹는물 수질검사기관에 의뢰", "기준 초과 시 청소·소독 등 조치"],
      deadline: "",
      performer: "먹는물 수질검사기관",
      records: "검사결과 2년 보관",
      penalty: "과태료",
      priority: "normal", verify: true,
      notes: "청소 시기에 맞춰 시료 채취(최종 청소 이후) 권장."
    },

    /* ───────── 보건·환경: 하수도법 ───────── */
    {
      id: "ENV-020", domain: "보건·환경",
      law: "하수도법",
      basis: "법 제39조, 시행령 제33조, 시행규칙 제33조",
      lawUrl: L_SEWER, kind: "maintenance",
      title: "정화조 내부청소",
      target: "정화조(개인하수처리시설)를 설치한 건축물",
      applies: function (f) { return !!f && S(f.sewage) === "정화조"; },
      grade: function (f) { return null; },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "연 1회 이상 (지자체 조례로 달리 정할 수 있음)",
      tasks: ["분뇨수집·운반업자에 청소 의뢰", "청소 확인서 수령·보관"],
      deadline: "",
      performer: "분뇨수집·운반업자",
      records: "청소 기록 3년 보존",
      penalty: "내부청소 미실시 과태료(100만원 이하)",
      priority: "high", verify: true,
      notes: "상주시 조례상 주기 확인."
    },
    {
      id: "ENV-021", domain: "보건·환경",
      law: "하수도법",
      basis: "법 제39조, 시행령 제33조, 시행규칙 제33조",
      lawUrl: L_SEWER, kind: "measure",
      title: "개인하수처리시설 방류수 수질 자가측정",
      target: "1일 처리용량 50㎥ 이상 오수처리시설 / 처리대상인원 1천명 이상 정화조",
      applies: function (f) {
        if (!f) return false;
        var c = N(f.sewageCapacity);
        return (S(f.sewage) === "오수처리시설" && c >= 50) || (S(f.sewage) === "정화조" && c >= 1000);
      },
      grade: function (f) {
        var c = N(f && f.sewageCapacity);
        if (S(f && f.sewage) === "오수처리시설") return c >= 200 ? "200㎥/일 이상(반기 1회)" : "50~200㎥/일(연 1회)";
        return c >= 2000 ? "2천명 이상(반기 1회)" : "1천~2천명(연 1회)";
      },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "50㎥/일(1천명) 이상 연 1회 / 200㎥/일(2천명) 이상 반기 1회",
      tasks: ["측정대행업자 또는 자가 측정(BOD·SS 등)", "방류수 수질기준 초과 시 개선"],
      deadline: "",
      performer: "측정대행업자",
      records: "측정결과 3년 보존",
      penalty: "미측정 과태료",
      priority: "high", verify: true,
      notes: "규모별 주기 상이(200㎥/일 이상은 cycleMonths 6 적용 필요). 수치 확인 필요."
    },
    {
      id: "ENV-022", domain: "보건·환경",
      law: "하수도법",
      basis: "법 제39조·제40조, 시행령 제33조",
      lawUrl: L_SEWER, kind: "appointment",
      title: "개인하수처리시설 기술관리인 임명",
      target: "1일 처리용량 50㎥ 이상 오수처리시설 / 처리대상인원 1천명 이상 정화조 (대행계약 시 갈음)",
      applies: function (f) {
        if (!f) return false;
        var c = N(f.sewageCapacity);
        return (S(f.sewage) === "오수처리시설" && c >= 50) || (S(f.sewage) === "정화조" && c >= 1000);
      },
      grade: function (f) { return null; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "설치·변경 시",
      tasks: ["기술관리인 임명 또는 관리대행업자와 계약", "운영일지 작성"],
      deadline: "",
      performer: "시설 관리부서",
      records: "운영일지 3년 보존",
      penalty: "미임명 과태료",
      priority: "high", verify: true, notes: ""
    },

    /* ───────── 보건·환경: 감염병예방법 소독 ───────── */
    {
      id: "ENV-030", domain: "보건·환경",
      law: "감염병의 예방 및 관리에 관한 법률",
      basis: "법 제51조제3항, 시행령 제24조, 시행규칙 제36조 별표7",
      lawUrl: L_INF, kind: "maintenance",
      title: "소독의무대상시설 정기 소독",
      target: "연면적 2천㎡ 이상 사무실용 건축물·복합건축물, 객석 300석 이상 공연장, 의료기관, 어린이집(정원 50명 이상), 노인복지시설 등",
      applies: function (f) {
        if (!f) return false;
        var a = N(f.area);
        return (S(f.buildingUse) === "업무시설" && a >= 2000) ||
          (has(f, ["공연장"]) && N(f.seats) >= 300) ||
          S(f.buildingUse) === "의료시설" || has(f, ["보건소", "병원", "의원"]) ||
          (has(f, ["어린이집"]) && a >= 430) || (!!f.elderly && has(f, ["요양"]));
      },
      grade: function (f) { return null; },
      cycleMonths: 3, anchor: "free", dueMonths: [],
      cycleText: "사무실 건축물: 4~9월 2개월 1회, 10~3월 3개월 1회 / 의료기관·어린이집 등: 4~9월 1개월 1회, 10~3월 2개월 1회",
      tasks: ["소독업 신고업체에 의뢰", "소독증명서 수령·비치"],
      deadline: "",
      performer: "소독업자",
      records: "소독증명서 1년(또는 2년) 보관",
      penalty: "미소독 과태료(100만원 이하)",
      priority: "high", verify: true,
      notes: "대상 범위·주기(별표7) 원문 확인 필요. 의료기관 범위(보건소 포함 여부)·어린이집 정원 기준은 데이터로 판정 불가, 근사 판정."
    },

    /* ───────── 보건·환경: 석면 ───────── */
    {
      id: "ENV-040", domain: "보건·환경",
      law: "석면안전관리법",
      basis: "법 제22조·제24조, 시행규칙 제26조~제28조",
      lawUrl: L_ASB, kind: "inspection",
      title: "석면건축물 안전관리인 지정 및 위해성 평가",
      target: "석면조사 결과 석면건축자재 사용 면적 50㎡ 이상 등 석면건축물",
      applies: function (f) { return !!f && !!f.asbestos; },
      grade: function (f) { return null; },
      cycleMonths: 6, anchor: "free", dueMonths: [],
      cycleText: "위해성 평가 6개월마다 / 안전관리인 교육: 지정 후 6개월 내 신규, 2년마다 보수",
      tasks: ["석면건축물 안전관리인 지정·신고", "6개월마다 건축자재 손상상태·비산 가능성 평가", "석면지도 비치, 해체·보수 시 신고", "안전관리인 교육 이수"],
      deadline: "",
      performer: "석면건축물 안전관리인",
      records: "평가 결과 기록 보존",
      penalty: "안전관리인 미지정·평가 미실시 과태료(200만원 이하)",
      priority: "high", verify: true,
      notes: "구조·건축 분야 규칙과 중복 여부 엔진 측 확인. 주기·교육시간 확인 필요."
    }
  );
})();
