/* 건축·구조안전 / 특수시설 / 재난 법정업무 규칙 (law-structure)
 * 기준일: 2026-11 현행 법령. 확인 못 한 수치는 verify:true.
 * 대상: 상주시 소유 공공건축물 (관리주체 = 상주시)
 */
(function () {
  "use strict";

  // ---------- 방어적 헬퍼 ----------
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function str(v) { return (typeof v === "string") ? v : ""; }
  function has(v, kw) { return str(v).indexOf(kw) !== -1; }
  function ageYears(f) {
    try {
      if (!f || !f.approvalDate) return 0;
      var d = new Date(f.approvalDate);
      if (isNaN(d.getTime())) return 0;
      return (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    } catch (e) { return 0; }
  }
  // 시설물안전법 2종 '다중이용 용도' (시행령 별표1 건축물 2종 나목 취지)
  var MULTI_USES = ["문화및집회시설", "종교시설", "판매시설", "운수시설", "의료시설",
    "노유자시설", "수련시설", "운동시설", "숙박시설", "관광휴게시설"];
  function isMultiUse(f) {
    var u = str(f && f.buildingUse).replace(/\s/g, "");
    for (var i = 0; i < MULTI_USES.length; i++) if (u === MULTI_USES[i]) return true;
    return false;
  }
  function isPerformance(f) {
    return num(f && f.seats) > 0 || has(f && f.subUse, "공연장") || has(f && f.subUse, "집회장");
  }
  // 시설물안전법 종별 판정: 1 / 2 / 3(지정 대상 후보) / 0
  function fmsClass(f) {
    try {
      if (!f) return 0;
      var area = num(f.area), fl = num(f.floorsAbove), use = str(f.buildingUse);
      if (fl >= 21 || area >= 50000) return 1;
      if (fl >= 16 || area >= 30000 || (area >= 5000 && isMultiUse(f))) return 2;
      if (has(use, "동물및식물") || has(use, "자원순환")) return 0;
      if (ageYears(f) >= 15) {
        if (fl >= 11 || area >= 5000) return 3;
        if (area >= 1000 && isMultiUse(f)) return 3;
        if (area >= 1000 && has(use, "업무시설")) return 3;          // 공공업무시설(공공청사)
        if (area >= 500 && isPerformance(f)) return 3;               // 공연장·집회장
      }
      return 0;
    } catch (e) { return 0; }
  }
  function fmsLabel(f) {
    var c = fmsClass(f);
    if (c === 1) return "시설물안전법 1종";
    if (c === 2) return "시설물안전법 2종";
    if (c === 3) return "시설물안전법 3종 지정 대상 후보";
    return null;
  }
  // 건축법 시행령 제2조제17호 다중이용 건축물(근사)
  function isDaJung(f) {
    try {
      var area = num(f.area), fl = num(f.floorsAbove), use = str(f.buildingUse);
      if (fl >= 16) return true;
      if (area >= 5000 && (use === "문화및집회시설" || use === "종교시설" || use === "판매시설" ||
        use === "운수시설" || use === "의료시설" || use === "숙박시설")) return true;
      return false;
    } catch (e) { return false; }
  }
  function isHeritage(f) { return !!(f && f.heritage); }

  var L = {
    fms: "https://www.law.go.kr/법령/시설물의안전및유지관리에관한특별법",
    bma: "https://www.law.go.kr/법령/건축물관리법",
    dis: "https://www.law.go.kr/법령/재난및안전관리기본법",
    eq: "https://www.law.go.kr/법령/지진ㆍ화산재해대책법",
    asb: "https://www.law.go.kr/법령/석면안전관리법",
    perf: "https://www.law.go.kr/법령/공연법",
    sport: "https://www.law.go.kr/법령/체육시설의설치ㆍ이용에관한법률",
    play: "https://www.law.go.kr/법령/어린이놀이시설안전관리법",
    bf: "https://www.law.go.kr/법령/장애인ㆍ노인ㆍ임산부등의편의증진보장에관한법률",
    her: "https://www.law.go.kr/법령/문화유산의보존및활용에관한법률"
  };
  var NOTE_3 = "3종 시설물은 법상 자동 해당이 아니라 시장·군수(상주시장)가 법 제8조에 따라 지정·고시하는 시설물이다. 본 앱은 시행령 별표1 기준(준공 후 15년 경과 + 규모·용도)으로 '지정 대상 후보'를 안내하므로, 실제 지정 고시 여부를 시설물통합정보관리시스템(FMS)·안전총괄부서에서 확인할 것.";

  (window.SJ_RULES = window.SJ_RULES || []).push(
    // ===================== 시설물안전법 =====================
    {
      id: "BLD-001", domain: "건축·구조안전",
      law: "시설물의 안전 및 유지관리에 관한 특별법",
      basis: "법 제7조·제8조, 시행령 제4조 별표1, 법 제55조(시설물통합정보관리체계)",
      lawUrl: L.fms, kind: "report",
      title: "시설물 종별 확인·3종 지정 및 FMS 등록",
      target: "1종(21층 이상 또는 연면적 5만㎡ 이상), 2종(16층 이상, 연면적 3만㎡ 이상, 연면적 5천㎡ 이상 다중이용 용도), 3종 지정 대상 후보(준공 후 15년 경과 + 11층 이상·연면적 5천㎡ 이상, 연면적 1천㎡ 이상 다중이용 용도·공공업무시설, 연면적 500㎡ 이상 공연장·집회장 등)",
      applies: function (f) { return fmsClass(f) > 0; },
      grade: function (f) { return fmsLabel(f); },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "준공·사용승인 또는 3종 지정·고시 시, 변경 발생 시",
      tasks: [
        "건물의 시설물안전법 종별(1·2종 해당 / 3종 지정 여부) 확인",
        "3종 후보인 경우 지정·고시 여부를 안전총괄부서에 확인(미지정이면 지정 검토 요청)",
        "시설물관리대장·설계도서 등을 시설물통합정보관리시스템(FMS)에 등록",
        "보수·보강, 관리주체 변경 등 변동사항 FMS 갱신"
      ],
      deadline: "3종 지정·고시된 날부터 1개월 이내 설계도서·시설물관리대장 제출(FMS 입력)",
      performer: "관리주체(시설 관리부서)",
      records: "시설물관리대장, 준공도서 영구 보존 권장",
      penalty: "자료 미제출·미입력 시 과태료",
      priority: "high", verify: true,
      notes: NOTE_3 + " 2종 다중이용 용도 판정은 용도별 연면적 합계 기준이므로 복합용도 건물은 대장으로 재확인. 동물및식물관련시설·자원순환관련시설은 3종 대상 제외."
    },
    {
      id: "BLD-002", domain: "건축·구조안전",
      law: "시설물의 안전 및 유지관리에 관한 특별법",
      basis: "법 제11조, 시행령 제8조 별표3",
      lawUrl: L.fms, kind: "inspection",
      title: "정기안전점검",
      target: "1·2·3종 시설물(3종은 지정·고시된 경우)",
      applies: function (f) { return fmsClass(f) > 0; },
      grade: function (f) { return fmsLabel(f); },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "안전등급 A·B·C: 반기 1회 이상 / D·E: 1년에 3회 이상(해빙기·우기·동절기)",
      tasks: [
        "정기안전점검 실시(외관조사 위주, 균열·누수·처짐·부식 등 확인)",
        "점검 결과 보고서를 FMS에 입력",
        "결함 발견 시 정밀안전점검 또는 정밀안전진단 실시 여부 검토"
      ],
      deadline: "점검 완료일부터 30일 이내 결과보고서 FMS 제출",
      performer: "책임기술자(안전점검 교육 이수자) — 관리주체 직접 또는 안전진단전문기관 위탁",
      records: "점검 결과보고서 및 기록 보존(FMS)",
      penalty: "미실시 시 1년 이하 징역 또는 1천만원 이하 벌금, 결과 미제출 과태료",
      priority: "critical", verify: true,
      notes: NOTE_3 + " 안전등급이 D·E이면 연 3회(2·6·11월경) 일정으로 운영할 것."
    },
    {
      id: "BLD-003", domain: "건축·구조안전",
      law: "시설물의 안전 및 유지관리에 관한 특별법",
      basis: "법 제11조, 시행령 제8조 별표3",
      lawUrl: L.fms, kind: "inspection",
      title: "정밀안전점검",
      target: "1종·2종 시설물(3종은 정기안전점검 결과 필요 시)",
      applies: function (f) { var c = fmsClass(f); return c === 1 || c === 2; },
      grade: function (f) {
        var g = str(f && f.safetyGrade);
        var cyc = (g === "A") ? "4년" : (g === "D" || g === "E") ? "2년" : "3년";
        return (fmsLabel(f) || "") + " · 정밀점검 " + cyc + "마다";
      },
      cycleMonths: 36, anchor: "approval", dueMonths: [],
      cycleText: "건축물: A등급 4년에 1회, B·C등급 3년에 1회, D·E등급 2년에 1회 이상",
      tasks: [
        "안전진단전문기관 등과 용역 계약(예산 반영)",
        "정밀안전점검 실시 및 안전등급 지정",
        "결과보고서 FMS 제출, 보수·보강 계획 수립"
      ],
      deadline: "완료일부터 30일 이내 결과보고서 제출",
      performer: "안전진단전문기관 또는 안전점검전문기관(책임기술자)",
      records: "결과보고서 FMS 보존",
      penalty: "미실시 시 1년 이하 징역 또는 1천만원 이하 벌금",
      priority: "critical", verify: true,
      notes: "앱의 기본 주기는 B·C등급(36개월). 건물 안전등급(safetyGrade)에 따라 A=48, D·E=24개월로 조정해 관리. 최초 정밀안전점검은 준공·사용승인 후 일정 기간 내 실시(별표3)."
    },
    {
      id: "BLD-004", domain: "건축·구조안전",
      law: "시설물의 안전 및 유지관리에 관한 특별법",
      basis: "법 제12조, 시행령 제10조 별표3",
      lawUrl: L.fms, kind: "inspection",
      title: "정밀안전진단(1종)",
      target: "1종 시설물(21층 이상 또는 연면적 5만㎡ 이상 건축물)",
      applies: function (f) { return fmsClass(f) === 1; },
      grade: function (f) { return fmsLabel(f); },
      cycleMonths: 60, anchor: "approval", dueMonths: [],
      cycleText: "최초: 준공·사용승인 후 10년 경과 시 1년 이내 / 이후 A등급 6년, B·C등급 5년, D·E등급 4년에 1회 이상",
      tasks: ["정밀안전진단 용역 발주", "진단 결과 보수·보강 계획 수립", "결과보고서 FMS 제출"],
      deadline: "완료일부터 30일 이내 결과보고서 제출",
      performer: "안전진단전문기관 또는 국토안전관리원",
      records: "결과보고서 FMS 보존",
      penalty: "미실시 시 2년 이하 징역 또는 2천만원 이하 벌금",
      priority: "critical", verify: true,
      notes: "상주시 공공건축물 중 1종 해당 건물은 드물 것으로 예상. 2종도 정밀안전점검·긴급점검 결과 필요 시 정밀안전진단 실시."
    },
    {
      id: "BLD-005", domain: "건축·구조안전",
      law: "시설물의 안전 및 유지관리에 관한 특별법",
      basis: "법 제6조, 시행령 제5조",
      lawUrl: L.fms, kind: "plan",
      title: "시설물관리계획 수립·보고",
      target: "1·2·3종 시설물 관리주체",
      applies: function (f) { return fmsClass(f) > 0; },
      grade: function (f) { return fmsLabel(f); },
      cycleMonths: 12, anchor: "fixed", dueMonths: [2],
      cycleText: "매년 수립(연초) — 공공관리주체는 소관 기관에 보고",
      tasks: [
        "연간 점검·진단·보수보강 일정과 예산을 담은 시설물관리계획 수립",
        "FMS 입력 및 보고",
        "계획에 따른 유지관리 예산 반영"
      ],
      deadline: "매년 2월 15일경까지 보고(시행령 확인 필요)",
      performer: "관리주체",
      records: "시설물관리계획서 보존",
      penalty: "미수립·미보고 시 과태료",
      priority: "high", verify: true,
      notes: NOTE_3 + " 3종 시설물 관리계획은 시장·군수·구청장에게 제출."
    },
    {
      id: "BLD-006", domain: "건축·구조안전",
      law: "시설물의 안전 및 유지관리에 관한 특별법",
      basis: "법 제13조(긴급안전점검), 법 제22조·제23조(긴급안전조치·사용제한), 법 제24조(중대한 결함 보고)",
      lawUrl: L.fms, kind: "report",
      title: "긴급안전점검·중대결함 보고 및 안전조치",
      target: "1·2·3종 시설물 — 재해·사고 우려, D·E등급, 중대결함 발견 시",
      applies: function (f) { return fmsClass(f) > 0; },
      grade: function (f) { var g = str(f && f.safetyGrade); return (g === "D" || g === "E") ? g + "등급 — 사용제한·보수보강 우선" : fmsLabel(f); },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "사유 발생 시(지진·호우 후, 중대결함 발견, D·E등급 판정)",
      tasks: [
        "재해·이상징후 발생 시 긴급안전점검 실시",
        "중대한 결함 발견 시 지자체장·국토부 통보 및 보수·보강",
        "D·E등급 시 사용제한·사용금지·철거·주민대피 등 안전조치",
        "보수·보강 완료 후 결과 보고"
      ],
      deadline: "중대결함 통보 후 2년 이내 보수·보강 착수 (확인 필요)",
      performer: "관리주체, 안전진단전문기관",
      records: "조치 결과 FMS 입력",
      penalty: "안전조치 불이행 시 벌칙",
      priority: "critical", verify: true,
      notes: "기한·벌칙 수치는 원문 확인 필요."
    },

    // ===================== 건축물관리법 =====================
    {
      id: "BLD-007", domain: "건축·구조안전",
      law: "건축물관리법",
      basis: "법 제13조, 시행령 제8조, 시행규칙 제5조",
      lawUrl: L.bma, kind: "inspection",
      title: "건축물 정기점검",
      target: "다중이용 건축물(16층 이상 또는 문화및집회·종교·판매·운수·의료·숙박 바닥면적 5천㎡ 이상), 연면적 3천㎡ 이상 집합건축물, 조례로 정한 다중이용업소 건축물, 준다중이용 중 특수구조건축물 — 시설물안전법 1·2종(및 지정된 3종) 제외",
      applies: function (f) {
        var c = fmsClass(f);
        if (c === 1 || c === 2) return false;
        return isDaJung(f) || !!(f && f.multiUseBiz);
      },
      grade: function (f) { return isDaJung(f) ? "다중이용 건축물" : "다중이용업소 입점(조례 대상 여부 확인)"; },
      cycleMonths: 36, anchor: "approval", dueMonths: [],
      cycleText: "사용승인일부터 일정 기간 내 최초 실시 후 3년마다",
      tasks: [
        "건축물관리점검기관(시·군·구청장이 지정한 명부)에서 점검기관 선정 — 관리자가 직접 선정 불가 구조인지 확인",
        "대지·높이·형태, 구조안전, 화재안전, 건축설비, 에너지 및 친환경 관리, 범죄예방, 건축물관리계획 수립·이행 여부 점검",
        "점검 결과를 세움터(건축물 생애이력 관리시스템)에 보고"
      ],
      deadline: "점검 완료 후 30일 이내 결과 보고(관리자→시장), 보수·보강 필요 시 조치",
      performer: "건축물관리점검기관(건축사사무소·안전진단전문기관 등)",
      records: "점검 결과 보고서 보존(건축물 생애이력 정보체계)",
      penalty: "미실시 시 과태료(시행령 별표5)",
      priority: "high", verify: true,
      notes: "최초 점검시기: 개정 전 '사용승인 후 10년 경과'였으나, 서울시 안내 등에서 '사용승인일부터 5년 이내 최초, 이후 3년마다'로 안내됨 — 현행 원문 확인 필요. 구조안전 항목은 사용승인 후 20년 경과 후 처음 실시하는 정기점검부터 해당(시행령 제8조). 3종 시설물로 지정되면 시설물안전법 점검으로 대체."
    },
    {
      id: "BLD-008", domain: "건축·구조안전",
      law: "건축물관리법",
      basis: "법 제14조(긴급점검), 시행령 제9조 / 법 제15조(소규모 노후 건축물등 점검), 시행령 제10조",
      lawUrl: L.bma, kind: "inspection",
      title: "긴급점검·소규모 노후건축물 점검 대응",
      target: "모든 건축물 — 붕괴·전도 위험, 재해 우려 시 시장 명령",
      applies: function (f) { return !!f; },
      grade: function (f) { return ageYears(f) >= 30 ? "노후 건축물(사용승인 30년 이상)" : null; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "시장·군수·구청장의 긴급점검 명령 또는 노후건축물 점검 시",
      tasks: [
        "긴급점검 명령 수령 시 즉시 점검기관 지정·점검 실시",
        "점검 결과 보수·보강·사용제한 등 조치",
        "보수·보강 조치계획 수립 보고"
      ],
      deadline: "점검결과 보고받은 날부터 60일 이내 보수·보강 등 조치계획 수립",
      performer: "건축물관리점검기관",
      records: "점검·조치 결과 보존",
      penalty: "명령 불이행 시 과태료",
      priority: "normal", verify: true,
      notes: "소규모 노후건축물 점검은 지자체가 실시하는 제도로, 시설 담당자는 협조·조치 대상."
    },
    {
      id: "BLD-009", domain: "건축·구조안전",
      law: "건축물관리법",
      basis: "법 제30조(건축물 해체의 허가·신고), 법 제32조(해체공사 감리), 법 제33조(해체공사 완료신고)",
      lawUrl: L.bma, kind: "report",
      title: "건축물 해체 허가·신고 및 감리",
      target: "건축물 일부·전부 해체(철거) 시",
      applies: function (f) { return !!f; },
      grade: function (f) { return null; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "해체(철거) 계획 시",
      tasks: [
        "해체계획서 작성(규모에 따라 건축사·기술사 검토)",
        "해체 허가 또는 신고(소규모)",
        "허가 대상은 해체공사감리자 지정",
        "해체 완료 후 완료신고 및 건축물대장 말소",
        "석면 함유 시 석면조사·해체제거 절차 선행"
      ],
      deadline: "해체 착수 전 허가·신고, 완료 후 30일 이내 완료신고",
      performer: "관리자, 해체공사 시공자·감리자",
      records: "해체계획서·감리보고서",
      penalty: "무허가 해체 시 형사처벌",
      priority: "high", verify: true,
      notes: "광주 학동 붕괴사고(2021) 이후 해체 허가·감리 강화."
    },
    {
      id: "BLD-010", domain: "건축·구조안전",
      law: "건축물관리법",
      basis: "법 제27조(화재안전성능보강), 시행령 제19조",
      lawUrl: L.bma, kind: "maintenance",
      title: "피난약자이용시설 화재안전성능보강",
      target: "기존 3층 이상 의료시설·노유자시설(지역아동센터·노인복지시설 등)·다중이용업소 건축물로서 가연성 외장재·스프링클러 미설치 등",
      applies: function (f) {
        if (!f) return false;
        var vul = !!f.elderly || !!f.childcare || str(f.buildingUse) === "의료시설" || str(f.buildingUse) === "노유자시설";
        return vul && num(f.floorsAbove) >= 3 && !f.sprinkler;
      },
      grade: function (f) { return "피난약자이용시설(보강 대상 여부 확인)"; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "보강 대상 확인 시(법정 기한 경과 — 미이행 여부 확인)",
      tasks: ["보강 대상 여부 확인(외장재·스프링클러·피난설비)", "미보강 시 보강계획 수립·시행"],
      deadline: "법정 보강기한(2022년 말, 이후 연장) 경과 — 미이행 시 즉시 조치",
      performer: "관리자",
      records: "보강 완료 확인서",
      penalty: "미보강 시 과태료",
      priority: "normal", verify: true,
      notes: "보강기한·대상 범위는 개정 경과가 있어 원문 확인 필요."
    },
    {
      id: "BLD-011", domain: "건축·구조안전",
      law: "건축물관리법",
      basis: "법 제11조(건축물관리계획), 법 제12조",
      lawUrl: L.bma, kind: "plan",
      title: "건축물관리계획 이행·조정",
      target: "건축법 제22조 사용승인을 받은 건축물(2020.5.1 이후 사용승인 신청분은 관리계획 제출)",
      applies: function (f) { return !!f; },
      grade: function (f) { return null; },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "연중(장기수선 일정 반영), 대수선·리모델링 시 조정",
      tasks: [
        "건축물관리계획(장기수선 계획 포함) 보유 여부 확인",
        "주요 부재·설비 수선주기에 맞춘 예산 반영",
        "대수선·리모델링 시 계획 조정"
      ],
      deadline: "",
      performer: "관리자",
      records: "건축물관리계획서, 수선 이력",
      penalty: "",
      priority: "normal", verify: true,
      notes: "2020.5.1 법 시행 전 사용승인 건물은 법정 관리계획이 없을 수 있음 — 자체 장기수선계획으로 관리 권장."
    },

    // ===================== 지진·화산재해대책법 =====================
    {
      id: "BLD-012", domain: "건축·구조안전",
      law: "지진·화산재해대책법",
      basis: "법 제14조(내진설계기준), 법 제16조의2(기존 시설물의 내진성능 평가), 법 제16조의3(내진보강 기본계획·시행계획)",
      lawUrl: L.eq, kind: "plan",
      title: "공공건축물 내진성능평가·보강",
      target: "내진설계 대상 공공건축물(현행: 2층 이상 또는 연면적 200㎡ 이상 등) 중 내진성능 미확보 또는 미평가 건물",
      applies: function (f) { return !!f && (num(f.floorsAbove) >= 2 || num(f.area) >= 200); },
      grade: function (f) {
        try { var y = new Date(f.approvalDate).getFullYear(); return (y && y < 2017) ? "내진성능 확인 필요(2017년 이전 사용승인)" : null; } catch (e) { return null; }
      },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "매년(행정안전부 기존 공공시설물 내진보강 시행계획 단계에 맞춰)",
      tasks: [
        "내진성능 확보 여부(내진설계 적용·성능평가 결과) 확인",
        "미평가 건물 내진성능평가 실시",
        "성능 미확보 시 내진보강 설계·공사 및 예산 반영",
        "내진보강 실적을 시설물 내진관리시스템 등에 보고"
      ],
      deadline: "행안부 기본계획(5년 단위) 목표연도까지 보강",
      performer: "관리주체(내진성능평가는 전문기관)",
      records: "내진성능평가 보고서",
      penalty: "",
      priority: "normal", verify: true,
      notes: "건축 시기에 따른 내진설계 기준(1988·2005·2015·2017 개정) 상이. 경북은 포항·경주 지진 이후 보강 우선 지역."
    },

    // ===================== 석면안전관리법 =====================
    {
      id: "BLD-013", domain: "건축·구조안전",
      law: "석면안전관리법",
      basis: "법 제21조(건축물석면조사), 시행령 제32조",
      lawUrl: L.asb, kind: "inspection",
      title: "건축물석면조사(공공건축물)",
      target: "공공건축물 연면적 500㎡ 이상 및 증축·개축·해체 시",
      applies: function (f) { return !!f && num(f.area) >= 500; },
      grade: function (f) { return f && f.asbestos ? "석면건축물" : null; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "미조사 건물 조사, 증축·리모델링·해체 전",
      tasks: ["석면조사 실시 여부 확인(미실시 시 지정 석면조사기관 의뢰)", "조사 결과 석면정보시스템 등록", "공사 전 석면조사 결과 확인"],
      deadline: "조사 완료 후 결과 제출",
      performer: "지정 석면조사기관",
      records: "석면조사 결과서 보존",
      penalty: "미실시 시 과태료",
      priority: "high", verify: true,
      notes: "기존 공공건축물 석면조사 기한은 2012년 경과. 2009년 이후 착공 건물은 석면 사용 금지로 비해당이 일반적."
    },
    {
      id: "BLD-014", domain: "건축·구조안전",
      law: "석면안전관리법",
      basis: "법 제22조(석면건축물 관리), 법 제23조, 시행령 제34조",
      lawUrl: L.asb, kind: "appointment",
      title: "석면안전관리인 지정·신고",
      target: "석면건축물(석면건축자재 사용면적 합 50㎡ 이상 또는 분무재·내화피복재 사용)",
      applies: function (f) { return !!(f && f.asbestos); },
      grade: function (f) { return "석면건축물"; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "석면건축물 해당 시, 관리인 변경 시",
      tasks: ["석면안전관리인 지정(소속 직원)", "지정·변경 사항 석면정보시스템 등록/신고"],
      deadline: "지정·변경 후 신고(기한 원문 확인)",
      performer: "소유자(관리부서장)",
      records: "지정 내역",
      penalty: "미지정 시 과태료",
      priority: "high", verify: true,
      notes: ""
    },
    {
      id: "BLD-015", domain: "건축·구조안전",
      law: "석면안전관리법",
      basis: "법 제23조, 시행규칙(석면안전관리인 교육)",
      lawUrl: L.asb, kind: "education",
      title: "석면안전관리인 교육",
      target: "석면건축물 석면안전관리인",
      applies: function (f) { return !!(f && f.asbestos); },
      grade: function (f) { return null; },
      cycleMonths: 24, anchor: "free", dueMonths: [],
      cycleText: "지정 후 6개월 이내 최초 교육, 이후 2년마다 보수교육(각 4시간)",
      tasks: ["신규 지정 시 최초교육 이수", "2년마다 보수교육 이수", "이수증 보관"],
      deadline: "",
      performer: "석면안전관리인(한국환경공단 등 교육기관)",
      records: "교육이수증",
      penalty: "미이수 시 과태료",
      priority: "normal", verify: true,
      notes: ""
    },
    {
      id: "BLD-016", domain: "건축·구조안전",
      law: "석면안전관리법",
      basis: "법 제22조, 시행규칙 제27조(석면건축물 위해성 평가)",
      lawUrl: L.asb, kind: "inspection",
      title: "석면건축물 위해성 평가·석면지도 관리",
      target: "석면건축물",
      applies: function (f) { return !!(f && f.asbestos); },
      grade: function (f) { return "석면건축물"; },
      cycleMonths: 6, anchor: "fixed", dueMonths: [6, 12],
      cycleText: "6개월마다 위해성 평가",
      tasks: ["석면건축자재 손상·비산 상태 위해성 평가", "석면지도 작성·비치 및 갱신", "위해성 높음 시 보수·제거 조치", "출입자 대상 석면 위치 안내"],
      deadline: "",
      performer: "석면안전관리인",
      records: "위해성평가 결과 기록·보존",
      penalty: "미실시 시 과태료",
      priority: "high", verify: false,
      notes: ""
    },

    // ===================== 장애인등편의법 =====================
    {
      id: "BLD-017", domain: "건축·구조안전",
      law: "장애인·노인·임산부 등의 편의증진 보장에 관한 법률",
      basis: "법 제7조·제8조, 시행령 제3조 별표1·별표2, 법 제10조의2(BF인증)",
      lawUrl: L.bf, kind: "maintenance",
      title: "편의시설 설치·유지관리 및 BF인증",
      target: "공공건물·공중이용시설(대상시설) — 국가·지자체 신축·증축·개축·재축 건물은 BF(장애물 없는 생활환경) 인증 의무",
      applies: function (f) { return !!f; },
      grade: function (f) { return null; },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "상시 유지관리, 연 1회 자체 점검 권장, 신축·증축 시 BF인증",
      tasks: [
        "주출입구 접근로·경사로·장애인화장실·승강기·점자블록·장애인주차구역 기능 점검",
        "훼손·적합성 미흡 사항 보수",
        "신축·증축 등 사업 시 BF 예비인증·본인증 및 유효기간(10년) 관리"
      ],
      deadline: "",
      performer: "시설주관리자",
      records: "편의시설 점검 기록",
      penalty: "시정명령 불이행 시 이행강제금, BF인증 미취득 시 과태료",
      priority: "normal", verify: true,
      notes: "보건복지부 편의시설 실태조사(5년 주기) 대응 자료 준비."
    },

    // ===================== 국가유산 =====================
    {
      id: "BLD-018", domain: "건축·구조안전",
      law: "문화유산의 보존 및 활용에 관한 법률",
      basis: "법 제44조(정기조사), 법 제34조(관리단체)",
      lawUrl: L.her, kind: "inspection",
      title: "지정문화유산 정기조사·관리",
      target: "국가지정·시도지정·등록 문화유산 건축물",
      applies: function (f) { return isHeritage(f); },
      grade: function (f) { return str(f && f.heritage) + " 문화유산"; },
      cycleMonths: 60, anchor: "free", dueMonths: [],
      cycleText: "국가지정문화유산 5년마다 정기조사(시도지정은 조례)",
      tasks: ["정기조사 협조·결과에 따른 보수정비", "일상 관리·순찰·방재 점검", "현상변경·수리 시 허가 및 문화유산수리업자 시공"],
      deadline: "",
      performer: "관리단체(상주시), 국가유산청",
      records: "관리 기록, 수리 보고서",
      penalty: "무허가 현상변경 시 형사처벌",
      priority: "normal", verify: true,
      notes: "2024.5 국가유산기본법 시행으로 '문화재'→'국가유산' 명칭 변경."
    },

    // ===================== 재난안전법 =====================
    {
      id: "BLD-019", domain: "재난·중대재해",
      law: "재난 및 안전관리 기본법",
      basis: "법 제34조의6(다중이용시설 등의 위기상황 매뉴얼), 시행령 제43조의9",
      lawUrl: L.dis, kind: "plan",
      title: "다중이용시설 위기상황 매뉴얼 작성·훈련",
      target: "다중이용 건축물(16층 이상 또는 문화및집회 등 5천㎡ 이상) 등 대통령령 대상",
      applies: function (f) { return !!f && isDaJung(f); },
      grade: function (f) { return "다중이용 건축물"; },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "매뉴얼 작성·운용, 연 1회 이상 훈련",
      tasks: ["위기상황 매뉴얼 작성·비치", "매뉴얼 기반 훈련 실시", "점검·개선"],
      deadline: "",
      performer: "관리주체",
      records: "매뉴얼, 훈련 기록",
      penalty: "미작성 시 과태료",
      priority: "high", verify: true,
      notes: ""
    },
    {
      id: "BLD-020", domain: "재난·중대재해",
      law: "재난 및 안전관리 기본법",
      basis: "법 제27조(특정관리대상지역 지정·관리), 시행령 제31조~제34조",
      lawUrl: L.dis, kind: "inspection",
      title: "특정관리대상지역 안전점검(지정 시)",
      target: "재난 발생 위험이 높아 시장이 특정관리대상지역으로 지정한 경우",
      applies: function (f) { var g = str(f && f.safetyGrade); return g === "D" || g === "E"; },
      grade: function (f) { return "지정 여부 확인"; },
      cycleMonths: 6, anchor: "event", dueMonths: [],
      cycleText: "안전등급 A·B·C 반기 1회, D 월 1회, E 월 2회 이상 정기안전점검",
      tasks: ["지정 여부 재난관리부서 확인", "지정 시 등급별 정기점검·국가재난관리정보시스템 입력"],
      deadline: "",
      performer: "재난관리책임기관(상주시)",
      records: "점검 기록",
      penalty: "",
      priority: "normal", verify: true,
      notes: "2020년 개정으로 '특정관리대상시설등'이 '특정관리대상지역'으로 개편. 시설물안전법·건축물관리법 관리 건물은 대개 제외되므로, D·E등급 건물에 한해 지정 여부 확인용으로 표시."
    },

    // ===================== 공연법 =====================
    {
      id: "SPC-001", domain: "특수시설",
      law: "공연법",
      basis: "법 제9조(공연장의 등록), 시행령 제8조",
      lawUrl: L.perf, kind: "report",
      title: "공연장 등록·변경등록",
      target: "공연장(객석 등 규모가 시행령 기준 이상)",
      applies: function (f) { return !!f && isPerformance(f); },
      grade: function (f) { var s = num(f && f.seats); return s ? "객석 " + s + "석" : "공연장"; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "개관 전 등록, 변경 시 변경등록",
      tasks: ["등록 전 무대시설 안전검사", "공연장 등록(시장)", "객석·무대시설 변경 시 변경등록"],
      deadline: "",
      performer: "공연장운영자",
      records: "등록증",
      penalty: "미등록 운영 시 벌칙",
      priority: "high", verify: true,
      notes: ""
    },
    {
      id: "SPC-002", domain: "특수시설",
      law: "공연법",
      basis: "법 제11조(재해예방조치), 시행령 제9조",
      lawUrl: L.perf, kind: "plan",
      title: "공연장 재해대처계획 수립·신고",
      target: "등록 공연장 운영자",
      applies: function (f) { return !!f && isPerformance(f); },
      grade: function (f) { return num(f && f.seats) >= 500 ? "500석 이상(안전관리조직·안전관리비 포함)" : "500석 미만"; },
      cycleMonths: 12, anchor: "fixed", dueMonths: [1],
      cycleText: "매년 수립하여 관할 시장에게 신고",
      tasks: ["재해대처계획 수립(시설 점검, 비상대피, 안전관리조직, 안전교육 계획)", "시장에게 신고", "종사자 대상 재해대처 교육·훈련", "관람객 대상 비상대피 안내"],
      deadline: "매년 신고(구체 기한 원문 확인)",
      performer: "공연장운영자",
      records: "재해대처계획서",
      penalty: "재해예방조치 미이행 시 과태료",
      priority: "high", verify: true,
      notes: ""
    },
    {
      id: "SPC-003", domain: "특수시설",
      law: "공연법",
      basis: "법 제12조(무대시설 안전진단 등), 시행령 제10조",
      lawUrl: L.perf, kind: "inspection",
      title: "무대시설 정기 안전검사",
      target: "등록 공연장의 무대시설",
      applies: function (f) { return !!f && isPerformance(f); },
      grade: function (f) { return null; },
      cycleMonths: 36, anchor: "approval", dueMonths: [],
      cycleText: "3년마다 정기 안전검사",
      tasks: ["안전검사기관(공연장안전지원센터 등)에 검사 신청", "지적사항 보수", "자체 안전점검 결과 보관"],
      deadline: "",
      performer: "문체부 지정 안전검사기관",
      records: "검사 결과 3년 보관",
      penalty: "미실시 시 과태료",
      priority: "high", verify: true,
      notes: "주기 기준일은 등록일 기준일 수 있음."
    },
    {
      id: "SPC-004", domain: "특수시설",
      law: "공연법",
      basis: "법 제12조, 시행령 제10조",
      lawUrl: L.perf, kind: "inspection",
      title: "무대시설 정밀안전진단",
      target: "등록 공연장(규모 기준 원문 확인)",
      applies: function (f) { return !!f && isPerformance(f); },
      grade: function (f) { return null; },
      cycleMonths: 108, anchor: "approval", dueMonths: [],
      cycleText: "9년마다 정밀안전진단",
      tasks: ["정밀안전진단 용역 예산 반영·발주", "진단 결과 보수·교체"],
      deadline: "",
      performer: "안전진단기관",
      records: "진단 결과서",
      penalty: "미실시 시 과태료",
      priority: "high", verify: true,
      notes: "2015년 시행령 개정으로 9년 주기 도입(문체부 안내서)."
    },
    {
      id: "SPC-005", domain: "특수시설",
      law: "공연법",
      basis: "법 제11조, 시행령 제9조(안전관리조직), 법 제12조의2(무대예술전문인 배치)",
      lawUrl: L.perf, kind: "appointment",
      title: "안전총괄책임자·안전관리담당자 지정 및 무대예술전문인 배치",
      target: "객석 500석 이상 공연장",
      applies: function (f) { return num(f && f.seats) >= 500; },
      grade: function (f) { return "객석 500석 이상"; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "상시(변경 시 재지정)",
      tasks: ["안전총괄책임자·안전관리담당자 지정", "무대시설 관리 무대예술전문인 배치", "안전관리비 계상·사용내역 제출"],
      deadline: "",
      performer: "공연장운영자",
      records: "지정·배치 현황",
      penalty: "무대예술전문인 미배치 과태료 150만~300만원(문체부 안내)",
      priority: "high", verify: true,
      notes: ""
    },
    {
      id: "SPC-006", domain: "특수시설",
      law: "공연법",
      basis: "법 제11조의2(안전교육), 시행령",
      lawUrl: L.perf, kind: "education",
      title: "공연장 종사자 안전교육",
      target: "등록 공연장 운영자·종사자",
      applies: function (f) { return !!f && isPerformance(f); },
      grade: function (f) { return null; },
      cycleMonths: 24, anchor: "free", dueMonths: [],
      cycleText: "신규 종사 후 일정 기간 내 및 이후 2년마다(원문 확인)",
      tasks: ["종사자 안전교육 이수", "공연 전 출연자 등 안전교육 실시"],
      deadline: "",
      performer: "공연장 종사자",
      records: "교육 이수 기록",
      penalty: "미이수 시 과태료",
      priority: "normal", verify: true,
      notes: ""
    },

    // ===================== 체육시설 =====================
    {
      id: "SPC-007", domain: "특수시설",
      law: "체육시설의 설치·이용에 관한 법률",
      basis: "법 제4조의2(안전관리 기본계획), 법 제4조의4(안전점검), 시행령",
      lawUrl: L.sport, kind: "inspection",
      title: "공공체육시설 안전점검",
      target: "공공체육시설(체육관·수영장·운동장 등)",
      applies: function (f) { return !!(f && f.sportsFacility); },
      grade: function (f) { return null; },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "연 1회 이상 정기 안전점검(원문 확인), 수시점검",
      tasks: ["체육시설 안전점검 실시(구조물·설비·체육기구)", "점검 결과 체육시설 안전관리 시스템 입력", "C등급 이하 시 보수 및 이용 제한"],
      deadline: "",
      performer: "관리주체(필요 시 전문기관)",
      records: "점검 결과 보관",
      penalty: "",
      priority: "normal", verify: true,
      notes: "2015년 개정으로 공공체육시설 정기 안전점검 도입. 2026.6 전문기술인 참여·결과 보관 개정안 발의(시행 여부 확인). 체육관 건물 자체는 시설물안전법·건축물관리법 점검과 병행."
    },
    {
      id: "SPC-008", domain: "특수시설",
      law: "체육시설의 설치·이용에 관한 법률",
      basis: "법 제24조(안전·위생 기준), 시행규칙 제23조 별표6",
      lawUrl: L.sport, kind: "appointment",
      title: "수영장 안전요원 배치·안전위생기준 준수",
      target: "수영장 운영 체육시설",
      applies: function (f) { return !!f && has(f.subUse, "수영장"); },
      grade: function (f) { return null; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "운영 시간 중 상시",
      tasks: ["수상안전요원(인명구조 자격) 배치", "응급구조장비·비상연락체계 유지", "수질 기준 관리(보건·환경 규칙 참조)"],
      deadline: "",
      performer: "운영부서·위탁운영자",
      records: "근무·점검일지",
      penalty: "",
      priority: "high", verify: true,
      notes: "체육시설법 안전·위생기준은 신고·등록 체육시설업 중심이나 공공수영장도 동일 수준 준수 권장."
    },

    // ===================== 어린이놀이시설 =====================
    {
      id: "SPC-009", domain: "특수시설",
      law: "어린이놀이시설 안전관리법",
      basis: "법 제14조(안전점검), 시행령 제11조",
      lawUrl: L.play, kind: "inspection",
      title: "어린이놀이시설 월 1회 안전점검",
      target: "어린이놀이시설 보유 시설",
      applies: function (f) { return !!(f && f.playground); },
      grade: function (f) { return null; },
      cycleMonths: 1, anchor: "free", dueMonths: [],
      cycleText: "월 1회 이상",
      tasks: ["놀이기구 구조·부식·체결 상태 점검", "바닥재·충격흡수 상태 확인", "결과 어린이놀이시설 안전관리시스템 입력", "이상 시 이용금지·안전진단 신청"],
      deadline: "이상 발견 시 1개월 이내 안전진단 신청",
      performer: "관리주체 또는 안전관리자",
      records: "점검 기록 3년 보관",
      penalty: "미실시 시 과태료",
      priority: "high", verify: true,
      notes: ""
    },
    {
      id: "SPC-010", domain: "특수시설",
      law: "어린이놀이시설 안전관리법",
      basis: "법 제12조(정기시설검사), 시행령 제8조",
      lawUrl: L.play, kind: "inspection",
      title: "어린이놀이시설 정기시설검사",
      target: "어린이놀이시설 보유 시설",
      applies: function (f) { return !!(f && f.playground); },
      grade: function (f) { return null; },
      cycleMonths: 24, anchor: "free", dueMonths: [],
      cycleText: "설치검사 후 2년에 1회 이상",
      tasks: ["안전검사기관에 정기시설검사 신청", "불합격 시 이용금지·보수 후 재검사"],
      deadline: "",
      performer: "행정안전부 지정 안전검사기관",
      records: "검사 결과 보관",
      penalty: "미실시 시 과태료(불합격 시설 이용 제공은 벌칙)",
      priority: "critical", verify: false,
      notes: ""
    },
    {
      id: "SPC-011", domain: "특수시설",
      law: "어린이놀이시설 안전관리법",
      basis: "법 제20조(안전교육), 시행규칙",
      lawUrl: L.play, kind: "education",
      title: "어린이놀이시설 안전관리자 안전교육",
      target: "관리주체 또는 안전관리자",
      applies: function (f) { return !!(f && f.playground); },
      grade: function (f) { return null; },
      cycleMonths: 24, anchor: "free", dueMonths: [],
      cycleText: "관리주체가 된 날(안전관리자 변경) 후 3개월 이내 최초, 이후 2년마다(4시간)",
      tasks: ["안전관리자 지정", "최초·정기 안전교육 이수"],
      deadline: "",
      performer: "안전관리자",
      records: "교육 이수증",
      penalty: "미이수 시 과태료",
      priority: "high", verify: true,
      notes: ""
    },
    {
      id: "SPC-012", domain: "특수시설",
      law: "어린이놀이시설 안전관리법",
      basis: "법 제21조(보험가입), 시행령 제14조",
      lawUrl: L.play, kind: "insurance",
      title: "어린이놀이시설 배상책임보험 가입",
      target: "어린이놀이시설 관리주체",
      applies: function (f) { return !!(f && f.playground); },
      grade: function (f) { return null; },
      cycleMonths: 12, anchor: "free", dueMonths: [],
      cycleText: "인도받은 날부터 30일 이내 가입, 매년 갱신",
      tasks: ["사고배상책임보험 가입·갱신", "보험 가입 정보 시스템 입력"],
      deadline: "보험기간 만료 전 갱신",
      performer: "관리주체",
      records: "보험증권",
      penalty: "미가입 시 과태료",
      priority: "high", verify: true,
      notes: "지자체 영조물배상공제로 갈음 가능 여부 확인."
    },
    {
      id: "SPC-013", domain: "특수시설",
      law: "어린이놀이시설 안전관리법",
      basis: "법 제22조(중대한 사고 보고)",
      lawUrl: L.play, kind: "report",
      title: "어린이놀이시설 중대사고 보고",
      target: "어린이놀이시설에서 중대한 사고 발생 시",
      applies: function (f) { return !!(f && f.playground); },
      grade: function (f) { return null; },
      cycleMonths: null, anchor: "event", dueMonths: [],
      cycleText: "사고 발생 시 즉시",
      tasks: ["사망·중상 등 중대사고 발생 시 즉시 보고", "해당 놀이기구 사용중지·사고조사 협조"],
      deadline: "지체 없이",
      performer: "관리주체",
      records: "사고 기록",
      penalty: "미보고 시 과태료",
      priority: "high", verify: true,
      notes: ""
    }
  );
})();
