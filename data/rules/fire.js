/* 소방 분야 법정의무 규칙 (law-fire) — 기준일 2026-11 현행 법령
 * 대상: 상주시 소유 공공건축물(지자체 = 공공기관의 소방안전관리에 관한 규정 제2조 적용)
 * SCHEMA: docs/SCHEMA.md 2절
 */
(function () {
  var LAW_FIRE_PREV = "https://www.law.go.kr/법령/화재의예방및안전관리에관한법률";
  var LAW_FIRE_SYS = "https://www.law.go.kr/법령/소방시설설치및관리에관한법률";
  var LAW_PUBLIC = "https://www.law.go.kr/법령/공공기관의소방안전관리에관한규정";
  var LAW_HAZMAT = "https://www.law.go.kr/법령/위험물안전관리법";
  var LAW_MULTI = "https://www.law.go.kr/법령/다중이용업소의안전관리에관한특별법";
  var LAW_INS = "https://www.law.go.kr/법령/화재로인한재해보상과보험가입에관한법률";
  var LAW_HERITAGE = "https://www.law.go.kr/법령/문화유산의보존및활용에관한법률";

  function n(v) { return (typeof v === "number" && isFinite(v)) ? v : 0; }

  // 화재예방법 시행령 별표4 소방안전관리대상물 등급 (아파트 외 건축물 기준, 가스·지하구 기준 생략)
  function fireLevel(f) {
    try {
      if (!f) return 0;
      var floorsAll = n(f.floorsAbove) + n(f.floorsBelow);
      if (floorsAll >= 30 || n(f.height) >= 120 || n(f.area) >= 100000) return 4; // 특급
      if (n(f.area) >= 15000 || n(f.floorsAbove) >= 11) return 3;                   // 1급
      if (!!f.indoorHydrant || !!f.sprinkler || !!f.waterSpray) return 2;           // 2급
      if (f.heritage === "국가지정") return 2;                                       // 국보·보물 목조건축물(추정)
      if (!!f.simpleSprinkler || !!f.autoDetection) return 1;                       // 3급
      return 0;
    } catch (e) { return 0; }
  }
  var LEVEL_LABEL = { 4: "특급 소방안전관리대상물", 3: "1급 소방안전관리대상물", 2: "2급 소방안전관리대상물", 1: "3급 소방안전관리대상물" };
  function gradeLabel(f) { var l = fireLevel(f); return l ? LEVEL_LABEL[l] : null; }
  function isTarget(f) { return fireLevel(f) >= 1; }

  // 소방시설법 시행규칙 별표3 종합점검 대상 (공공기관 기준 포함)
  function needsComprehensive(f) {
    try {
      if (!f) return false;
      if (!!f.sprinkler) return true;
      if (!!f.waterSpray && n(f.area) >= 5000) return true;
      if (!!f.multiUseBiz && n(f.area) >= 2000) return true;
      if (n(f.area) >= 1000 && (!!f.indoorHydrant || !!f.autoDetection)) return true;
      return false;
    } catch (e) { return false; }
  }
  function hasAnyFireSystem(f) {
    return !!f && (!!f.sprinkler || !!f.simpleSprinkler || !!f.indoorHydrant || !!f.autoDetection || !!f.waterSpray || !!f.smokeControl);
  }

  (window.SJ_RULES = window.SJ_RULES || []).push(
    {
      id: "FIRE-010",
      domain: "소방",
      law: "화재의 예방 및 안전관리에 관한 법률",
      basis: "법 제24조·제26조, 시행령 제25조 별표4, 공공기관의 소방안전관리에 관한 규정 제5조·제6조",
      lawUrl: LAW_PUBLIC,
      kind: "appointment",
      title: "소방안전관리자 선임 및 선임 통보",
      target: "소방안전관리대상물(특급·1급·2급·3급)에 해당하는 공공기관 건축물. 소화기·비상경보설비만 설치된 경우 선임 생략 가능",
      applies: function (f) { return isTarget(f); },
      grade: function (f) { return gradeLabel(f); },
      cycleMonths: null,
      anchor: "event",
      dueMonths: [],
      cycleText: "사유 발생 시(신규 사용승인, 담당자 인사이동·퇴직 등) — 사유 발생일부터 30일 이내 선임",
      tasks: [
        "시설 등급(특급/1급/2급/3급)에 맞는 소방안전관리자 자격증 소지 직원(감독직 우선)을 기관장 명의로 선임",
        "선임일부터 14일 이내 관할 상주소방서장 및 한국소방안전원장에게 선임 신고(통보) — 한국소방안전원 '소방안전관리자 선임신고' 온라인 접수 또는 소방서 방문, 자격증 사본 첨부",
        "자격자가 없으면 강습교육 수강 예정자를 미리 지정하여 선임하고, 강습 수료 후 지체 없이 수료증 제출",
        "건축물이 떨어진 구역별로 있는 경우 구역별 선임 여부 확인",
        "인사발령으로 담당자 변경 시 해임일부터 30일 이내 재선임 및 14일 이내 재신고"
      ],
      deadline: "선임: 사유 발생일부터 30일 이내 / 신고: 선임일부터 14일 이내",
      performer: "기관장(선임권자), 시설 관리부서 담당자",
      records: "선임신고서·자격증 사본 보관",
      penalty: "미선임 300만원 이하 벌금, 선임신고 미이행 200만원 이하 과태료",
      priority: "critical",
      verify: false,
      notes: "등급은 연면적·층수·소방시설 보유로 자동 추정(가스저장·지하구 기준 제외). 국가지정 국가유산은 국보·보물 목조건축물일 때만 2급이므로 확인 필요. 공공기관 규정상 통보처는 소방서장 및 한국소방안전원장."
    },
    {
      id: "FIRE-020",
      domain: "소방",
      law: "화재의 예방 및 안전관리에 관한 법률",
      basis: "법 제26조제1항, 시행규칙 제15조",
      lawUrl: LAW_FIRE_PREV,
      kind: "plan",
      title: "소방안전관리자 현황표 게시",
      target: "소방안전관리자를 선임한 소방안전관리대상물",
      applies: function (f) { return isTarget(f); },
      grade: function (f) { return gradeLabel(f); },
      cycleMonths: null,
      anchor: "event",
      dueMonths: [],
      cycleText: "선임·변경 시 즉시",
      tasks: [
        "소방안전관리자 성명·선임일자·연락처·소방안전관리대상물 등급을 기재한 '소방안전관리자 현황표'를 출입자가 쉽게 볼 수 있는 곳(주출입구·엘리베이터 홀 등)에 게시",
        "담당자 변경 시 현황표 즉시 교체"
      ],
      deadline: "선임 신고 후 즉시",
      performer: "소방안전관리자",
      records: "",
      penalty: "미게시 200만원 이하 과태료",
      priority: "high",
      verify: true,
      notes: "과태료 금액은 법 제52조 확인 필요."
    },
    {
      id: "FIRE-030",
      domain: "소방",
      law: "화재의 예방 및 안전관리에 관한 법률",
      basis: "법 제34조, 시행규칙 제29조, 공공기관의 소방안전관리에 관한 규정 제8조",
      lawUrl: LAW_FIRE_PREV,
      kind: "education",
      title: "소방안전관리자(보조자) 실무교육 이수",
      target: "선임된 소방안전관리자 및 소방안전관리보조자",
      applies: function (f) { return isTarget(f); },
      grade: function (f) { return gradeLabel(f); },
      cycleMonths: 24,
      anchor: "free",
      dueMonths: [],
      cycleText: "선임일부터 6개월 이내 최초, 이후 최초 실무교육일부터 2년마다 1회",
      tasks: [
        "한국소방안전원 홈페이지(kfsi.or.kr)에서 실무교육 일정 확인 후 신청(온라인·집합)",
        "신규 선임자는 선임일부터 6개월 이내 이수(강습교육 수료 후 1년 이내 선임된 경우 수료일에 실무교육 이수로 간주)",
        "이수증을 선임 서류와 함께 보관하고 차기 교육일(2년 후) 관리"
      ],
      deadline: "선임 후 6개월 이내 / 2년마다",
      performer: "소방안전관리자·보조자 본인(기관장은 교육받도록 조치)",
      records: "교육 이수증 보관",
      penalty: "미이수 50만원 이하 과태료",
      priority: "high",
      verify: true,
      notes: "2년 주기 기산(최초 실무교육일 기준) 및 과태료 금액 원문 재확인 필요."
    },
    {
      id: "FIRE-040",
      domain: "소방",
      law: "화재의 예방 및 안전관리에 관한 법률",
      basis: "법 제24조제2항, 시행령 제25조 별표5",
      lawUrl: LAW_FIRE_PREV,
      kind: "appointment",
      title: "소방안전관리보조자 선임·신고",
      target: "연면적 1만5천㎡ 이상 건축물(아파트·연립 제외, 1만5천㎡마다 1명 추가), 노유자시설·의료시설·수련시설·숙박시설 등",
      applies: function (f) {
        if (!f || !isTarget(f)) return false;
        return n(f.area) >= 15000 || !!f.elderly || !!f.childcare || f.buildingUse === "노유자시설" || f.buildingUse === "의료시설" || f.buildingUse === "수련시설";
      },
      grade: function (f) {
        if (!f) return null;
        var cnt = n(f.area) >= 15000 ? 1 + Math.floor((n(f.area) - 15000) / 15000) : 1;
        return "보조자 " + cnt + "명 이상(추정)";
      },
      cycleMonths: null,
      anchor: "event",
      dueMonths: [],
      cycleText: "사유 발생일부터 30일 이내 선임, 선임일부터 14일 이내 신고",
      tasks: [
        "소방안전관리보조자 자격(자격증 또는 강습 수료자, 소방 관련 자격자 등) 직원 선임",
        "선임일부터 14일 이내 소방서·한국소방안전원에 선임 신고",
        "보조자도 실무교육(선임 후 6개월 이내, 이후 2년마다) 이수"
      ],
      deadline: "선임 30일 / 신고 14일",
      performer: "기관장, 시설 관리부서",
      records: "선임신고서 보관",
      penalty: "미선임 300만원 이하 벌금",
      priority: "high",
      verify: true,
      notes: "노유자·수련시설 중 바닥면적 합계 1,500㎡ 미만이고 관계인이 24시간 상시 근무하는 경우 제외 규정 등 세부 요건 확인 필요. 방재실 운영 시 3만㎡마다 1명."
    },
    {
      id: "FIRE-050",
      domain: "소방",
      law: "화재의 예방 및 안전관리에 관한 법률",
      basis: "법 제24조제5항, 시행령 제27조, 공공기관의 소방안전관리에 관한 규정 제4조",
      lawUrl: LAW_FIRE_PREV,
      kind: "plan",
      title: "소방계획서 작성·시행",
      target: "모든 소방안전관리대상물",
      applies: function (f) { return isTarget(f); },
      grade: function (f) { return gradeLabel(f); },
      cycleMonths: 12,
      anchor: "fixed",
      dueMonths: [1],
      cycleText: "연 1회 수립(연초), 변경 사항 발생 시 수정",
      tasks: [
        "한국소방안전원 표준 소방계획서 양식으로 건축물 일반현황, 소방시설 현황, 화재예방·자위소방대 조직, 피난계획, 훈련·교육 계획, 화기취급 감독 계획 작성",
        "기관장 결재 후 비치하고 소방서 요청 시 제출",
        "증·개축, 용도변경, 소방시설 변경 시 즉시 수정"
      ],
      deadline: "연초(1월) 수립 권장",
      performer: "소방안전관리자",
      records: "소방계획서 비치",
      penalty: "소방안전관리 업무 미수행 시 300만원 이하 과태료",
      priority: "high",
      verify: true,
      notes: "법정 작성 시기는 명시되어 있지 않아 실무상 연 1회(1월) 수립으로 설정. 피난계획(법 제36조)과 함께 작성."
    },
    {
      id: "FIRE-060",
      domain: "소방",
      law: "화재의 예방 및 안전관리에 관한 법률",
      basis: "법 제24조제5항, 시행규칙 제14조(업무수행 기록)",
      lawUrl: LAW_FIRE_PREV,
      kind: "plan",
      title: "소방안전관리 업무수행 기록 작성",
      target: "모든 소방안전관리대상물",
      applies: function (f) { return isTarget(f); },
      grade: function (f) { return gradeLabel(f); },
      cycleMonths: 1,
      anchor: "free",
      dueMonths: [],
      cycleText: "월 1회 이상",
      tasks: [
        "소방시설·피난시설·방화시설 점검, 화기취급 감독, 교육·훈련 실시 결과를 '소방안전관리 업무수행 기록표'에 월 1회 이상 기록",
        "보수·정비가 필요한 사항 발견 시 지체 없이 기관장에게 보고하고 조치 내역 기록"
      ],
      deadline: "매월",
      performer: "소방안전관리자",
      records: "작성일부터 2년 보관",
      penalty: "업무 미수행 300만원 이하 과태료",
      priority: "high",
      verify: true,
      notes: "근거 조문 번호(시행규칙) 원문 재확인 필요."
    },
    {
      id: "FIRE-070",
      domain: "소방",
      law: "공공기관의 소방안전관리에 관한 규정",
      basis: "규정 제14조, 화재예방법 제37조, 시행규칙 제36조",
      lawUrl: LAW_PUBLIC,
      kind: "education",
      title: "소방훈련·교육 (공공기관 연 2회, 1회 이상 소방관서 합동)",
      target: "공공기관 모든 인원. 상시 근무 10명 이하이거나 소방안전관리자 선임 생략 기관은 합동훈련 면제",
      applies: function (f) { return !!f && (isTarget(f) || n(f.workers) > 0); },
      grade: function (f) {
        if (!f) return null;
        return (n(f.workers) > 10 && isTarget(f)) ? "연 2회(합동 1회 포함)" : "연 2회(합동훈련 면제 가능)";
      },
      cycleMonths: 6,
      anchor: "fixed",
      dueMonths: [6, 12],
      cycleText: "연 2회 이상(상·하반기), 그중 1회 이상 상주소방서와 합동",
      tasks: [
        "상·하반기 소화·화재통보·피난 요령을 포함한 소방훈련 및 교육 실시(전 직원 대상)",
        "상주소방서 예방안전과와 합동훈련 일정 협의(연 1회 이상)",
        "훈련 사진·참석자 명단을 '소방훈련·교육 실시 결과 기록부'에 작성",
        "특급·1급 대상물은 실시 결과를 소방서장에게 제출"
      ],
      deadline: "특급·1급: 훈련 실시일부터 30일 이내 결과 제출",
      performer: "기관장, 소방안전관리자, 자위소방대",
      records: "훈련·교육 기록 2년 보관",
      penalty: "소방훈련·교육 미실시 300만원 이하 과태료",
      priority: "high",
      verify: true,
      notes: "연 2회·합동 1회·2년 보관은 규정 제14조 확인. 특급·1급 결과 제출 기한(30일)은 화재예방법 시행규칙 원문 확인 필요."
    },
    {
      id: "FIRE-080",
      domain: "소방",
      law: "공공기관의 소방안전관리에 관한 규정",
      basis: "규정 제12조·제13조, 화재예방법 시행령 제27조",
      lawUrl: LAW_PUBLIC,
      kind: "plan",
      title: "자위소방대 편성·운영",
      target: "모든 공공기관",
      applies: function (f) { return !!f; },
      grade: function (f) { return null; },
      cycleMonths: 12,
      anchor: "fixed",
      dueMonths: [1],
      cycleText: "연 1회 편성표 정비 및 인사이동 시 수시",
      tasks: [
        "전 직원으로 자위소방대 구성: 대장·부대장 각 1명, 지휘반·진압반·구조구급반·대피유도반",
        "인사이동 반영하여 편성표 갱신, 소방계획서에 첨부",
        "반별 임무(초기소화, 119신고, 대피유도, 응급처치) 교육"
      ],
      deadline: "",
      performer: "기관장, 소방안전관리자",
      records: "자위소방대 편성표",
      penalty: "",
      priority: "normal",
      verify: false,
      notes: ""
    },
    {
      id: "FIRE-090",
      domain: "소방",
      law: "화재의 예방 및 안전관리에 관한 법률",
      basis: "법 제36조, 시행규칙 제35조",
      lawUrl: LAW_FIRE_PREV,
      kind: "education",
      title: "피난계획 수립 및 피난유도 안내정보 제공",
      target: "소방안전관리대상물",
      applies: function (f) { return isTarget(f); },
      grade: function (f) { return gradeLabel(f); },
      cycleMonths: 6,
      anchor: "fixed",
      dueMonths: [6, 12],
      cycleText: "피난안내 교육 연 2회, 피난안내 방송 분기 1회 이상, 피난안내도 상시 비치",
      tasks: [
        "층별 피난경로·피난시설 위치를 담은 피난계획 수립(소방계획서에 포함)",
        "층마다 보기 쉬운 위치에 피난안내도 비치 또는 피난안내 영상 상영",
        "연 2회 피난안내 교육, 분기별 1회 이상 피난안내 방송 실시"
      ],
      deadline: "",
      performer: "소방안전관리자",
      records: "실시 내역 업무수행 기록에 기재",
      penalty: "300만원 이하 과태료",
      priority: "normal",
      verify: true,
      notes: "안내정보 제공 방법·횟수(연 2회 교육/분기 1회 방송) 원문 재확인 필요."
    },
    {
      id: "FIRE-100",
      domain: "소방",
      law: "소방시설 설치 및 관리에 관한 법률",
      basis: "법 제22조, 시행규칙 제20조 별표3",
      lawUrl: LAW_FIRE_SYS,
      kind: "inspection",
      title: "소방시설 작동점검",
      target: "소방안전관리자를 선임하는 특정소방대상물(특급 소방안전관리대상물·위험물제조소등 제외)",
      applies: function (f) { return isTarget(f) && fireLevel(f) < 4; },
      grade: function (f) { return needsComprehensive(f) ? "종합점검 후 6개월 되는 달 실시" : "사용승인일 달 실시"; },
      cycleMonths: 12,
      anchor: "approval",
      dueMonths: [],
      cycleText: "연 1회 이상. 종합점검 대상은 종합점검 받은 달부터 6개월이 되는 달, 그 외는 사용승인일이 속하는 달의 말일까지",
      tasks: [
        "소방시설관리업자 용역 발주(또는 간이스프링클러·자탐만 있는 3급은 소방안전관리자·관계인 직접 점검 가능)",
        "소방시설 자체점검 기술기준(점검표)에 따라 소화·경보·피난설비 작동 확인",
        "결과보고서 수령 후 15일 이내 소방서에 보고(FIRE-120)"
      ],
      deadline: "점검 끝난 날부터 15일 이내 소방서 보고",
      performer: "소방시설관리업자, 소방안전관리자로 선임된 소방시설관리사·소방기술사(3급 간이스프링클러·자탐 대상은 관계인 가능)",
      records: "점검결과 2년 보관",
      penalty: "자체점검 미실시 1년 이하 징역 또는 1천만원 이하 벌금",
      priority: "critical",
      verify: true,
      notes: "종합점검 대상의 작동점검 시기(종합점검 6개월 후)는 엔진에서 사용승인월+6개월로 해석 필요. 벌칙 조문(법 제58조) 확인 필요."
    },
    {
      id: "FIRE-110",
      domain: "소방",
      law: "소방시설 설치 및 관리에 관한 법률",
      basis: "법 제22조, 시행규칙 제20조 별표3",
      lawUrl: LAW_FIRE_SYS,
      kind: "inspection",
      title: "소방시설 종합점검",
      target: "스프링클러설비 설치 대상물, 물분무등소화설비(호스릴 제외) 설치 연면적 5천㎡ 이상, 다중이용업 영업장 설치 연면적 2천㎡ 이상, 공공기관 연면적 1천㎡ 이상으로 옥내소화전 또는 자동화재탐지설비 설치된 것",
      applies: function (f) { return needsComprehensive(f); },
      grade: function (f) { return fireLevel(f) >= 4 ? "특급: 반기 1회 이상" : "연 1회"; },
      cycleMonths: 12,
      anchor: "approval",
      dueMonths: [],
      cycleText: "연 1회 이상(특급 반기 1회), 건축물 사용승인일이 속하는 달까지. 신축 등 최초점검은 사용 가능일부터 60일 이내",
      tasks: [
        "소방시설관리업자에 종합점검 용역 발주(사용승인일 달 이전 계약)",
        "점검 시 점검인력 배치 확인, 성능 시험(펌프 성능, 감지기 등) 입회",
        "관리업자로부터 점검 끝난 날부터 10일 이내 결과보고서 수령",
        "결과보고서·이행계획서를 15일 이내 소방서 보고(FIRE-120)"
      ],
      deadline: "점검 끝난 날부터 15일 이내 소방서 보고",
      performer: "소방시설관리업자 또는 소방안전관리자로 선임된 소방시설관리사·소방기술사",
      records: "점검결과 2년 보관",
      penalty: "자체점검 미실시 1년 이하 징역 또는 1천만원 이하 벌금",
      priority: "critical",
      verify: true,
      notes: "소방대가 근무하는 공공기관은 공공기관 기준 제외. 물분무등 설비 여부는 호스릴 방식 제외 확인 필요."
    },
    {
      id: "FIRE-120",
      domain: "소방",
      law: "소방시설 설치 및 관리에 관한 법률",
      basis: "법 제23조, 시행규칙 제23조·제24조",
      lawUrl: LAW_FIRE_SYS,
      kind: "report",
      title: "자체점검 결과보고 및 이행계획 완료보고",
      target: "작동점검·종합점검을 실시한 특정소방대상물",
      applies: function (f) { return isTarget(f) || needsComprehensive(f); },
      grade: function (f) { return null; },
      cycleMonths: null,
      anchor: "event",
      dueMonths: [],
      cycleText: "자체점검 실시 후마다",
      tasks: [
        "관리업자 결과보고서(점검인력 배치확인서 첨부)를 점검 끝난 날부터 10일 이내 수령",
        "점검 끝난 날부터 15일 이내 '소방시설등 자체점검 실시결과 보고서'와 이행계획서를 상주소방서에 제출(소방시설관리 전산망 또는 방문)",
        "불량사항은 이행계획 기간(보고일부터 10일 이내, 정비·교체 필요 시 20일 이내) 내 보수",
        "이행 완료일부터 10일 이내 이행완료 보고서 제출"
      ],
      deadline: "점검 후 15일 이내 보고 / 이행완료 후 10일 이내 완료보고",
      performer: "소방안전관리자, 시설 담당자",
      records: "결과보고서 2년 보관",
      penalty: "결과 미보고·거짓보고 300만원 이하 과태료, 이행계획 미완료 300만원 이하 과태료",
      priority: "high",
      verify: true,
      notes: "이행계획 완료기간(10일/20일) 원문 재확인 필요."
    },
    {
      id: "FIRE-130",
      domain: "소방",
      law: "소방시설 설치 및 관리에 관한 법률",
      basis: "법 제24조, 시행규칙 제25조",
      lawUrl: LAW_FIRE_SYS,
      kind: "report",
      title: "소방시설등 자체점검기록표 게시",
      target: "자체점검 결과를 보고한 특정소방대상물",
      applies: function (f) { return isTarget(f) || needsComprehensive(f); },
      grade: function (f) { return null; },
      cycleMonths: null,
      anchor: "event",
      dueMonths: [],
      cycleText: "결과 보고 후마다",
      tasks: [
        "소방서 보고일부터 10일 이내 '소방시설등 자체점검기록표'를 주출입구 등 잘 보이는 곳에 30일 이상 게시"
      ],
      deadline: "보고일부터 10일 이내 게시, 30일 이상 유지",
      performer: "소방안전관리자",
      records: "",
      penalty: "미게시 300만원 이하 과태료",
      priority: "high",
      verify: true,
      notes: ""
    },
    {
      id: "FIRE-140",
      domain: "소방",
      law: "소방시설 설치 및 관리에 관한 법률",
      basis: "법 제12조, 제16조",
      lawUrl: LAW_FIRE_SYS,
      kind: "maintenance",
      title: "소방시설·피난시설·방화시설 유지관리",
      target: "모든 특정소방대상물",
      applies: function (f) { return !!f; },
      grade: function (f) { return null; },
      cycleMonths: 1,
      anchor: "free",
      dueMonths: [],
      cycleText: "상시(월 1회 이상 자체 순찰 권장)",
      tasks: [
        "소방시설 전원·밸브 폐쇄·차단 금지(점검·정비 시 외), 수신기 경보 정지 상태 방치 금지",
        "비상구·피난통로·계단에 물건 적치 금지, 방화문 상시 닫힘(또는 자동폐쇄) 유지",
        "소화기 압력·위치 확인, 내용연수(10년) 경과 소화기 교체"
      ],
      deadline: "",
      performer: "소방안전관리자, 시설 담당자",
      records: "업무수행 기록에 기재",
      penalty: "소방시설 폐쇄·차단 시 5년 이하 징역 또는 5천만원 이하 벌금, 피난·방화시설 훼손·적치 300만원 이하 과태료",
      priority: "critical",
      verify: true,
      notes: "소화기 내용연수 10년(성능확인 시 연장 가능)."
    },
    {
      id: "FIRE-150",
      domain: "소방",
      law: "소방시설 설치 및 관리에 관한 법률",
      basis: "법 제20조, 시행령 제30조·제31조",
      lawUrl: LAW_FIRE_SYS,
      kind: "plan",
      title: "방염대상물품 방염성능 확보",
      target: "문화및집회시설, 운동시설(수영장 제외), 노유자시설, 의료시설, 숙박시설, 11층 이상(아파트 제외), 다중이용업소 등",
      applies: function (f) {
        if (!f) return false;
        var u = f.buildingUse || "";
        if (u === "문화및집회시설" || u === "노유자시설" || u === "의료시설" || u === "수련시설") return true;
        if (u === "운동시설" && f.subUse !== "수영장") return true;
        return n(f.floorsAbove) >= 11 || !!f.multiUseBiz || !!f.childcare || !!f.elderly;
      },
      grade: function (f) { return null; },
      cycleMonths: null,
      anchor: "event",
      dueMonths: [],
      cycleText: "커튼·블라인드·카펫·벽지·실내장식물 설치·교체 시",
      tasks: [
        "인테리어·물품 구매 시 방염성능검사 합격표시 제품 사용을 설계·계약 조건에 명시",
        "현장 방염처리 시 방염처리업자 시공 및 방염성능검사 성적서 확보",
        "준공·납품 시 방염 확인서류 보관"
      ],
      deadline: "",
      performer: "발주부서, 시설 담당자",
      records: "방염성능검사 성적서 보관",
      penalty: "방염 미이행 시 조치명령, 명령 위반 300만원 이하 벌금",
      priority: "normal",
      verify: true,
      notes: "교육연구시설 중 합숙소, 방송통신시설 중 방송국·촬영소 등도 대상."
    },
    {
      id: "FIRE-200",
      domain: "소방",
      law: "위험물안전관리법",
      basis: "법 제6조, 시행령 제3조 별표1(제4류 제2석유류 비수용성 경유 지정수량 1,000L)",
      lawUrl: LAW_HAZMAT,
      kind: "report",
      title: "위험물 저장소(제조소등) 설치허가·변경신고",
      target: "비상발전기 연료 등 경유를 지정수량(1,000L) 이상 저장·취급하는 시설",
      applies: function (f) { return !!f && n(f.fuelL) >= 1000; },
      grade: function (f) { return f ? ("지정수량 " + (n(f.fuelL) / 1000).toFixed(1) + "배") : null; },
      cycleMonths: null,
      anchor: "event",
      dueMonths: [],
      cycleText: "설치·변경 시(사전 허가), 품명·수량 변경 시 변경 1일 전까지 신고",
      tasks: [
        "발전기 연료탱크·주유 저장량 확인(지정수량 배수 산정)",
        "설치·위치·구조 변경 전 상주시(경북도 위임) 또는 소방서에 제조소등 설치(변경)허가 신청, 완공검사 수검",
        "저장 품명·수량·지정수량 배수 변경 시 변경 1일 전까지 신고"
      ],
      deadline: "설치 전 허가",
      performer: "시설 담당자, 위험물 시공업체",
      records: "허가증·완공검사필증 보관",
      penalty: "무허가 저장·취급 5년 이하 징역 또는 1억원 이하 벌금",
      priority: "critical",
      verify: true,
      notes: "허가권자(시·도지사 → 소방서장 위임) 경북 조례로 확인. 발전기 연료는 일반취급소/옥내탱크저장소 등으로 분류됨."
    },
    {
      id: "FIRE-210",
      domain: "소방",
      law: "위험물안전관리법",
      basis: "법 제15조, 제28조, 시행규칙 제78조 별표24",
      lawUrl: LAW_HAZMAT,
      kind: "appointment",
      title: "위험물안전관리자 선임·신고 및 안전교육",
      target: "지정수량 이상 위험물 제조소등",
      applies: function (f) { return !!f && n(f.fuelL) >= 1000; },
      grade: function (f) { return null; },
      cycleMonths: 24,
      anchor: "event",
      dueMonths: [],
      cycleText: "사유 발생일부터 30일 이내 선임, 선임일부터 14일 이내 신고 / 안전교육 신규 6개월 이내, 이후 2년마다",
      tasks: [
        "위험물기능사·위험물안전관리자 교육이수자 등 자격자 선임(30일 이내)",
        "선임일부터 14일 이내 소방서에 선임 신고",
        "한국소방안전원 위험물안전관리자 실무교육 신청·이수"
      ],
      deadline: "선임 30일 / 신고 14일",
      performer: "기관장, 시설 담당자",
      records: "선임신고서·교육 이수증",
      penalty: "미선임 1천500만원 이하 벌금, 선임신고 지연 200만원 이하 과태료",
      priority: "critical",
      verify: true,
      notes: "1인 다수 제조소등 중복선임 특례(동일 구내) 확인."
    },
    {
      id: "FIRE-220",
      domain: "소방",
      law: "위험물안전관리법",
      basis: "법 제18조, 시행령 제15조·제16조, 시행규칙 제64조",
      lawUrl: LAW_HAZMAT,
      kind: "inspection",
      title: "위험물 제조소등 정기점검",
      target: "정기점검 대상 제조소등(지정수량 10배 이상 제조소·일반취급소, 지하탱크저장소, 옥외탱크 100배 이상 등)",
      applies: function (f) { return !!f && n(f.fuelL) >= 10000; },
      grade: function (f) { return null; },
      cycleMonths: 12,
      anchor: "free",
      dueMonths: [],
      cycleText: "연 1회 이상",
      tasks: [
        "위험물안전관리자 또는 안전관리대행기관·탱크시험자가 정기점검 실시",
        "점검일부터 30일 이내 점검결과를 소방서에 제출",
        "점검기록 3년 보존"
      ],
      deadline: "점검 후 30일 이내 제출",
      performer: "위험물안전관리자, 안전관리대행기관",
      records: "점검기록 3년 보존",
      penalty: "미점검 1년 이하 징역 또는 1천만원 이하 벌금",
      priority: "high",
      verify: true,
      notes: "지하탱크저장소는 수량과 무관하게 대상 — fuelL 만으로 판정 불가, 탱크 형태 확인 필요(10배 이상 기준으로 근사)."
    },
    {
      id: "FIRE-230",
      domain: "소방",
      law: "위험물안전관리법",
      basis: "법 제4조, 경상북도 위험물 안전관리 조례",
      lawUrl: LAW_HAZMAT,
      kind: "report",
      title: "소량위험물(지정수량 미만) 저장·취급 관리",
      target: "경유를 지정수량의 1/5(200L) 이상 1,000L 미만 저장·취급하는 시설",
      applies: function (f) { return !!f && n(f.fuelL) >= 200 && n(f.fuelL) < 1000; },
      grade: function (f) { return null; },
      cycleMonths: null,
      anchor: "event",
      dueMonths: [],
      cycleText: "설치·변경 시",
      tasks: [
        "조례에 따른 소량위험물 저장·취급 신고 여부를 상주소방서에 확인 후 신고",
        "저장 장소 표지·게시판, 소화기, 방유턱 등 조례상 기준 확보"
      ],
      deadline: "",
      performer: "시설 담당자",
      records: "",
      penalty: "조례 위반 과태료",
      priority: "normal",
      verify: true,
      notes: "경상북도 조례상 신고 대상·기준 수치 확인 필요."
    },
    {
      id: "FIRE-300",
      domain: "소방",
      law: "다중이용업소의 안전관리에 관한 특별법",
      basis: "법 제9조·제13조의2, 시행규칙 제14조",
      lawUrl: LAW_MULTI,
      kind: "plan",
      title: "입점 다중이용업소 안전관리 확인",
      target: "휴게음식점·일반음식점 등 다중이용업소가 입점한 시설(임대·위탁)",
      applies: function (f) { return !!f && !!f.multiUseBiz; },
      grade: function (f) { return null; },
      cycleMonths: 3,
      anchor: "free",
      dueMonths: [],
      cycleText: "업주 안전시설등 정기점검 분기 1회 / 화재배상책임보험 매년 갱신",
      tasks: [
        "임대·위탁 계약 시 업주의 화재배상책임보험 가입증명 제출을 조건으로 명시하고 매년 갱신 확인",
        "업주의 안전시설등 분기 1회 정기점검(점검기록 1년 보관) 및 소방안전교육 이수 여부 확인",
        "영업장 내부구조 변경 시 소방서 완비증명 재발급 여부 확인"
      ],
      deadline: "",
      performer: "업주(1차 의무자), 시설 담당자(확인)",
      records: "",
      penalty: "업주: 보험 미가입 300만원 이하 과태료 등",
      priority: "normal",
      verify: true,
      notes: "1차 의무자는 다중이용업주. 건물 관계인으로서 확인·관리 업무로 구성."
    },
    {
      id: "FIRE-400",
      domain: "소방",
      law: "화재로 인한 재해보상과 보험가입에 관한 법률",
      basis: "법 제2조·제5조, 시행령 제2조",
      lawUrl: LAW_INS,
      kind: "insurance",
      title: "특수건물 화재보험(신체손해배상특약부) 가입",
      target: "국유·공유건물로서 연면적 1천㎡ 이상 등 특수건물",
      applies: function (f) { return !!f && n(f.area) >= 1000; },
      grade: function (f) { return "특수건물(공유건물)"; },
      cycleMonths: 12,
      anchor: "free",
      dueMonths: [],
      cycleText: "매년 갱신(만기 전), 신축·취득 시 사용승인일·소유권 취득일부터 30일 이내",
      tasks: [
        "한국지방재정공제회 건물공제 또는 보험사 특수건물 화재보험(신체손해배상특약부) 가입·갱신",
        "보험가액이 건물 시가에 맞는지 확인",
        "신축 건물은 사용승인 후 30일 이내 가입"
      ],
      deadline: "만기일 전 갱신",
      performer: "회계·재산관리 부서, 시설 담당자",
      records: "보험증권 보관",
      penalty: "미가입 500만원 이하 벌금",
      priority: "high",
      verify: true,
      notes: "공유건물 연면적 기준(1천㎡) 및 지방재정공제회 공제의 대체 인정 여부 확인 필요."
    },
    {
      id: "FIRE-410",
      domain: "소방",
      law: "화재로 인한 재해보상과 보험가입에 관한 법률",
      basis: "법 제16조",
      lawUrl: LAW_INS,
      kind: "inspection",
      title: "특수건물 안전점검(한국화재보험협회) 수검",
      target: "특수건물",
      applies: function (f) { return !!f && n(f.area) >= 1000; },
      grade: function (f) { return null; },
      cycleMonths: 12,
      anchor: "free",
      dueMonths: [],
      cycleText: "연 1회 협회 점검 시",
      tasks: [
        "한국화재보험협회 안전점검 일정 협의 및 현장 입회",
        "점검 지적사항 보수 후 결과 기록"
      ],
      deadline: "",
      performer: "한국화재보험협회(점검), 시설 담당자(수검)",
      records: "점검결과서 보관",
      penalty: "점검 거부·방해 시 과태료",
      priority: "normal",
      verify: true,
      notes: "협회 점검 주기·과태료 원문 확인 필요."
    },
    {
      id: "FIRE-500",
      domain: "소방",
      law: "문화유산의 보존 및 활용에 관한 법률",
      basis: "법 제14조(화재 등 방지 시책), 소방시설법 시행령 별표4(국보·보물 목조건축물 소방시설)",
      lawUrl: LAW_HERITAGE,
      kind: "plan",
      title: "국가유산 건축물 화재예방·방재",
      target: "국가지정·시도지정·등록 국가유산 건축물",
      applies: function (f) { return !!f && (f.heritage === "국가지정" || f.heritage === "시도지정" || f.heritage === "등록"); },
      grade: function (f) { return f && f.heritage ? (f.heritage + " 국가유산") : null; },
      cycleMonths: 12,
      anchor: "free",
      dueMonths: [],
      cycleText: "연 1회 이상 방재훈련, 상시 화기 관리",
      tasks: [
        "국가유산 방재매뉴얼(위기대응 현장조치 매뉴얼) 비치 및 갱신",
        "소방서·국가유산청과 합동 방재훈련(관행상 '문화유산 방재의 날' 2월 10일 전후)",
        "경내 화기 사용 금지 표지, 소화기·옥외소화전·자동화재속보설비 작동 확인, CCTV·경보설비 유지"
      ],
      deadline: "",
      performer: "국가유산 관리단체(상주시), 시설 담당자",
      records: "훈련 기록",
      penalty: "",
      priority: "normal",
      verify: true,
      notes: "국보·보물 목조건축물은 화재예방법상 2급 소방안전관리대상물."
    }
  );
})();
