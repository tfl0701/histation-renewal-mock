/* 하이스테이션 리뉴얼 목업 — 화면 순서대로 보기(직원 검토용)
 * #/tour/<흐름>/<번호> 로 들어오면 예시 값을 채운 뒤 그 화면으로 넘어가고, 위에 노란 순서 막대를 띄운다.
 */
(function () {
  "use strict";
  var H = window.H;
  var OID = "HS260918", OLD = "HS260903";

  function guest() { H.state.loggedIn = false; }
  function member() { H.state.loggedIn = true; H.state.user = Object.assign({}, H.state.user, { id: "hihi97", name: "이하이", birth: "19970815", phone: "010-2345-6789" }); }
  function carrier(c) { H.state.carrier = c === undefined ? "KT" : c; H._gateShown = true; }
  function fresh58() { carrier("KT"); delete H.sel[58]; }
  function draft58() { fresh58(); var sel = H.defaults(H.prod(58), "SKT"); H.state.draft = { pid: 58, sel: sel }; }
  function orders(step) { return [H.makeOrder(58, step, OID, "2026.09.18", "SKT")]; }
  function ordersWithPast(step) { var old = H.makeOrder(31, 4, OLD, "2026.09.03", "KT"); old.addr = H.SAMPLE_ADDR[1]; old.addr2 = "A동 702호"; old.date = "2026.03.20"; return orders(step).concat([old]); }
  function netLead(step) { return { id: "IN260918", kind: "internet", carrier: "KT", title: "에센스 + TV 베이직", monthly: 49500, phone: 44000, gift: 620000, install: 56200, name: "이하이", contact: "010-2345-6789", addr: H.SAMPLE_ADDR[0] + " K1타워 207호", when: "다음 주 토요일 오전", date: "2026.09.18", step: step }; }
  function rentLead(step) { return { id: "RT260918", kind: "rental", brand: "코웨이", name: "코웨이 아이콘 프로 정수기 · 화이트 · 4개월방문 · 5년 약정", fee: 29900, card: 7900, pid: "1747210028", contact: "010-2345-6789", who: "이하이", addr: H.SAMPLE_ADDR[0] + " K1타워 207호", date: "2026.09.18", step: step }; }
  function careLead() { return { id: "CR260918", kind: "care", item: "인터넷", carrier: "KT", due: "2027-03", name: "이하이", phone: "010-2345-6789", date: "2026.09.18" }; }
  function scrollToEl(sel) { return function () { setTimeout(function () { var el = H.$(sel); if (el) el.scrollIntoView({ block: "center" }); }, 80); }; }
  function noPartner() { H.state.partner = null; H.pjoin = null; }
  function samplePartner() { H.pjoin = null; H.state.partner = { code: "HSK7M2", name: "이하이", phone: "010-2345-6789", type: "person", bank: "국민", account: "123456-01-234567", joined: "2026.09.18" }; }
  function adminClean() { H.state.newsEdits = {}; H.state.newsNew = []; H.state.newsHidden = []; H.state.bannerOff = []; H.editDraft = null; H.state.queue = null; }

  var FLOWS = {
    order: {
      title: "휴대폰 개통 노선", desc: "관문 → 상품(3사 비교) → 로그인 · 가입 → 주문서 → 접수 → 신청서 → 가입내역 → 배송 → 개통완료",
      steps: [
        { t: "상품 화면 · 통신사 관문 «어느 노선에서 오셨어요?»", go: "#/phone/58", setup: function () { guest(); H.state.carrier = null; delete H.sel[58]; H._gateShown = false; } },
        { t: "상품 화면 · 세 통신사 나란히 비교 (KT 손님)", go: "#/phone/58", setup: function () { guest(); fresh58(); } },
        { t: "요금제 고르기 창 (고른 통신사 것만)", go: "#/phone/58", setup: function () { guest(); fresh58(); }, after: function () { H.acts.planSheet(); } },
        { t: "할인 방법 24개월 합계 창", go: "#/phone/58", setup: function () { guest(); fresh58(); }, after: function () { H.acts.cmpSheet(); } },
        { t: "주문하기를 누르면 · 로그인 창", go: "#/phone/58", setup: function () { guest(); draft58(); }, after: function () { H.acts.login(null, "#/order"); } },
        { t: "회원가입 · 가입 방법 고르기 (2만 포인트)", go: "#/signup?next=%23%2Forder", setup: function () { guest(); draft58(); } },
        { t: "가입 완료", go: "#/signup/done?next=%23%2Forder", setup: function () { member(); draft58(); } },
        { t: "주문서 · 처음 모습", go: "#/order", setup: function () { member(); draft58(); H.resetOrderForm(false); } },
        { t: "주문서 · 다 채운 모습 (인터넷 같이 체크)", go: "#/order", setup: function () { member(); draft58(); H.resetOrderForm(false); H.fillOrderSample(); H.state.netAsk = true; } },
        { t: "접수 완료 · 다음 정차역", go: "#/done/" + OID, setup: function () { member(); H.state.orders = orders(0); } },
        { t: "온라인 신청서(인증 URL) 창", go: "#/done/" + OID, setup: function () { member(); H.state.orders = orders(0); }, after: function () { H.acts.writeForm({ dataset: { id: OID } }); } },
        { t: "가입내역 받는 방법 · 카카오톡 예시(SKT)", go: "#/my/order/" + OID, setup: function () { member(); H.state.orders = orders(1); }, after: function () { H.acts.joinInfo({ dataset: { id: OID } }); } },
        { t: "신청내역 확인 링크 · 로그인 없이", go: "#/receipt/" + OID, setup: function () { member(); H.state.orders = orders(1); } },
        { t: "내 노선 · 준비중", go: "#/my", setup: function () { member(); H.state.orders = orders(2); H.state.leads = []; } },
        { t: "배송조회 창 · 송장번호", go: "#/my/order/" + OID, setup: function () { member(); H.state.orders = orders(3); }, after: function () { H.acts.trackSheet({ dataset: { id: OID } }); } },
        { t: "개통완료 · 185일 D-day", go: "#/my/order/" + OID, setup: function () { member(); H.state.orders = orders(4); } }
      ]
    },
    internet: {
      title: "인터넷 노선", desc: "3사 사은품 계산 → 신청 → 상담 → 설치",
      steps: [
        { t: "인터넷 · LG U+ 기가 + 실속형", go: "#/internet?c=LG", setup: function () { H.nsel = { c: "LG", net: 2, tv: 0, wifi: false }; } },
        { t: "인터넷 · KT로 바꿔 보기", go: "#/internet?c=KT", setup: function () { H.nsel = { c: "KT", net: 2, tv: 0, wifi: true }; } },
        { t: "신청서 · 다 채운 모습", go: "#/internet/apply", setup: function () { member(); H.nsel = { c: "KT", net: 2, tv: 0, wifi: false }; H.resetLead(); H.fillLeadSample(); } },
        { t: "신청 완료 · 알림톡 예시", go: "#/internet/done?id=IN260918", setup: function () { member(); H.state.leads = [netLead(0)]; } },
        { t: "내 노선 · 설치 예약", go: "#/my", setup: function () { member(); H.state.orders = []; H.state.leads = [Object.assign(netLead(2), { when: "9월 20일 오전" })]; } }
      ]
    },
    purifier: {
      title: "정수기 노선", desc: "목록 → 상세(약정 · 관리 · 카드 할인) → 렌탈 신청 → 설치",
      steps: [
        { t: "정수기 목록 · 브랜드 필터", go: "#/purifier" },
        { t: "정수기 상세 · 조건 고르기", go: "#/purifier/1747210028", setup: function () { H.rsel = null; } },
        { t: "렌탈 신청 · 다 채운 모습", go: "#/purifier/apply", setup: function () { member(); H.rsel = { id: "1747210028", color: 0, care: "visit", years: 5 }; H.resetLead(); H.fillLeadSample(); } },
        { t: "신청 완료", go: "#/purifier/done?id=RT260918", setup: function () { member(); H.state.leads = [rentLead(0)]; } },
        { t: "내 노선 · 휴대폰 + 인터넷 + 정수기 같이", go: "#/my", setup: function () { member(); H.state.orders = orders(2); H.state.leads = [netLead(1), rentLead(0), careLead()]; } }
      ]
    },
    care: {
      title: "만기 챙김", desc: "하이스테이션만 할 수 있는 상시 서비스 — 맡기기 → 알림톡 → 내 노선",
      steps: [
        { t: "만기 챙김 안내 + 맡기기 칸", go: "#/care", setup: function () { guest(); H.resetCare(); } },
        { t: "맡기기 · 다 채운 모습", go: "#/care", setup: function () { member(); H.resetCare(); H.fillCareSample(); }, after: scrollToEl("#careForm") },
        { t: "맡긴 뒤 · 알림톡 ①", go: "#/care/done?id=CR260918", setup: function () { member(); H.state.leads = [careLead()]; } },
        { t: "내 노선 · 만기 D-day 카드", go: "#/my", setup: function () { member(); H.state.orders = []; H.state.leads = [careLead()]; }, after: scrollToEl(".care-card") },
        { t: "직원 · 만기 챙김 명단", go: "#/admin/care?f=month", setup: function () { H.state.leads = [careLead()]; } }
      ]
    },
    news: {
      title: "소식", desc: "첫 화면 소식 칸 → 목록 → 사전알림 · 특별 혜택 · 구매 가이드 → 알림 신청",
      steps: [
        { t: "첫 화면 · 소식 칸", go: "#/", after: scrollToEl(".news") },
        { t: "소식 전체 목록", go: "#/news" },
        { t: "사전알림 글", go: "#/news/iphone18-alert" },
        { t: "사전알림 신청 창", go: "#/news/iphone18-alert", setup: guest, after: function () { H.acts.alert({ dataset: { slug: "iphone18-alert" } }); } },
        { t: "특별 혜택 글 · 번호이동", go: "#/news/mnp-benefit" },
        { t: "구매 가이드 · 통신사 세 곳 비교", go: "#/news/three-carriers" }
      ]
    },
    my: {
      title: "마이페이지(내 노선)", desc: "로그인 전 · 내 노선 · 신청내역 · 마일리지 · 후기 · 회원정보",
      steps: [
        { t: "마이페이지 · 로그인 전", go: "#/my", setup: guest },
        { t: "내 노선 · 휴대폰 진행 + 인터넷 + 만기", go: "#/my", setup: function () { member(); carrier("SKT"); H.state.orders = ordersWithPast(1); H.state.leads = [netLead(1), careLead()]; H.state.recent = [58, 31, 4, 11]; } },
        { t: "개통 끝난 주문 · 185일 뒤 요금제 낮추기", go: "#/my", setup: function () { member(); H.state.orders = [H.makeOrder(31, 4, OLD, "2026.03.20", "KT")]; H.state.leads = []; }, after: scrollToEl(".pdown") },
        { t: "신청내역 전체", go: "#/my/orders", setup: function () { member(); H.state.orders = ordersWithPast(1); H.state.leads = [netLead(1)]; } },
        { t: "마일리지 (2만 포인트)", go: "#/my/mileage", setup: member },
        { t: "내가 쓴 후기 · 없음", go: "#/my/reviews", setup: function () { member(); H.state.reviews = []; } },
        { t: "후기 쓰기 창", go: "#/my/reviews", setup: function () { member(); H.state.orders = orders(4); }, after: function () { H.acts.writeReview(); } },
        { t: "회원정보 수정", go: "#/my/account", setup: function () { member(); H.acc = null; } }
      ]
    },
    partner: {
      title: "파트너스", desc: "안내 · 가입 · 추천코드 · 실적",
      steps: [
        { t: "파트너스 안내", go: "#/partner", setup: function () { member(); noPartner(); } },
        { t: "파트너 가입 · 처음 모습", go: "#/partner/join", setup: function () { member(); noPartner(); } },
        { t: "추천코드를 만든 뒤", go: "#/partner/done", setup: function () { member(); samplePartner(); } },
        { t: "파트너 실적 · 예시", go: "#/partner/stats", setup: function () { member(); samplePartner(); } }
      ]
    },
    browse: {
      title: "둘러보기", desc: "첫 화면 · 목록 · 검색 · 고객센터 · AI 상담 · 전체 메뉴 · 랜덤박스",
      steps: [
        { t: "첫 화면 · 배너 5장 5초 넘김", go: "#/", setup: function () { H.state.bannerOff = []; } },
        { t: "첫 화면 · 인터넷 3사 · 정수기", go: "#/", after: scrollToEl(".netgrid") },
        { t: "휴대폰 목록 · 갤럭시 (통신사 안 고름)", go: "#/phones?cat=galaxy", setup: function () { H.state.carrier = null; } },
        { t: "휴대폰 목록 · 아이폰 (LG U+ 손님)", go: "#/phones?cat=iphone", setup: function () { carrier("LGUP"); } },
        { t: "검색 · «폴드8»", go: "#/search?q=%ED%8F%B4%EB%93%9C8" },
        { t: "고객센터", go: "#/cs" },
        { t: "AI 상담 팝업", go: "#/cs", after: function () { H.acts.chat(); } },
        { t: "전체 메뉴", go: "#/", after: function () { H.acts.menu(); } },
        { t: "랜덤박스 후기 이벤트", go: "#/event/randombox" },
        { t: "구매후기 · 예시 후기 채운 모습", go: "#/reviews", setup: function () { H.state.sampleReviews = true; } }
      ]
    },
    admin: {
      title: "직원 운영(자비스웹 안)", desc: "접수 운영판 · 소식 관리 · 배너 · 만기 챙김 · 후기",
      steps: [
        { t: "관리 첫 화면 · 오늘 할 일", go: "#/admin", setup: adminClean },
        { t: "접수 운영판 · 다섯 정거장", go: "#/admin/queue", setup: adminClean },
        { t: "소식 관리 목록", go: "#/admin/news", setup: adminClean },
        { t: "소식 편집 · 특별 혜택", go: "#/admin/news-edit/mnp-benefit", setup: adminClean },
        { t: "새 소식 쓰기", go: "#/admin/news-edit/new", setup: adminClean },
        { t: "배너 관리 · 글 칸", go: "#/admin/banners", setup: adminClean },
        { t: "만기 챙김 명단", go: "#/admin/care", setup: adminClean },
        { t: "후기 관리 · 전체 켜고 끄기", go: "#/admin/reviews", setup: adminClean }
      ]
    }
  };
  var ORDER = ["order", "internet", "purifier", "care", "news", "my", "partner", "browse", "admin"];
  H.FLOWS = FLOWS;

  H.runTour = function (r) {
    var key = r.parts[1], flow = FLOWS[key];
    if (!flow) { location.replace("#/screens"); return; }
    var n = Math.min(Math.max(parseInt(r.parts[2], 10) || 1, 1), flow.steps.length), st = flow.steps[n - 1];
    H.closeSheet(true); H.closeDrawer(true);
    if (H.acts.aiClose) H.acts.aiClose();
    H.state.welcomed = true;
    if (st.setup) st.setup();
    H.state.tour = { flow: key, n: n };
    H.save();
    H._tourAfter = st.after || null;
    H._forceTop = true;
    if (location.hash === st.go) { H.render(); window.scrollTo(0, 0); } else { location.replace(st.go); }
  };
  H.tourBar = function () {
    var t = H.state.tour, flow = t && FLOWS[t.flow];
    if (!flow) return "";
    var n = t.n, len = flow.steps.length, st = flow.steps[n - 1];
    var prev = n > 1 ? `<a class="tb-btn" href="#/tour/${t.flow}/${n - 1}" aria-label="이전 화면">${H.icon("chev-l", "ic--sm")}</a>` : `<span class="tb-btn is-off" aria-hidden="true">${H.icon("chev-l", "ic--sm")}</span>`;
    var next = n < len ? `<a class="tb-btn tb-btn--next" href="#/tour/${t.flow}/${n + 1}">다음${H.icon("chev-r", "ic--sm")}</a>` : `<a class="tb-btn tb-btn--next" href="#/screens">목록</a>`;
    return `<div class="tourbar" role="region" aria-label="화면 순서대로 보기"><a class="tourbar__meta" href="#/screens"><b class="num">${flow.title} ${n}/${len}</b><span>${st.t}</span></a>${prev}${next}<button type="button" class="tb-x" data-act="tourClose" aria-label="순서 보기 끝내기">${H.icon("close", "ic--sm")}</button></div>`;
  };
  H.acts.tourClose = function () { H.state.tour = null; H.save(); H.rerender(); };

  H.views.screens = function () {
    var total = ORDER.reduce(function (a, k) { return a + FLOWS[k].steps.length; }, 0);
    return {
      title: "화면 순서대로 보기",
      html: `<div class="wrap">
  <header class="ph"><h1>화면 순서대로 보기</h1><p>직원 검토용이에요. 흐름을 고르면 로그인이나 입력 없이 예시 값으로 한 화면씩 넘겨 볼 수 있어요. 위에 뜨는 노란 막대의 «다음»을 누르면 돼요. 모두 ${total}화면.</p></header>
  <div class="flows">${ORDER.map(function (k) {
    var f = FLOWS[k];
    return `<section class="flow-card" aria-labelledby="fl-${k}"><div class="flow-card__hd"><div><h2 id="fl-${k}">${f.title}</h2><p>${f.desc} · ${f.steps.length}화면</p></div><a class="btn btn--ink btn--sm" href="#/tour/${k}/1">처음부터 보기</a></div>
      <ol>${f.steps.map(function (s, i) { return `<li><a href="#/tour/${k}/${i + 1}"><span class="num">${i + 1}</span>${s.t}</a></li>`; }).join("")}</ol></section>`;
  }).join("")}</div>
  <p class="demo-note"><span class="demo-tag">시안</span>순서 보기는 이 브라우저 안의 예시 값만 바꿔요. 처음 상태로 돌리려면 마이페이지 맨 아래 «목업 처음 상태로 되돌리기» · 기획서는 <a href="plan.html" target="_blank" rel="noopener" style="color:var(--blue);font-weight:700">plan.html</a></p>
</div>`
    };
  };

  /* 첫 화면: 배너 시작 + 처음 들어온 직원에게 한 번만 안내 */
  H.after.home = function () {
    if (H.initHero) H.initHero();
    if (H.state.welcomed || H.state.tour) return;
    H.state.welcomed = true;
    H.save();
    setTimeout(function () {
      if (H.viewKey !== "home") return;
      H.openSheet({
        title: "하이스테이션 리뉴얼 목업이에요",
        body: `<p class="help-t help-t--lead">직원 검토용 시안이에요. 실제로 주문 · 가입 · 신청되지 않아요. 가격은 ${H.D.asOf.replace(/-/g, ".")} 자비스웹 값이에요.</p>
          <div class="consult-list">
            <a class="cs-card cs-card--dark" href="#/tour/order/1"><span class="cs-card__ic">${H.icon("train")}</span><b>휴대폰 개통 노선 순서대로 보기</b><small>관문 → 3사 비교 → 주문서 → 접수 → 신청서 → 가입내역 → 배송 → 개통완료 (${FLOWS.order.steps.length}화면)</small></a>
            <a class="cs-card" href="#/screens"><span class="cs-card__ic">${H.icon("doc")}</span><b>화면 순서대로 보기 목록</b><small>인터넷 · 정수기 · 만기 챙김 · 소식 · 마이페이지 · 파트너스 · 직원 운영</small></a>
            <button type="button" class="cs-card" data-act="closeSheet"><span class="cs-card__ic">${H.icon("home")}</span><b>그냥 둘러보기</b><small>노란 연필 단추에서 화면마다 기획 메모를 볼 수 있어요</small></button>
          </div>`
      });
    }, 500);
  };
})();
