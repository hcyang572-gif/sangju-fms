/* 상주시 소유·관리 공공시설 기초데이터 (SJ-FMS)
 * 데이터 계약: docs/SCHEMA.md
 * 조사 기준일: 2026-11. 주소·개관연도·일부 연면적은 언론보도·관광공사/관광정보·국가보훈부 자료로 확인(note에 출처 요지).
 * 건축물대장으로 확인되지 않은 속성(연면적·층수·설비 등)은 모두 추정치 → dataSource:"추정".
 *   추정 원칙(일관 적용, 아래 est() 참조):
 *   - 스프링클러: 연면적 5천㎡ 이상 또는 지상 6층 이상, 노유자시설 600㎡ 이상 (소방시설법 시행령 별표4 기준 근사)
 *   - 옥내소화전: 연면적 1,500㎡ 이상 / 자동화재탐지: 1천㎡ 이상(근린·의료 600㎡, 노유자 400㎡)
 *   - 승강기: 지상 2층 이상 & 500㎡ 이상 1대, 5천㎡ 이상 2대, 1만㎡ 이상 3대 (장애인등편의법 고려)
 *   - 수전: 연면적×0.12kW 근사, 100kW 이상이면 22.9kV 특고압 수전
 *   - 비상발전기: 스프링클러 설치 시 수전용량의 약 30%, 경유 저장 400L
 *   - 동(洞) 지역 도시가스·공공하수도, 읍면 지역 LPG·정화조(오수처리시설)
 * 담당자는 건축물대장 조회(SJ_API) 또는 직접 수정으로 값을 확정할 것.
 */
(function () {
  var DONG_AREA = /상주시 (상산로|중앙로|용마로|영남제일로|북상주로|냉림|만산|발산로|북천로|복룡|성동|계산동|남성동|복룡동|무양동|도남동|냉림동)/;

  function est(o) {
    // 건축물대장(data/registry.js) 값이 있으면 추정치를 대체 → 아래 설비 추정은 실제 연면적·층수로 재계산
    var R = (window.SJ_REGISTRY || {})[o.id];
    if (R) {
      var m = {}, rk;
      for (rk in o) if (Object.prototype.hasOwnProperty.call(o, rk)) m[rk] = o[rk];
      for (rk in R) if (rk !== "_reg" && R[rk] !== undefined && R[rk] !== null) m[rk] = R[rk];
      if (R.approvalDate == null) delete m.approvalDate;
      if (R._reg) m.note = "[건축물대장] " + (R._reg.bldNm || "") + " " + (R._reg.newPlatPlc || R._reg.platPlc || "") +
        " · 주용도 " + (R._reg.mainPurps || "") + (R._reg.buildings > 1 ? " · " + R._reg.buildings + "개 동 합산" : "") +
        " (설비 항목은 연면적 기준 추정) / " + (o.note || "");
      o = m;
    }
    var f = {
      id: "", name: "", category: "기타", address: "", jibun: "", dept: "",
      buildingUse: "기타", subUse: "", approvalDate: null,
      area: null, floorsAbove: null, floorsBelow: null, height: null, structure: "철근콘크리트조",
      sprinkler: false, simpleSprinkler: false, indoorHydrant: false, autoDetection: false,
      waterSpray: false, smokeControl: false, elevators: 0, escalators: 0, elevatorYear: null,
      receivingKW: null, voltage: null, generatorKW: null, solarKW: null, fuelL: null,
      gasType: "없음", lpgKg: null, boilers: 0, boilerKind: "없음", chillerRT: null,
      waterTankM3: null, sewage: "공공하수도", sewageCapacity: null,
      playground: false, seats: null, sportsFacility: false, heritage: "",
      asbestos: false, multiUseBiz: false, childcare: false, elderly: false,
      workers: null, evCharger: false, summary: "", safetyGrade: "", lastRepair: "",
      dataSource: "추정", note: ""
    };
    var k;
    for (k in o) if (Object.prototype.hasOwnProperty.call(o, k)) f[k] = o[k];

    var a = f.area || 0, fl = f.floorsAbove || 0, use = f.buildingUse;
    var urban = DONG_AREA.test(f.address);
    function d(key, val) { if (!Object.prototype.hasOwnProperty.call(o, key)) f[key] = val; }

    d("sprinkler", a >= 5000 || fl >= 6 || (use === "노유자시설" && a >= 600));
    d("simpleSprinkler", use === "노유자시설" && a > 0 && a < 600);
    d("indoorHydrant", a >= 1500);
    d("autoDetection", a >= 1000 || ((use === "근린생활시설" || use === "의료시설") && a >= 600) || (use === "노유자시설" && a >= 400));
    d("waterSpray", f.subUse === "박물관" || f.subUse === "도서관" ? a >= 1000 : false); // 수장고·서고 가스계 소화설비 추정
    d("smokeControl", (use === "문화및집회시설" || use === "운동시설") && a >= 5000);
    d("elevators", fl >= 2 && a >= 10000 ? 3 : fl >= 2 && a >= 5000 ? 2 : fl >= 2 && a >= 500 ? 1 : 0);
    if (f.elevators > 0) d("elevatorYear", f.approvalDate ? parseInt(f.approvalDate.slice(0, 4), 10) : null);
    var kw = a ? Math.max(50, Math.round(a * 0.12 / 50) * 50) : null;
    d("receivingKW", kw);
    d("voltage", kw == null ? null : kw >= 100 ? "특고압" : "저압");
    d("generatorKW", f.sprinkler && kw ? Math.max(50, Math.round(kw * 0.3 / 10) * 10) : null);
    d("fuelL", f.generatorKW ? 400 : null);
    d("gasType", a >= 300 ? (urban ? "도시가스" : "LPG") : "없음");
    d("lpgKg", f.gasType === "LPG" ? (a >= 2000 ? 500 : 250) : null);
    d("boilers", a >= 300 ? (a >= 3000 ? 2 : 1) : 0);
    d("boilerKind", f.boilers > 0 ? (f.gasType === "없음" ? "기름" : "가스") : "없음");
    d("chillerRT", a >= 3000 ? Math.round(a / 30 / 10) * 10 : null);
    d("waterTankM3", a >= 1000 ? Math.round(a * 0.02) : null);
    d("sewage", urban ? "공공하수도" : (a >= 1000 ? "오수처리시설" : "정화조"));
    d("asbestos", !!f.approvalDate && parseInt(f.approvalDate.slice(0, 4), 10) < 2009);
    return f;
  }

  window.SJ_FACILITIES = [
    est({ id: "F001", name: "상주시청 본청", category: "본청·청사",
      address: "경상북도 상주시 상산로 223", jibun: "경상북도 상주시 남성동 140-3", dept: "회계과",
      buildingUse: "업무시설", subUse: "공공청사", approvalDate: "1988-12-31",
      area: 9000, floorsAbove: 5, floorsBelow: 1, height: 22, workers: 450, evCharger: true, solarKW: 30,
      summary: "1988년 준공된 상주시 본청사. 노후·협소로 낙양동(구 잠사곤충사업장 일원)에 신청사 건립이 추진 중(목표 2027년 말).",
      note: "주소·지번·1988년 준공은 언론(경북매일 2022) 확인, 사용승인 월일 미상(12-31 임의). 연면적·층수·설비는 추정." }),

    est({ id: "F002", name: "상주시보건소(시의회 청사)", category: "복지·보건시설",
      address: "경상북도 상주시 중앙로 111", jibun: "경상북도 상주시 무양동", dept: "보건소 보건행정과",
      buildingUse: "의료시설", subUse: "보건소", area: 4500, floorsAbove: 4, floorsBelow: 1, workers: 120,
      summary: "상주시보건소와 시의회가 무양동 청사(중앙로 111)를 함께 사용하는 것으로 보도됨.",
      note: "주소는 생활정보·언론(2024) 확인. 시의회/보건소 공용 여부·사용승인일·규모 미확인(추정). 지번 번지 미상." }),

    est({ id: "F003", name: "상주박물관", category: "박물관·전시관",
      address: "경상북도 상주시 사벌국면 경천로 684", jibun: "경상북도 상주시 사벌국면 삼덕리 산18-7", dept: "문화예술과(상주박물관)",
      buildingUse: "문화및집회시설", subUse: "박물관", approvalDate: "2007-10-31",
      area: 4500, floorsAbove: 2, floorsBelow: 1, workers: 25, gasType: "LPG",
      summary: "2007년 11월 2일 개관한 공립박물관으로 상주의 선사~근대 역사유물을 전시. 2017년 개관 10주년 상설전시실 전면 개편, 별도 수장고(연면적 4,860㎡) 증축 추진.",
      lastRepair: "2017 상설전시실 전면 개편",
      note: "주소·지번·개관일 확인(관광정보·경북매일). 사용승인일은 개관 직전으로 추정. 본관 연면적 미확인(추정)." }),

    est({ id: "F004", name: "상주자전거박물관", category: "박물관·전시관",
      address: "경상북도 상주시 용마로 415", jibun: "경상북도 상주시 도남동", dept: "자전거정책과(자전거박물관)",
      buildingUse: "문화및집회시설", subUse: "박물관", approvalDate: "2010-10-01",
      area: 2500, floorsAbove: 2, floorsBelow: 0, workers: 12, gasType: "LPG",
      summary: "2002년 남장동에서 국내 최초 자전거박물관으로 개관, 2010년 10월 27일 도남동(경천섬 인근)으로 확장 이전. 자전거 역사·체험 전시와 무료 자전거 대여 운영.",
      note: "주소·이전일 확인(위키백과·언론). 부지 28,778㎡(계획)는 대지면적. 건물 연면적·사용승인일 추정." }),

    est({ id: "F005", name: "함창명주박물관", category: "박물관·전시관",
      address: "경상북도 상주시 함창읍 무운로 1593", jibun: "경상북도 상주시 함창읍", dept: "문화예술과",
      buildingUse: "문화및집회시설", subUse: "박물관", approvalDate: "2012-01-01",
      area: 1200, floorsAbove: 2, floorsBelow: 0, workers: 6,
      summary: "함창 명주(비단)의 역사와 제작 과정을 전시하는 박물관으로 2012년 개관. 명주테마파크 내 위치.",
      note: "주소 확인(관광정보 다수). 개관연도 2012는 단일 출처. 운영형태(직영/위탁)·규모 미확인(추정)." }),

    est({ id: "F006", name: "충의사(정기룡 장군 유적)", category: "기념관·유적",
      address: "경상북도 상주시 사벌국면 충의로 230", jibun: "경상북도 상주시 사벌국면 금흔리", dept: "문화예술과",
      buildingUse: "문화및집회시설", subUse: "기념관", area: 400, floorsAbove: 1, floorsBelow: 0, structure: "목조(한식)",
      workers: 2, gasType: "없음", boilers: 0,
      summary: "임진왜란 육전 명장 매헌 정기룡 장군의 위패를 모신 사당과 기념관이 있는 유적지. 매년 추모 제향 시행.",
      note: "주소·소재리(금흔리) 확인. 국가유산 지정 여부·건물 규모 미확인(추정). 2020년 사벌면→사벌국면 명칭 변경." }),

    est({ id: "F007", name: "화령장전투 전승기념관", category: "기념관·유적",
      address: "경상북도 상주시 화서면 문장로 288", jibun: "경상북도 상주시 화서면", dept: "복지정책과",
      buildingUse: "문화및집회시설", subUse: "기념관", approvalDate: "2018-09-30",
      area: 1000, floorsAbove: 1, floorsBelow: 0, workers: 3, solarKW: 20,
      summary: "1950년 7월 국군 제17연대가 북한군 제15사단을 격퇴한 화령장전투를 기리는 기념관으로 2018년 10월 개관. 매년 제50보병사단과 전승기념행사 개최.",
      note: "주소(국가보훈부)·개관(2018.10, 경북매일) 확인. 관리부서·규모 추정." }),

    est({ id: "F008", name: "효자 정재수 기념관", category: "기념관·유적",
      address: "경상북도 상주시 화서면 효자로 201", jibun: "경상북도 상주시 화서면 사산리", dept: "문화예술과",
      buildingUse: "문화및집회시설", subUse: "기념관", area: 500, floorsAbove: 1, floorsBelow: 0, workers: 2,
      summary: "1974년 폭설 속에 아버지를 지키다 숨진 효자 정재수 어린이를 기리는 기념관.",
      note: "도로명(효자로 201)은 생활정보 목록 확인. 화서면 사산리 소재는 추정. 규모·개관연도 미확인." }),

    est({ id: "F009", name: "도남서원", category: "기념관·유적",
      address: "경상북도 상주시 도남동", jibun: "경상북도 상주시 도남동", dept: "문화예술과",
      buildingUse: "문화및집회시설", subUse: "기념관", area: 800, floorsAbove: 1, floorsBelow: 0, structure: "목조(한식)",
      workers: 3, gasType: "없음", boilers: 0, asbestos: false,
      summary: "1606년 창건된 영남 대표 서원으로 1871년 서원철폐령으로 훼철, 1992년부터 유림이 복원을 시작해 현재 낙동강변에 강당·사당 등이 복원됨.",
      note: "연혁은 언론 확인. 도로명주소·번지·국가유산 지정여부 미확인 — 담당자 확인 필요." }),

    est({ id: "F010", name: "상주문화회관", category: "문화·공연시설",
      address: "경상북도 상주시 상산로 235", jibun: "경상북도 상주시 남성동", dept: "문화예술과(문화회관)",
      buildingUse: "문화및집회시설", subUse: "공연장", approvalDate: "1990-10-31",
      area: 5500, floorsAbove: 3, floorsBelow: 1, seats: 800, workers: 15, multiUseBiz: false,
      summary: "1990년 11월 7일 개관한 상주 대표 공연장(대공연장·소공연장·전시실). 650석 규모 신규 문화예술회관 건립이 별도 추진 중.",
      note: "주소·개관일 확인(관광정보). 객석 수·연면적·사용승인일 추정. 공연장 객석 수는 무대안전·공연법 판정에 중요하므로 우선 확인." }),

    est({ id: "F011", name: "상주시립도서관(복합)", category: "도서관·교육",
      address: "경상북도 상주시 복룡동", jibun: "경상북도 상주시 복룡동 230-10", dept: "평생학습과(시립도서관)",
      buildingUse: "교육연구시설", subUse: "도서관", approvalDate: "2023-09-01",
      area: 3780, floorsAbove: 3, floorsBelow: 1, workers: 20, solarKW: 50, evCharger: true, asbestos: false,
      summary: "대지 5,348㎡·연면적 3,780㎡, 지하1층·지상3층 복합시설(1~2층 도서관, 3층 생활문화센터). 2023년 12월 준공식, 2024년 1월 임시개관 후 4월 27일 정식 운영.",
      note: "지번·연면적·층수·개관일은 언론(경북매일·아주경제) 확인. 사용승인일(2023-09 준공보도)과 도로명주소·설비는 추정." }),

    est({ id: "F012", name: "상주시 국민체육센터", category: "체육시설",
      address: "경상북도 상주시 영남제일로 1432", jibun: "경상북도 상주시 복룡동", dept: "체육진흥과",
      buildingUse: "운동시설", subUse: "수영장", approvalDate: "2005-12-31",
      area: 4000, floorsAbove: 2, floorsBelow: 1, sportsFacility: true, workers: 15, chillerRT: null,
      summary: "복룡동 소재 실내수영장 중심 국민체육센터로 연간 약 25만 명 이용.",
      note: "주소·연간이용객 확인(경북매일 2025). 사용승인일·규모 추정." }),

    est({ id: "F013", name: "상주시 제2국민체육센터", category: "체육시설",
      address: "경상북도 상주시 계산동", jibun: "경상북도 상주시 계산동", dept: "체육진흥과",
      buildingUse: "운동시설", subUse: "수영장", approvalDate: "2025-11-30",
      area: 4595, floorsAbove: 2, floorsBelow: 0, sportsFacility: true, workers: 15, solarKW: 50, evCharger: true, asbestos: false,
      summary: "연면적 4,595㎡ 규모로 50m 레인 수영장·유아풀·장애인 슬로프·소규모체육관·GX실 구비. 2025년 12월 17일 시범운영 개시.",
      note: "연면적·시설구성·시범운영일 확인(쿠키뉴스 2025.12). 도로명주소·사용승인일·층수 추정." }),

    est({ id: "F014", name: "상주시 실내체육관", category: "체육시설",
      address: "경상북도 상주시 계산동", jibun: "경상북도 상주시 계산동", dept: "체육진흥과",
      buildingUse: "운동시설", subUse: "체육관", approvalDate: "2000-12-31",
      area: 7000, floorsAbove: 3, floorsBelow: 0, structure: "철골철근콘크리트조", seats: null, sportsFacility: true, workers: 8,
      summary: "계산동 시민운동장 일원 실내체육관으로 구관·신관 운영, 각종 대회·행사 개최.",
      note: "계산동 소재·신관 존재만 확인(위키·언론). 도로명주소·준공연도·규모 추정." }),

    est({ id: "F015", name: "상주시민운동장", category: "체육시설",
      address: "경상북도 상주시 계산동", jibun: "경상북도 상주시 계산동", dept: "체육진흥과",
      buildingUse: "운동시설", subUse: "운동장", area: 3000, floorsAbove: 2, floorsBelow: 0, sportsFacility: true, workers: 5,
      summary: "종합운동장(축구·육상)으로 과거 상주상무 프로축구 홈구장으로 사용.",
      note: "계산동 소재 확인. 연면적은 관람석 하부 건축물 기준 추정. 준공연도 미확인." }),

    est({ id: "F016", name: "상주시 다목적생활체육관", category: "체육시설",
      address: "경상북도 상주시 북상주로 24-7", jibun: "", dept: "체육진흥과",
      buildingUse: "운동시설", subUse: "체육관", area: 2000, floorsAbove: 2, floorsBelow: 0, sportsFacility: true, workers: 3,
      summary: "생활체육 동호인 대상 다목적 실내체육관.",
      note: "주소는 생활정보 목록 확인. 그 외 전부 추정." }),

    est({ id: "F017", name: "상주국제승마장", category: "체육시설",
      address: "경상북도 상주시 사벌국면 국제승마장로 1", jibun: "경상북도 상주시 사벌국면 화달리", dept: "체육진흥과(국제승마장)",
      buildingUse: "운동시설", subUse: "체육관", approvalDate: "2010-07-31",
      area: 6000, floorsAbove: 2, floorsBelow: 0, structure: "철골조", sportsFacility: true, workers: 20,
      summary: "부지 약 17만7천㎡, 사업비 215억원으로 2010년 8월 11일 준공. 주경기장·연습마장 2곳·실내마장 1동·승마체험장 보유, 대한승마협회 공인 경기장.",
      note: "주소·준공·시설구성 확인(서울신문 2010). 실내마장·관리동 등 건축물 연면적 합계 추정. 마사(축사) 별도 확인 필요." }),

    est({ id: "F018", name: "상주시종합사회복지관", category: "복지·보건시설",
      address: "경상북도 상주시 냉림1길 43-18", jibun: "경상북도 상주시 냉림동", dept: "복지정책과",
      buildingUse: "노유자시설", subUse: "사회복지관", approvalDate: "1997-06-30",
      area: 1500, floorsAbove: 3, floorsBelow: 0, workers: 20,
      summary: "1997년 개관한 상주지역 1호 사회복지관으로 계림동 영구임대아파트 단지 내 위치.",
      note: "주소·개관연도 확인(경북매일 2016). 위탁운영 여부·규모 추정. 1997년 건축 → 석면 조사 대상 추정." }),

    est({ id: "F019", name: "상주시장애인종합복지관", category: "복지·보건시설",
      address: "경상북도 상주시 만산8길 11", jibun: "경상북도 상주시 만산동", dept: "노인장애인과",
      buildingUse: "노유자시설", subUse: "장애인복지관", area: 2000, floorsAbove: 3, floorsBelow: 0, workers: 25,
      summary: "장애인 재활·교육·사회참여 지원 복지관. 2023년 재활로봇(성인·아동용) 도입.",
      note: "주소는 생활정보 목록 확인. 개관연도·규모 추정." }),

    est({ id: "F020", name: "상주시노인종합복지관", category: "복지·보건시설",
      address: "경상북도 상주시", jibun: "", dept: "노인장애인과",
      buildingUse: "노유자시설", subUse: "노인복지관", area: 2000, floorsAbove: 3, floorsBelow: 0, workers: 20, elderly: true,
      summary: "노인 여가·교육·일자리(실버클린 등) 사업을 수행하는 노인종합복지관.",
      note: "존재·운영 확인(경북매일). 주소·개관연도·규모 미확인 — 담당자 입력 필요." }),

    est({ id: "F021", name: "상주시청소년수련관", category: "도서관·교육",
      address: "경상북도 상주시 계산동", jibun: "경상북도 상주시 계산동", dept: "교육청소년과",
      buildingUse: "수련시설", subUse: "청소년수련관", area: 3000, floorsAbove: 3, floorsBelow: 1, workers: 12, childcare: true,
      summary: "계산동 시민운동장 일원 청소년 수련·문화활동 시설.",
      note: "계산동 소재만 확인(위키). 나머지 추정." }),

    est({ id: "F022", name: "경천대관광지", category: "관광·휴양시설",
      address: "경상북도 상주시 사벌국면 경천로 652", jibun: "경상북도 상주시 사벌국면 삼덕리", dept: "관광진흥과",
      buildingUse: "관광휴게시설", subUse: "관광지 관리동", area: 800, floorsAbove: 2, floorsBelow: 0,
      playground: true, multiUseBiz: true, workers: 6,
      summary: "'낙동강 제1경' 경천대 일원 관광지로 전망대·야영장·놀이시설·드라마세트장 등 조성.",
      note: "주소 확인(관광정보). 관리동·매점 등 건축물 규모, 어린이놀이시설·휴게음식점 입점 여부 추정." }),

    est({ id: "F023", name: "경천섬·학전망대(낙동강 수변)", category: "관광·휴양시설",
      address: "경상북도 상주시 중동면 오상리", jibun: "경상북도 상주시 중동면 오상리", dept: "관광진흥과",
      buildingUse: "관광휴게시설", subUse: "전망대", area: 300, floorsAbove: 3, floorsBelow: 0, structure: "철골조", workers: 2,
      summary: "상주보 상류 낙동강 하중도 경천섬 수변공원과 범월교·학 전망대 일원. 상주자전거박물관·도남서원과 연계 관광 거점.",
      note: "소재지(중동면 오상리 일원)는 추정. 전망대 규모·층수 추정 — 건축물 해당 여부부터 확인." }),

    est({ id: "F024", name: "상주곶감공원(호랑이와곶감테마공원)", category: "관광·휴양시설",
      address: "경상북도 상주시 외남면 곶감공원길 59-12", jibun: "경상북도 상주시 외남면 소은리", dept: "곶감유통과",
      buildingUse: "관광휴게시설", subUse: "전시장", area: 1500, floorsAbove: 2, floorsBelow: 0, playground: true, workers: 5,
      summary: "외남면 소은리 곶감 테마공원으로 곶감 전시·체험관, 호랑이와 곶감 설화 테마 시설 운영(2015년 이전 개장).",
      note: "주소는 단일 생활정보 출처, 소은리 소재는 언론(2015) 확인. 개장연도·규모 추정." }),

    est({ id: "F025", name: "상주시농업기술센터", category: "기타",
      address: "경상북도 상주시 발산로 71", jibun: "", dept: "농업기술센터 농업행정과",
      buildingUse: "업무시설", subUse: "공공청사", area: 4000, floorsAbove: 3, floorsBelow: 0, workers: 80,
      summary: "농업기술 보급·교육·연구를 담당하는 농업기술센터 청사(시험포·교육관 부속).",
      note: "주소는 생활정보 목록 확인. 그 외 추정." }),

    est({ id: "F026", name: "함창읍 행정복지센터", category: "읍면동 행정복지센터",
      address: "경상북도 상주시 함창읍 함창중앙로 135", jibun: "경상북도 상주시 함창읍 구향리", dept: "함창읍 총무팀",
      buildingUse: "업무시설", subUse: "공공청사", area: 1200, floorsAbove: 2, floorsBelow: 0, workers: 25,
      summary: "함창읍 행정·민원 처리 청사.", note: "도로명 확인(공공 와이파이 목록). 지번(구향리)·규모 추정." }),

    est({ id: "F027", name: "남원동 행정복지센터", category: "읍면동 행정복지센터",
      address: "경상북도 상주시 중앙로 132", jibun: "경상북도 상주시 남성동", dept: "남원동 행정팀",
      buildingUse: "업무시설", subUse: "공공청사", area: 900, floorsAbove: 3, floorsBelow: 0, workers: 15,
      summary: "남원동(개운·낙양·남성·남장·연원동 관할) 행정·민원 청사.", note: "도로명 확인. 법정동·규모 추정." }),

    est({ id: "F028", name: "북문동 행정복지센터", category: "읍면동 행정복지센터",
      address: "경상북도 상주시 북천로 63", jibun: "경상북도 상주시 무양동", dept: "북문동 행정팀",
      buildingUse: "업무시설", subUse: "공공청사", area: 900, floorsAbove: 3, floorsBelow: 0, workers: 15,
      summary: "북문동(남적·만산·무양·부원·죽전·초산동 관할) 행정·민원 청사.", note: "도로명 확인. 법정동·규모 추정." }),

    est({ id: "F029", name: "계림동 행정복지센터", category: "읍면동 행정복지센터",
      address: "경상북도 상주시 냉림1길 50", jibun: "경상북도 상주시 냉림동", dept: "계림동 행정팀",
      buildingUse: "업무시설", subUse: "공공청사", area: 800, floorsAbove: 2, floorsBelow: 0, workers: 12,
      summary: "계림동(계산·낙상·냉림·중덕·화산동 관할) 행정·민원 청사.", note: "도로명 확인. 규모 추정." }),

    est({ id: "F030", name: "화서면 행정복지센터", category: "읍면동 행정복지센터",
      address: "경상북도 상주시 화서면 화령로 45", jibun: "경상북도 상주시 화서면 신봉리", dept: "화서면 총무팀",
      buildingUse: "업무시설", subUse: "공공청사", area: 700, floorsAbove: 2, floorsBelow: 0, workers: 12,
      summary: "화서면 행정·민원 청사(화령 소재).", note: "도로명 확인. 지번(신봉리)·규모 추정." }),

    est({ id: "F031", name: "사벌국면 행정복지센터", category: "읍면동 행정복지센터",
      address: "경상북도 상주시 사벌국면 덕담1길 39", jibun: "경상북도 상주시 사벌국면 덕담리", dept: "사벌국면 총무팀",
      buildingUse: "업무시설", subUse: "공공청사", area: 700, floorsAbove: 2, floorsBelow: 0, workers: 12,
      summary: "사벌국면 행정·민원 청사(2020년 사벌면에서 명칭 변경).", note: "도로명 확인(구 표기 사벌면). 지번·규모 추정." }),

    est({ id: "F032", name: "공성면 행정복지센터", category: "읍면동 행정복지센터",
      address: "경상북도 상주시 공성면 공성중앙로 67", jibun: "경상북도 상주시 공성면 옥산리", dept: "공성면 총무팀",
      buildingUse: "업무시설", subUse: "공공청사", area: 700, floorsAbove: 2, floorsBelow: 0, workers: 12,
      summary: "공성면 행정·민원 청사(옥산 소재).", note: "도로명 확인. 지번(옥산리)·규모 추정." })
  ];
})();
