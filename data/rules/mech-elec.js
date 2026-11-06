/* 설비 분야(승강기·전기·가스·에너지·기계설비·통신) 법정업무 규칙
 * 담당: law-mech-elec / 기준일: 2026-11 현행 법령
 * 주의: 2025.10 정부조직 개편으로 전기·가스·에너지 소관 일부가 기후에너지환경부로 이관됨(부령 명칭 변경). 조문 내용은 law.go.kr 원문으로 재확인 권장.
 */
(window.SJ_RULES = window.SJ_RULES || []).push(

  /* ───────────── 승강기 ───────────── */
  {
    id: "ELV-001",
    domain: "승강기",
    law: "승강기 안전관리법",
    basis: "법 제31조, 시행규칙 제53조",
    lawUrl: "https://www.law.go.kr/법령/승강기안전관리법",
    kind: "inspection",
    title: "승강기 자체점검 (월 1회)",
    target: "엘리베이터·에스컬레이터·무빙워크 등 승강기를 관리하는 관리주체",
    applies: (f) => ((f && f.elevators) || 0) + ((f && f.escalators) || 0) > 0,
    grade: (f) => null,
    cycleMonths: 1,
    anchor: "free",
    dueMonths: [],
    cycleText: "월 1회 이상",
    tasks: [
      "유지관리업체(또는 자격 갖춘 자)를 통해 월 1회 이상 자체점검 실시",
      "점검 결과를 승강기안전종합정보망에 입력되었는지 확인",
      "결함 발견 시 즉시 운행 중지 및 보수 조치",
      "유지관리 용역계약(표준계약서) 체결·갱신 관리"
    ],
    deadline: "자체점검 후 10일 이내 승강기안전종합정보망 입력",
    performer: "승강기 유지관리업자(관리주체 위탁)",
    records: "승강기안전종합정보망 등록(점검기록 3년 보존 권장)",
    penalty: "자체점검 미실시·결과 미입력 시 과태료(500만원 이하 등)",
    priority: "high",
    verify: true,
    notes: "입력 기한(10일)과 과태료 금액은 시행규칙·시행령 별표 재확인 필요. 설치검사 후 15년 이내·원격점검 등 요건 충족 시 3개월 주기 자체점검 특례 있음."
  },
  {
    id: "ELV-002",
    domain: "승강기",
    law: "승강기 안전관리법",
    basis: "법 제32조제1항제1호, 시행규칙 제54조",
    lawUrl: "https://www.law.go.kr/법령/승강기안전관리법시행규칙",
    kind: "inspection",
    title: "승강기 정기검사",
    target: "설치검사를 받은 모든 승강기",
    applies: (f) => ((f && f.elevators) || 0) + ((f && f.escalators) || 0) > 0,
    grade: (f) => {
      const y = (f && f.elevatorYear) || 0;
      if (!y) return "검사주기 1년 (설치연도 미상)";
      const age = 2026 - y;
      return age >= 25 ? "설치 25년 경과 — 6개월 주기" : "검사주기 1년";
    },
    cycleMonths: 12,
    anchor: "free",
    dueMonths: [],
    cycleText: "1년마다(설치검사일 기준 검사유효기간 만료 전), 설치검사 후 25년 경과 승강기는 6개월마다",
    tasks: [
      "검사유효기간 만료일 확인 후 한국승강기안전공단에 정기검사 신청",
      "검사 입회 및 부적합 사항 보수 후 재검사",
      "검사합격증명서 승강기 내부 게시"
    ],
    deadline: "검사유효기간 만료일 전후 30일 이내 수검",
    performer: "한국승강기안전공단(검사기관)",
    records: "검사합격증명서 게시, 정보망 이력 관리",
    penalty: "검사 미수검 승강기 운행 시 1천만원 이하 과태료 / 운행정지명령",
    priority: "high",
    verify: true,
    notes: "25년 경과 승강기 6개월 주기 단축은 시행규칙 제54조. 25년 기준은 '설치검사일' 기준이며 elevatorYear로 근사함."
  },
  {
    id: "ELV-003",
    domain: "승강기",
    law: "승강기 안전관리법",
    basis: "법 제32조제1항제3호, 시행규칙 제55조",
    lawUrl: "https://www.law.go.kr/법령/승강기안전관리법",
    kind: "inspection",
    title: "승강기 정밀안전검사 (15년 경과)",
    target: "설치검사 후 15년이 지난 승강기(이후 3년마다), 결함원인 불명확·중대사고 발생 등",
    applies: (f) => {
      const n = ((f && f.elevators) || 0) + ((f && f.escalators) || 0);
      const y = (f && f.elevatorYear) || 0;
      return n > 0 && y > 0 && (2026 - y) >= 15;
    },
    grade: (f) => null,
    cycleMonths: 36,
    anchor: "free",
    dueMonths: [],
    cycleText: "설치검사 후 15년 도래 시 및 그 후 3년마다",
    tasks: [
      "설치 후 15년 도래 승강기 목록 파악",
      "한국승강기안전공단에 정밀안전검사 신청",
      "정밀안전검사 결과 개선 권고사항 예산 반영(부품 교체·리모델링)"
    ],
    deadline: "15년 도래일 및 직전 정밀안전검사 후 3년 이내",
    performer: "한국승강기안전공단",
    records: "검사결과서 보관",
    penalty: "미수검 운행 시 과태료 / 운행정지",
    priority: "high",
    verify: false,
    notes: "정밀안전검사를 받은 해에는 정기검사를 받은 것으로 갈음."
  },
  {
    id: "ELV-004",
    domain: "승강기",
    law: "승강기 안전관리법",
    basis: "법 제29조, 시행규칙 제51조",
    lawUrl: "https://www.law.go.kr/법령/승강기안전관리법",
    kind: "appointment",
    title: "승강기 안전관리자 선임 및 보고",
    target: "승강기 관리주체(관리주체가 직접 관리하지 않는 경우 안전관리자 선임)",
    applies: (f) => ((f && f.elevators) || 0) + ((f && f.escalators) || 0) > 0,
    grade: (f) => null,
    cycleMonths: null,
    anchor: "event",
    dueMonths: [],
    cycleText: "선임·변경 사유 발생 시",
    tasks: [
      "승강기 안전관리자 선임(시설 담당 공무원 등)",
      "선임 후 승강기안전종합정보망에 선임 등록(보고)",
      "인사이동 시 후임자 재선임 및 변경 등록"
    ],
    deadline: "선임 후 3개월 이내 정보망 보고(등록)",
    performer: "관리주체(시설 소관부서)",
    records: "승강기안전종합정보망 등록",
    penalty: "미선임·미보고 시 과태료",
    priority: "high",
    verify: true,
    notes: "보고 기한은 시행규칙 원문 확인 필요."
  },
  {
    id: "ELV-005",
    domain: "승강기",
    law: "승강기 안전관리법",
    basis: "법 제29조제3항, 시행규칙 제52조",
    lawUrl: "https://www.law.go.kr/법령/승강기안전관리법",
    kind: "education",
    title: "승강기 안전관리자 법정교육",
    target: "선임된 승강기 안전관리자",
    applies: (f) => ((f && f.elevators) || 0) + ((f && f.escalators) || 0) > 0,
    grade: (f) => null,
    cycleMonths: 36,
    anchor: "free",
    dueMonths: [],
    cycleText: "선임 후 3개월 이내 최초교육, 이후 3년마다 정기교육",
    tasks: [
      "한국승강기안전공단 승강기 안전교육(온라인 가능) 신청·이수",
      "이수증 보관 및 정보망 이수 확인"
    ],
    deadline: "선임 후 3개월 이내",
    performer: "승강기 안전관리자 본인",
    records: "교육 이수증 보관",
    penalty: "교육 미이수 시 과태료",
    priority: "normal",
    verify: true,
    notes: ""
  },
  {
    id: "ELV-006",
    domain: "승강기",
    law: "승강기 안전관리법",
    basis: "법 제30조, 시행령 제27조, 시행규칙 제52조의2",
    lawUrl: "https://www.law.go.kr/법령/승강기안전관리법",
    kind: "insurance",
    title: "승강기 사고배상책임보험 가입",
    target: "승강기 관리주체",
    applies: (f) => ((f && f.elevators) || 0) + ((f && f.escalators) || 0) > 0,
    grade: (f) => null,
    cycleMonths: 12,
    anchor: "free",
    dueMonths: [],
    cycleText: "보험기간 만료 전 매년 갱신",
    tasks: [
      "사망 1인당 8천만원 이상(실손 1.5억 기준 등) 보상한도 충족 여부 확인 후 가입·갱신",
      "가입 사실 승강기안전종합정보망 입력 확인(보험사 입력)"
    ],
    deadline: "설치검사 전 또는 관리주체 변경 시 즉시, 가입 후 30일 이내 정보망 입력",
    performer: "관리주체(시 공제·보험 계약)",
    records: "보험증권 보관",
    penalty: "미가입 시 과태료",
    priority: "high",
    verify: true,
    notes: "보상한도: 사망 1인당 8천만원 이상(시행령 제27조). 구체 금액·입력 기한 재확인 필요. 지방자치단체 배상공제 가입으로 갈음 가능 여부 확인."
  },

  /* ───────────── 전기 ───────────── */
  {
    id: "ELEC-001",
    domain: "전기",
    law: "전기안전관리법",
    basis: "법 제22조, 시행규칙 제25조~제26조 별표8·별표9",
    lawUrl: "https://www.law.go.kr/법령/전기안전관리법",
    kind: "appointment",
    title: "전기안전관리자 선임(또는 대행)",
    target: "자가용전기설비 설치자(고압·특고압 수전, 저압 75kW 이상 수전 등). 소규모는 한국전기안전공사·대행사업자·개인대행자 대행 가능",
    applies: (f) => !!f && (f.voltage === "고압" || f.voltage === "특고압" || (f.receivingKW || 0) >= 75 || (f.generatorKW || 0) > 0 || (f.solarKW || 0) > 0),
    grade: (f) => {
      const kw = (f && f.receivingKW) || 0;
      if (kw >= 1000) return "상주 안전관리자 직접선임 대상(대행 불가 규모)";
      if (kw >= 500) return "대행사업자 대행 가능(개인대행 불가) 규모";
      if (kw > 0) return "대행 가능 규모(안전공사·대행사업자·개인대행자)";
      return null;
    },
    cycleMonths: null,
    anchor: "event",
    dueMonths: [],
    cycleText: "사용전검사 전 선임, 해임·퇴직 시 30일 이내 재선임",
    tasks: [
      "수전용량·전압 확인 후 직접선임 또는 대행계약 결정",
      "전기안전관리자 선임 신고(한국전기기술인협회, 전기안전관리자 선임신고 시스템)",
      "해임·퇴직·인사이동 시 30일 이내 재선임 및 신고",
      "대행계약 만료일 관리"
    ],
    deadline: "선임(해임)일부터 30일 이내 선임신고",
    performer: "시설 소관부서",
    records: "선임신고증명서 보관",
    penalty: "미선임 시 벌칙(3년 이하 징역 또는 3천만원 이하 벌금) / 미신고 과태료",
    priority: "critical",
    verify: true,
    notes: "대행 범위: 안전공사·대행사업자 전기수용설비 1천kW 미만, 개인대행자 500kW 미만, 태양광·비상발전기 별도 상한(시행규칙 제26조). 수치 재확인 필요."
  },
  {
    id: "ELEC-002",
    domain: "전기",
    law: "전기안전관리법",
    basis: "법 제22조, 「전기안전관리자의 직무에 관한 고시」, 시행규칙 별표9(점검횟수)",
    lawUrl: "https://www.law.go.kr/법령/전기안전관리법",
    kind: "inspection",
    title: "전기설비 월차 점검(전기안전관리자 직무)",
    target: "전기안전관리자 선임(대행) 대상 자가용전기설비",
    applies: (f) => !!f && (f.voltage === "고압" || f.voltage === "특고압" || (f.receivingKW || 0) >= 75),
    grade: (f) => {
      const kw = (f && f.receivingKW) || 0;
      const lv = !f || f.voltage === "저압" || !f.voltage;
      if (lv) return kw > 300 ? "저압 300kW 초과 — 월 2회 이상" : "저압 — 월 1회 이상";
      if (kw <= 300) return "고압 300kW 이하 — 월 1회 이상";
      if (kw <= 500) return "고압 300~500kW — 월 2회 이상";
      if (kw <= 700) return "고압 500~700kW — 월 3회 이상";
      if (kw <= 1500) return "고압 700~1,500kW — 월 4회 이상";
      return "고압 1,500kW 초과 — 월 5회 이상(대행 불가 시 상주)";
    },
    cycleMonths: 1,
    anchor: "free",
    dueMonths: [],
    cycleText: "용량별 월 1~6회 이상(시행규칙 별표9)",
    tasks: [
      "전기안전관리자(대행자) 월차 점검 실시 확인",
      "점검 기록부(전기안전관리시스템 입력) 확인·서명",
      "무정전전원장치(UPS) 월 1회 이상 점검 포함 여부 확인",
      "지적사항 개선 조치"
    ],
    deadline: "점검 결과 전기안전관리시스템 기록",
    performer: "전기안전관리자(또는 대행자)",
    records: "점검기록 4년 보존",
    penalty: "직무 미수행 시 과태료",
    priority: "high",
    verify: true,
    notes: "용량 구간별 점검횟수는 근사치. 시행규칙 별표9 원문으로 확인 필요. 기록 보존기간도 확인 필요."
  },
  {
    id: "ELEC-003",
    domain: "전기",
    law: "전기안전관리법",
    basis: "법 제11조, 시행규칙 제10조 별표4",
    lawUrl: "https://www.law.go.kr/법령/전기안전관리법시행규칙",
    kind: "inspection",
    title: "자가용전기설비 정기검사(수전설비·비상발전기)",
    target: "고압 이상 수전설비 및 비상용 예비발전설비 등 자가용전기설비",
    applies: (f) => !!f && (f.voltage === "고압" || f.voltage === "특고압" || (f.generatorKW || 0) > 0),
    grade: (f) => {
      const two = !!f && (f.subUse === "공연장" || f.subUse === "보건소" || f.buildingUse === "의료시설" || !!f.heritage);
      return two ? "2년 주기(다중이용·의료·공연장·지정문화유산 등)" : "3년 주기";
    },
    cycleMonths: 36,
    anchor: "free",
    dueMonths: [],
    cycleText: "3년마다(공연장·의료시설·지정문화유산 등은 2년마다), 검사시기 전후 1개월",
    tasks: [
      "한국전기안전공사 정기검사 일정 통보 확인",
      "검사 입회(정전 일정 조율)",
      "불합격 시 개선 후 재검사"
    ],
    deadline: "검사 결과 불합격 시 개선 기간 내 재검사",
    performer: "한국전기안전공사",
    records: "검사확인증 보관",
    penalty: "검사 미수검 시 벌칙(1년 이하 징역 또는 1천만원 이하 벌금)",
    priority: "critical",
    verify: true,
    notes: "2023.1.1부터 75kW 미만 비상발전기도 정기검사 대상. 2년/3년 구분 대상 업종은 별표4 원문 확인."
  },
  {
    id: "ELEC-004",
    domain: "전기",
    law: "전기안전관리법",
    basis: "법 제11조, 시행규칙 별표4",
    lawUrl: "https://www.law.go.kr/법령/전기안전관리법시행규칙",
    kind: "inspection",
    title: "태양광발전설비 정기검사",
    target: "자가용 태양광발전설비(건물 옥상·부지 설치)",
    applies: (f) => ((f && f.solarKW) || 0) > 0,
    grade: (f) => null,
    cycleMonths: 48,
    anchor: "free",
    dueMonths: [],
    cycleText: "4년 이내마다(농지·임야 등 설치는 2년)",
    tasks: [
      "한국전기안전공사 정기검사 수검",
      "모듈·인버터·접속반 상태 및 구조물 점검",
      "ESS 병설 시 ESS 정기검사(1~2년) 별도 확인"
    ],
    deadline: "검사시기 도래 전",
    performer: "한국전기안전공사",
    records: "검사확인증 보관",
    penalty: "미수검 시 벌칙",
    priority: "high",
    verify: true,
    notes: "태양광 안전관리자 선임(대행)도 필요. ESS: 다중이용건축물 설치 또는 1,000kWh 이상은 1년, 그 외 2년."
  },
  {
    id: "ELEC-005",
    domain: "전기",
    law: "전기안전관리법",
    basis: "법 제12조, 시행규칙 제13조",
    lawUrl: "https://www.law.go.kr/법령/전기안전관리법",
    kind: "inspection",
    title: "일반용전기설비 정기점검",
    target: "저압 75kW 미만 수전 등 일반용전기설비(전기안전관리자 선임 대상이 아닌 소규모 시설)",
    applies: (f) => !!f && (f.voltage === "저압" || !f.voltage) && (f.receivingKW || 0) > 0 && (f.receivingKW || 0) < 75,
    grade: (f) => null,
    cycleMonths: 36,
    anchor: "free",
    dueMonths: [],
    cycleText: "3년마다(다중이용시설 등은 2년 또는 1년)",
    tasks: [
      "한국전기안전공사 정기점검 수검(방문 일정 협조)",
      "부적합 시 개선 후 재점검 요청"
    ],
    deadline: "부적합 통지 후 개선 기간 내",
    performer: "한국전기안전공사",
    records: "점검결과 보관",
    penalty: "점검 거부 시 과태료",
    priority: "normal",
    verify: true,
    notes: "경로당 등 소규모 시설 해당. 주기는 시설 용도별 상이."
  },

  /* ───────────── 가스·에너지 ───────────── */
  {
    id: "GAS-001",
    domain: "가스·에너지",
    law: "도시가스사업법",
    basis: "법 제17조, 시행규칙 제20조의2·제22조(정기검사)",
    lawUrl: "https://www.law.go.kr/법령/도시가스사업법",
    kind: "inspection",
    title: "특정가스사용시설 정기검사(도시가스)",
    target: "월사용예정량 2천㎥ 이상(제1종 보호시설 내 1천㎥ 이상) 도시가스 사용시설 등",
    applies: (f) => !!f && f.gasType === "도시가스" && ((f.area || 0) >= 1000 || (f.boilers || 0) > 0),
    grade: (f) => "월사용예정량 확인 필요",
    cycleMonths: 12,
    anchor: "approval",
    dueMonths: [],
    cycleText: "완성검사 후 매 1년마다(완성검사필증 교부일 기준 전후 30일)",
    tasks: [
      "월사용예정량(보일러·취사 등 연소기 용량 합산)으로 특정가스사용시설 해당 여부 확인",
      "한국가스안전공사 정기검사 신청·수검",
      "부적합 사항 개선"
    ],
    deadline: "정기검사 기한 전후 30일 이내",
    performer: "한국가스안전공사",
    records: "검사증명서 보관",
    penalty: "미수검 시 벌금 또는 과태료",
    priority: "high",
    verify: true,
    notes: "applies는 대략 추정(연면적·보일러 유무). 실제 대상 여부는 월사용예정량 산정 필요."
  },
  {
    id: "GAS-002",
    domain: "가스·에너지",
    law: "도시가스사업법",
    basis: "법 제29조, 시행령 제15조 별표1",
    lawUrl: "https://www.law.go.kr/법령/도시가스사업법",
    kind: "appointment",
    title: "특정가스사용시설 안전관리자 선임",
    target: "특정가스사용시설 중 월사용예정량 4천㎥ 초과 등 선임 대상 시설",
    applies: (f) => !!f && f.gasType === "도시가스" && (f.area || 0) >= 5000 && (f.boilers || 0) > 0,
    grade: (f) => null,
    cycleMonths: null,
    anchor: "event",
    dueMonths: [],
    cycleText: "선임·해임 시",
    tasks: [
      "안전관리책임자 선임 및 시·군 신고",
      "해임 시 30일 이내 재선임",
      "선임 후 한국가스안전공사 신규·정기 교육(3년마다) 이수"
    ],
    deadline: "선임·해임일부터 30일 이내 신고",
    performer: "시설 소관부서",
    records: "선임신고서 사본",
    penalty: "미선임 시 벌금 / 미신고 과태료",
    priority: "high",
    verify: true,
    notes: "선임 기준 사용량(4천㎥ 초과 등) 재확인 필요. applies는 대규모 보일러 시설 추정."
  },
  {
    id: "GAS-003",
    domain: "가스·에너지",
    law: "액화석유가스의 안전관리 및 사업법",
    basis: "법 제44조, 시행규칙 제71조·제73조",
    lawUrl: "https://www.law.go.kr/법령/액화석유가스의안전관리및사업법",
    kind: "inspection",
    title: "LPG 특정사용시설 정기검사",
    target: "저장능력 250kg 초과(자동절체기 사용 시 500kg 초과) LPG 사용시설, 공동주택·다중이용시설 등",
    applies: (f) => !!f && f.gasType === "LPG" && (f.lpgKg || 0) > 250,
    grade: (f) => ((f && f.lpgKg) || 0) > 1000 ? "저장능력 1톤 초과(저장탱크 등)" : "저장능력 250kg 초과",
    cycleMonths: 12,
    anchor: "approval",
    dueMonths: [],
    cycleText: "완성검사 후 매 1년마다",
    tasks: [
      "LPG 저장능력·용기 수량 확인",
      "한국가스안전공사 정기검사 수검",
      "공급자 안전점검(6개월 1회) 결과 확인"
    ],
    deadline: "검사기한 전후 30일",
    performer: "한국가스안전공사",
    records: "검사증명서 보관",
    penalty: "미수검 시 벌금 또는 과태료",
    priority: "high",
    verify: true,
    notes: ""
  },
  {
    id: "GAS-004",
    domain: "가스·에너지",
    law: "액화석유가스의 안전관리 및 사업법",
    basis: "법 제34조, 시행령 제15조 별표1",
    lawUrl: "https://www.law.go.kr/법령/액화석유가스의안전관리및사업법",
    kind: "appointment",
    title: "LPG 사용시설 안전관리책임자 선임",
    target: "저장능력 250kg 초과 LPG 특정사용시설",
    applies: (f) => !!f && f.gasType === "LPG" && (f.lpgKg || 0) > 250,
    grade: (f) => null,
    cycleMonths: null,
    anchor: "event",
    dueMonths: [],
    cycleText: "선임·해임 시, 교육 3년마다",
    tasks: [
      "안전관리책임자 선임 및 시 신고",
      "한국가스안전공사 사용시설 안전관리자 교육 이수(선임 후 6개월 이내, 이후 3년마다)"
    ],
    deadline: "선임·해임일부터 30일 이내 신고",
    performer: "시설 소관부서",
    records: "선임신고 확인서, 교육 이수증",
    penalty: "미선임 벌금 / 미신고·미교육 과태료",
    priority: "high",
    verify: true,
    notes: ""
  },
  {
    id: "GAS-005",
    domain: "가스·에너지",
    law: "에너지이용 합리화법",
    basis: "법 제39조, 시행규칙 제31조의8·별표3의3(검사대상기기)",
    lawUrl: "https://www.law.go.kr/법령/에너지이용합리화법",
    kind: "inspection",
    title: "검사대상기기(보일러) 계속사용검사",
    target: "가스사용량 17kg/h 초과 가스보일러, 강철제·주철제 보일러(최고사용압력 0.1MPa 초과 등), 소형온수보일러(가스 사용) 등",
    applies: (f) => !!f && (f.boilers || 0) > 0 && (f.boilerKind === "가스" || f.boilerKind === "기름"),
    grade: (f) => null,
    cycleMonths: 12,
    anchor: "free",
    dueMonths: [],
    cycleText: "안전검사 1년마다(운전성능검사 대상은 별도)",
    tasks: [
      "보일러 명판(용량·압력)으로 검사대상기기 해당 여부 확인",
      "한국에너지공단 계속사용검사(안전검사) 신청·수검",
      "검사증 보일러실 게시"
    ],
    deadline: "검사유효기간 만료 전",
    performer: "한국에너지공단",
    records: "검사증 보관",
    penalty: "미검사 사용 시 1년 이하 징역 또는 1천만원 이하 벌금",
    priority: "critical",
    verify: true,
    notes: "소형 가정용 가스보일러(가스사용량 17kg/h 이하)는 대상 아님. 용량 기준 재확인 필요."
  },
  {
    id: "GAS-006",
    domain: "가스·에너지",
    law: "에너지이용 합리화법",
    basis: "법 제40조, 시행규칙 제31조의26·별표3의9",
    lawUrl: "https://www.law.go.kr/법령/에너지이용합리화법",
    kind: "appointment",
    title: "검사대상기기관리자 선임",
    target: "검사대상기기(보일러 등) 설치자",
    applies: (f) => !!f && (f.boilers || 0) > 0 && (f.boilerKind === "가스" || f.boilerKind === "기름"),
    grade: (f) => null,
    cycleMonths: null,
    anchor: "event",
    dueMonths: [],
    cycleText: "선임·해임 시, 관리자 교육 3년마다",
    tasks: [
      "에너지관리기능사 등 자격자 또는 교육이수자 선임",
      "한국에너지공단에 선임신고",
      "해임·퇴직 시 30일 이내 재선임",
      "검사대상기기관리자 교육(3년마다) 이수"
    ],
    deadline: "선임·해임일부터 30일 이내 신고",
    performer: "시설 소관부서",
    records: "선임신고 확인서",
    penalty: "미선임 시 1천만원 이하 벌금",
    priority: "critical",
    verify: true,
    notes: ""
  },
  {
    id: "GAS-007",
    domain: "가스·에너지",
    law: "공공기관 에너지이용 합리화 추진에 관한 규정",
    basis: "규정 제12조(에너지진단), 에너지이용 합리화법 제32조",
    lawUrl: "https://www.law.go.kr/행정규칙/공공기관에너지이용합리화추진에관한규정",
    kind: "inspection",
    title: "공공건축물 에너지진단",
    target: "연면적 3천㎡ 이상 공공기관 건축물",
    applies: (f) => ((f && f.area) || 0) >= 3000,
    grade: (f) => null,
    cycleMonths: 60,
    anchor: "free",
    dueMonths: [],
    cycleText: "5년마다",
    tasks: [
      "에너지진단 전문기관 선정(한국에너지공단 등)",
      "진단 결과 개선안 이행계획 수립 및 예산 반영",
      "진단 결과 보고"
    ],
    deadline: "진단 후 개선 이행실적 보고",
    performer: "에너지진단 전문기관",
    records: "진단보고서 보관",
    penalty: "벌칙 없음(공공기관 평가 반영)",
    priority: "normal",
    verify: true,
    notes: "연면적 기준·주기는 규정 원문 확인 필요. 연간 에너지사용량 2천TOE 이상이면 에너지이용 합리화법 제32조 에너지다소비사업자 진단(5년) 별도."
  },
  {
    id: "GAS-008",
    domain: "가스·에너지",
    law: "공공기관 에너지이용 합리화 추진에 관한 규정",
    basis: "규정 제14조(냉난방 온도 관리) 및 정부 동·하절기 에너지절약 추진방안",
    lawUrl: "https://www.law.go.kr/행정규칙/공공기관에너지이용합리화추진에관한규정",
    kind: "measure",
    title: "적정 실내온도 유지·관리",
    target: "공공기관 건축물 전체",
    applies: (f) => !!f,
    grade: (f) => null,
    cycleMonths: 6,
    anchor: "fixed",
    dueMonths: [6, 12],
    cycleText: "냉방기(6~9월)·난방기(12~3월) 시즌별",
    tasks: [
      "냉방 시 평균 28℃ 이상(비전기식 냉방 26℃), 난방 시 평균 18℃ 이하 유지(당해 추진방안 기준 우선)",
      "실내 온도계 비치 및 점검",
      "에너지절약 추진실적 보고"
    ],
    deadline: "추진방안에 따른 실적 보고",
    performer: "시설 담당자",
    records: "온도 점검 기록",
    penalty: "벌칙 없음(평가 반영)",
    priority: "normal",
    verify: true,
    notes: "연도별 추진방안에서 기준 완화(냉방 26℃, 난방 20℃ 등)된 사례 있음. 당해 연도 공문 확인. 보건소·어린이집·경로당 등은 예외 적용."
  },
  {
    id: "GAS-009",
    domain: "가스·에너지",
    law: "고압가스 안전관리법",
    basis: "법 제4조, 시행령 제4조, 시행규칙 제39조(정기검사)",
    lawUrl: "https://www.law.go.kr/법령/고압가스안전관리법",
    kind: "inspection",
    title: "냉동제조시설 정기검사·안전관리자",
    target: "냉동능력 20톤 이상(가연성·독성 외 냉매는 50톤 이상) 냉동제조 허가 시설, 3톤 이상 신고 시설",
    applies: (f) => ((f && f.chillerRT) || 0) >= 20,
    grade: (f) => ((f && f.chillerRT) || 0) >= 50 ? "냉동제조 허가 대상 추정" : "냉동제조 신고 대상 추정",
    cycleMonths: 12,
    anchor: "free",
    dueMonths: [],
    cycleText: "허가 시설 정기검사 매 1년(냉매 종류 등에 따라 상이)",
    tasks: [
      "냉동기 명판 냉동능력·냉매 종류 확인(흡수식 냉온수기는 대상 아님)",
      "허가·신고 대상이면 한국가스안전공사 정기검사 수검",
      "냉동제조 안전관리자 선임 여부 확인"
    ],
    deadline: "검사 기한 전후 30일",
    performer: "한국가스안전공사",
    records: "검사증명서 보관",
    penalty: "미수검 시 벌금",
    priority: "high",
    verify: true,
    notes: "냉동능력 기준·정기검사 주기 재확인 필요. 흡수식 냉동기는 고압가스법 대상에서 제외."
  },

  /* ───────────── 기계설비·통신 ───────────── */
  {
    id: "MECH-001",
    domain: "기계설비·통신",
    law: "기계설비법",
    basis: "법 제19조, 시행령 제14조·제15조 별표5",
    lawUrl: "https://www.law.go.kr/법령/기계설비법",
    kind: "appointment",
    title: "기계설비유지관리자 선임",
    target: "연면적 1만㎡ 이상 건축물(창고시설 제외) 및 국토교통부장관 고시 공공건축물 등",
    applies: (f) => ((f && f.area) || 0) >= 10000 && !(f && f.buildingUse === "창고시설"),
    grade: (f) => {
      const a = (f && f.area) || 0;
      if (a >= 60000) return "특급 1명 + 보조 1명";
      if (a >= 30000) return "고급 1명 + 보조 1명";
      if (a >= 15000) return "중급 1명";
      return "초급 1명";
    },
    cycleMonths: null,
    anchor: "event",
    dueMonths: [],
    cycleText: "선임·해임 시, 유지관리교육 3년마다",
    tasks: [
      "연면적에 따른 등급의 유지관리자 선임(또는 위탁)",
      "선임 후 30일 이내 시장에게 선임신고(기계설비 유지관리자 선임신고)",
      "해임 시 30일 이내 재선임",
      "유지관리자 신규·보수교육 이수 확인"
    ],
    deadline: "선임일부터 30일 이내 신고",
    performer: "시설 소관부서",
    records: "선임신고 확인증",
    penalty: "미선임 500만원 이하 과태료",
    priority: "high",
    verify: true,
    notes: "1만㎡ 미만 공공건축물·학교 등 고시 대상 확대 경과는 시행령 부칙 및 국토부 고시 확인 필요. 임시등급 인정기간 2027.4.17까지 연장(시행규칙 2026.6.1 시행)."
  },
  {
    id: "MECH-002",
    domain: "기계설비·통신",
    law: "기계설비법",
    basis: "법 제17조, 시행규칙 제2조, 「기계설비 유지관리기준」 고시",
    lawUrl: "https://www.law.go.kr/법령/기계설비법",
    kind: "inspection",
    title: "기계설비 성능점검(연 1회)",
    target: "기계설비유지관리자 선임 대상 건축물",
    applies: (f) => ((f && f.area) || 0) >= 10000 && !(f && f.buildingUse === "창고시설"),
    grade: (f) => null,
    cycleMonths: 12,
    anchor: "free",
    dueMonths: [],
    cycleText: "연 1회 이상",
    tasks: [
      "기계설비성능점검업자 용역 발주",
      "성능점검 결과보고서 검토 및 개선 조치",
      "유지관리 실적(성능점검 결과) 보고"
    ],
    deadline: "점검 결과 10년 보존, 요청 시 제출",
    performer: "기계설비성능점검업자",
    records: "성능점검기록 10년 보존",
    penalty: "미실시 500만원 이하 과태료",
    priority: "high",
    verify: true,
    notes: "유지관리 대상 범위는 MECH-001과 동일 기준 적용."
  },
  {
    id: "MECH-003",
    domain: "기계설비·통신",
    law: "기계설비법",
    basis: "법 제17조, 「기계설비 유지관리기준」 고시",
    lawUrl: "https://www.law.go.kr/법령/기계설비법",
    kind: "inspection",
    title: "기계설비 유지관리점검(반기 1회)",
    target: "기계설비유지관리자 선임 대상 건축물",
    applies: (f) => ((f && f.area) || 0) >= 10000 && !(f && f.buildingUse === "창고시설"),
    grade: (f) => null,
    cycleMonths: 6,
    anchor: "free",
    dueMonths: [],
    cycleText: "연 2회 이상(성능점검 시기 제외 가능)",
    tasks: [
      "유지관리자가 유지관리점검표에 따라 점검",
      "점검 결과 기록 및 보수"
    ],
    deadline: "점검 결과 기록",
    performer: "기계설비유지관리자",
    records: "유지관리점검기록 보존",
    penalty: "과태료",
    priority: "normal",
    verify: true,
    notes: ""
  },
  {
    id: "MECH-004",
    domain: "기계설비·통신",
    law: "정보통신공사업법",
    basis: "법 제37조의2, 시행령 제37조의2·제37조의3, 「정보통신설비 유지보수·관리 및 성능점검 기준」 고시",
    lawUrl: "https://www.law.go.kr/법령/정보통신공사업법",
    kind: "appointment",
    title: "정보통신설비 유지보수·관리자 선임",
    target: "연면적 5천㎡ 이상 건축물(공동주택·초중고 제외). 3만㎡ 이상 2025.7.19, 1만~3만㎡ 2026.7.19, 5천~1만㎡ 2027.7.19부터",
    applies: (f) => ((f && f.area) || 0) >= 5000,
    grade: (f) => {
      const a = (f && f.area) || 0;
      const g = a >= 60000 ? "특급" : a >= 30000 ? "고급" : a >= 15000 ? "중급" : "초급";
      return g + " 이상 1명" + (a < 10000 ? " (2027.7.19부터 의무)" : "");
    },
    cycleMonths: null,
    anchor: "event",
    dueMonths: [],
    cycleText: "선임·해임 시",
    tasks: [
      "정보통신기술자 + 유지보수·관리자 인정교육(20시간) 이수자 선임 또는 위탁",
      "선임·해임일부터 30일 이내 시에 신고",
      "적용 시기 도래 여부 확인"
    ],
    deadline: "선임·해임일부터 30일 이내 신고",
    performer: "시설 소관부서(정보통신 담당)",
    records: "선임신고 확인서",
    penalty: "미선임 300만원 이하 과태료(일정 기간 유예)",
    priority: "high",
    verify: true,
    notes: "단계적 시행 일정은 지자체 안내자료 기준. 과태료 유예기간 확인 필요."
  },
  {
    id: "MECH-005",
    domain: "기계설비·통신",
    law: "정보통신공사업법",
    basis: "법 제37조의2, 시행령 제37조의2, 「정보통신설비 유지보수·관리 및 성능점검 기준」 고시",
    lawUrl: "https://www.law.go.kr/법령/정보통신공사업법",
    kind: "inspection",
    title: "정보통신설비 성능점검(연 1회)",
    target: "정보통신설비 유지보수·관리 대상 건축물(연면적 5천㎡ 이상, 단계적 시행)",
    applies: (f) => ((f && f.area) || 0) >= 5000,
    grade: (f) => null,
    cycleMonths: 12,
    anchor: "free",
    dueMonths: [],
    cycleText: "연 1회 이상",
    tasks: [
      "정보통신설비(구내통신·방송·CCTV·네트워크 등) 성능점검 실시(용역 또는 관리자)",
      "성능점검표 작성 및 결과 보관",
      "유지보수·관리 기록 작성"
    ],
    deadline: "점검기록 보존",
    performer: "유지보수·관리자 또는 정보통신공사업자/용역업체",
    records: "유지보수·관리 및 성능점검 기록 5년 보존",
    penalty: "미실시 과태료",
    priority: "normal",
    verify: true,
    notes: "기록 보존기간 및 과태료 금액 확인 필요."
  },
  {
    id: "MECH-006",
    domain: "기계설비·통신",
    law: "환경친화적 자동차의 개발 및 보급 촉진에 관한 법률",
    basis: "법 제11조의2, 시행령 제18조의5~제18조의7",
    lawUrl: "https://www.law.go.kr/법령/환경친화적자동차의개발및보급촉진에관한법률",
    kind: "maintenance",
    title: "전기차 충전시설 유지관리 및 충전구역 관리",
    target: "전기차 충전시설·전용주차구역 설치 시설",
    applies: (f) => !!(f && f.evCharger),
    grade: (f) => null,
    cycleMonths: 12,
    anchor: "free",
    dueMonths: [],
    cycleText: "상시 관리(충전기 고장 시 수리), 연 1회 이상 점검 권장",
    tasks: [
      "충전기 작동상태·안전표지 점검",
      "충전구역 표시 및 일반차량 주차 단속 협조",
      "급속충전기 정기검사·전기안전 점검 여부 확인",
      "지하주차장 충전시설 화재안전 대책(소방 분야) 확인"
    ],
    deadline: "고장 시 신속 수리",
    performer: "시설 담당자 / 충전사업자",
    records: "점검 기록",
    penalty: "의무 설치 미이행 시 이행강제금(설치 의무 대상)",
    priority: "normal",
    verify: true,
    notes: "공공건물 충전기 설치 의무비율(신축 5%, 기존 2% 등)은 별도 확인. 점검 주기는 법정 아님(권장)."
  }
);
