/* 하이스테이션 리뉴얼 목업 — 파트너스 안내 · 가입 · 추천코드 · 실적
 * 문구와 규칙은 지금 histation.co.kr/partner 그대로(2026-09-18 확인): 개통 1건당 20,000원 · 다음 달 말 지급 · 185일 안 환수 시 회수 · 3.3% · 링크 90일
 * 하이스테이션만의 것: 인터넷 · 정수기 소개도 수수료 대상(자비스웹 hs_partners 에 internet_commission · rental_commission 칸이 이미 있다) — 금액은 대표가 정한다.
 */
(function () {
  "use strict";
  var H = window.H;
  var FEE = 20000;
  var STEPS = [
    ["내 추천 링크 받기", "[추천코드 만들기]를 누르면 나만의 링크가 바로 만들어집니다. 회원정보가 그대로 들어가니 따로 적을 게 없어요."],
    ["링크 보내기", "휴대폰 · 인터넷 · 정수기 바꿀 사람에게 카톡·문자로 보내거나, 블로그·인스타에 올려두면 됩니다. 그 링크로 들어온 분이 로그인하거나 가입하면 그때부터 기한 없이 내 소개로 남습니다."],
    ["개통 · 설치되면 수수료", "소개받은 분이 개통을 마치면 휴대폰 1건당 20,000원이 쌓입니다. 인터넷 설치 · 정수기 설치도 수수료 대상이에요(금액은 안내 예정)."]
  ];
  var RULES = [
    ["ok", "개통완료된 건 — 휴대폰 1건당 20,000원. 접수·배송 중인 건은 개통이 끝나면 반영됩니다"],
    ["ok", "인터넷 · 정수기는 설치완료된 건 — 금액은 파트너 안내에서 따로 알려드려요"],
    ["no", "취소·반품된 건 · 본인 명의로 넣은 주문(자기추천)"],
    ["ok", "추천했던 분이 다시 사는 것도 대상입니다"],
    ["info", "지급은 전월 개통분을 다음 달 말에 — 8월 개통분은 9월 말"],
    ["info", "개통 후 185일 안에 해지·타사 이동 등으로 환수가 생기면 수수료는 회수됩니다"],
    ["info", "지급은 개인 3.3% 원천징수 후 계좌로. 사업자는 세금계산서로 처리합니다"]
  ];
  var FAQ = [
    { q: "수수료는 언제 잡히나요?", a: "개통(설치)이 완료된 건만 잡힙니다. 접수·배송 중인 건은 끝나면 자동으로 반영되고, 취소·반품된 건은 빠집니다." },
    { q: "언제 받나요?", a: "전월 개통분을 다음 달 말에 지급합니다. 개통 직후 14일 안에는 청약철회가 가능하고 통신사 정산도 한 달쯤 걸려서, 그 기간을 지나 확정된 뒤에 지급합니다." },
    { q: "링크는 얼마나 유효한가요?", a: "링크를 누른 분이 로그인하거나 가입하면 기한이 없습니다. 로그인 없이 구경만 하신 분은 그 브라우저에 90일까지 남습니다. 하이유플 · 하이폰 링크와도 서로 이어져요(쿠키 90일)." },
    { q: "세금은 어떻게 되나요?", a: "개인은 지급할 때 3.3%를 원천징수하고 나머지를 보내드립니다. 사업자는 세금계산서로 처리합니다. 주민등록번호는 받지 않습니다." },
    { q: "한동안 소개를 못 하면요?", a: "6개월(180일) 동안 소개 실적이 한 건도 없으면 파트너 활동이 자동으로 종료됩니다. 종료돼도 지난 실적과 받으신 수수료는 그대로예요." }
  ];

  H.views.partner = function () {
    var mine = H.state.partner, go = mine ? "#/partner/stats" : "#/partner/join";
    return {
      title: "하이스테이션 파트너스",
      html: `<div class="wrap pt">
  <section class="pt-hero"><p class="pt-eyebrow">하이스테이션 파트너스</p><h1>링크 하나로<br>소개하고 수수료 받기</h1>
    <p class="pt-lead">휴대폰 · 인터넷 · 정수기 바꿀 지인에게 내 링크를 보내주세요. 그 분이 개통을 마치면 <b>휴대폰 1건당 20,000원</b>이 쌓입니다. 가입비도, 재고 부담도 없습니다.</p>
    <div class="pt-fee"><span><small>휴대폰 1건당</small><b class="num">20,000원</b></span><span><small>인터넷 · 정수기</small><b>안내 예정</b></span><span><small>지급</small><b>다음 달 말</b></span></div>
    <a class="btn btn--mg btn--block pt-cta" href="${go}">${mine ? "내 파트너 정보 보기" : "추천코드 만들기"}</a></section>
  <section class="pt-sec"><h2>이렇게 진행됩니다</h2><ol class="pt-steps">${STEPS.map(function (s, i) { return `<li><i class="num">${i + 1}</i><div><b>${s[0]}</b><p>${s[1]}</p></div></li>`; }).join("")}</ol></section>
  <section class="pt-sec"><h2>수수료가 잡히는 기준</h2><ul class="pt-rules">${RULES.map(function (x) { return `<li class="pt-rule pt-rule--${x[0]}">${H.icon(x[0] === "ok" ? "check" : x[0] === "no" ? "close" : "info", "ic--sm")}<span>${x[1]}</span></li>`; }).join("")}</ul></section>
  <section class="pt-sec"><h2>자주 묻는 질문</h2>${H.faqHtml(FAQ)}</section>
  <div class="pt-bottom"><a class="btn btn--mg btn--block" href="${go}">${mine ? "내 실적 보기" : "지금 추천코드 만들기"}</a><p class="help-t">가입비·회비 없음 · 언제든 그만둘 수 있습니다 · 문의 1544-2680</p></div>
</div>`
    };
  };

  function pj() {
    if (!H.pjoin) { var u = H.state.user; H.pjoin = { name: u.name, phone: u.phone, type: "person", biz: "", bank: "", account: "", holder: u.name, channel: "", agree: [false, false], tried: false }; }
    return H.pjoin;
  }
  H.views["partner-join"] = function () {
    if (!H.state.loggedIn) return { title: "파트너 가입", html: `<div class="wrap me-narrow"><header class="me-hd"><h1>파트너 가입</h1><p>회원만 파트너가 될 수 있어요. 로그인하면 회원정보가 그대로 들어가요.</p></header><div class="login-box"><a class="btn btn--mg btn--block" href="#/signup?next=%23%2Fpartner%2Fjoin">회원가입하고 시작하기</a><button type="button" class="btn btn--ink btn--block" data-act="login" data-next="#/partner/join">로그인</button></div></div>` };
    var f = pj(), bizBad = f.tried && f.type === "biz" && !/^\d{10}$/.test(f.biz), agBad = f.tried && !f.agree.every(Boolean);
    return {
      title: "파트너 가입", tab: false,
      bar: `<button type="button" class="btn btn--mg btn--block" data-act="pjSubmit">추천코드 만들기</button>`,
      html: `<div class="wrap me-narrow"><a class="back" href="#/partner">${H.icon("chev-l")}파트너스</a>
  <header class="ph ph--tight"><h1>파트너 가입</h1><p>회원정보로 채웠어요. 계좌는 나중에 넣어도 돼요.</p></header>
  <section class="form-sec"><h2>파트너</h2>
    <div class="field"><label>이름</label><input class="input" value="${H.esc(f.name)}" readonly></div>
    <div class="field"><label>연락처</label><input class="input" value="${H.esc(f.phone)}" readonly></div>
    <div class="field"><span class="field-label">구분</span><div class="choice-row"><button type="button" class="choice choice--center" data-act="pjType" data-v="person" aria-pressed="${f.type === "person"}">개인<small>3.3% 원천징수</small></button><button type="button" class="choice choice--center" data-act="pjType" data-v="biz" aria-pressed="${f.type === "biz"}">사업자<small>세금계산서</small></button></div></div>
    ${f.type === "biz" ? `<div class="field"><label for="pjBiz">사업자등록번호<span class="req">*</span></label><input id="pjBiz" class="input${bizBad ? " bad" : ""}" inputmode="numeric" maxlength="10" placeholder="숫자 10자리" value="${H.esc(f.biz)}" data-input="pjField" data-f="biz">${bizBad ? '<p class="err-t">숫자 10자리로 적어 주세요</p>' : ""}</div>` : ""}
  </section>
  <section class="form-sec"><h2>수수료 받을 계좌 <span class="opt-tag">나중에 가능</span></h2>
    <div class="field"><label for="pjBank">은행</label><input id="pjBank" class="input" value="${H.esc(f.bank)}" placeholder="예) 국민" data-input="pjField" data-f="bank"></div>
    <div class="field"><label for="pjAcc">계좌번호</label><input id="pjAcc" class="input" inputmode="numeric" value="${H.esc(f.account)}" data-input="pjField" data-f="account"></div>
    <div class="field"><label for="pjCh">소개할 곳 <span class="opt-tag">선택</span></label><input id="pjCh" class="input" placeholder="블로그 · 인스타 주소" value="${H.esc(f.channel)}" data-input="pjField" data-f="channel"></div>
  </section>
  <section class="form-sec"><h2>동의</h2><div class="agree">${[["파트너 약관에 동의해요 (수수료 기준 · 185일 환수 · 자기추천 제외)"], ["개인정보 수집·이용에 동의해요 (정산 · 원천징수용)"]].map(function (t, i) { return `<label><input type="checkbox" data-change="pjAgree" data-i="${i}"${f.agree[i] ? " checked" : ""}><span class="box">${H.icon("check")}</span><span>[필수] ${t[0]}</span></label>`; }).join("")}</div>${agBad ? '<p class="err-t">필수 동의가 필요해요</p>' : ""}</section>
  <div class="order-submit pc-only"><button type="button" class="btn btn--mg btn--block" data-act="pjSubmit">추천코드 만들기</button></div>
</div>`
    };
  };
  H.acts.pjType = function (el) { pj().type = el.dataset.v; H.rerender(el); };
  H.inputs.pjField = function (el) { pj()[el.dataset.f] = el.value; };
  H.inputs.pjAgree = function (el) { pj().agree[Number(el.dataset.i)] = el.checked; };
  H.acts.pjSubmit = function () {
    var f = pj();
    f.tried = true;
    if ((f.type === "biz" && !/^\d{10}$/.test(f.biz)) || !f.agree.every(Boolean)) { H.rerender(); H.toast("빠진 칸을 채워 주세요"); return; }
    H.state.partner = { code: "HS" + Math.random().toString(36).slice(2, 6).toUpperCase(), name: f.name, phone: f.phone, type: f.type, bank: f.bank, account: f.account, joined: H.today() };
    H.pjoin = null;
    H.save();
    H.go("#/partner/done");
  };
  H.views["partner-done"] = function () {
    var p = H.state.partner;
    if (!p) return { title: "파트너", html: `<div class="wrap"><div class="empty">아직 파트너가 아니에요.<br><br><a class="btn btn--ink btn--sm" href="#/partner">파트너스 보기</a></div></div>` };
    return { title: "추천코드", tab: false, html: `<div class="wrap"><div class="done"><div class="done__ic">${H.icon("check")}</div><h1>추천코드가 만들어졌어요</h1>
      <p class="lead">아래 링크를 보내면 돼요. 하이유플 · 하이폰 링크와도 이어져요.</p>
      <div class="ref-card"><div><b>내 추천 링크</b><small class="num">histation.co.kr/?p=${p.code}</small></div><div class="ref-card__acts"><button type="button" class="btn btn--line btn--sm" data-act="copyRef">복사</button><button type="button" class="btn btn--ink btn--sm" data-act="kakao">카톡으로 보내기</button></div></div>
      <div class="done__acts"><a class="btn btn--soft btn--sm" href="#/partner/stats">내 실적 보기</a><a class="btn btn--soft btn--sm" href="#/my">마이페이지</a></div></div></div>` };
  };
  H.views["partner-stats"] = function () {
    var p = H.state.partner;
    if (!p) return { title: "파트너 실적", html: `<div class="wrap"><div class="empty">아직 파트너가 아니에요.<br><br><a class="btn btn--ink btn--sm" href="#/partner/join">추천코드 만들기</a></div></div>` };
    var rows = [["2026.09.16", "휴대폰 · 아이폰 17 · KT 번호이동", "개통완료", FEE], ["2026.09.14", "인터넷 · LG U+ 기가 + 실속형", "설치 예약", null], ["2026.09.10", "휴대폰 · 갤럭시 Z 플립8 · SKT", "접수확인", FEE]];
    return { title: "파트너 실적", html: `<div class="wrap me-narrow"><a class="back" href="#/my">${H.icon("chev-l")}마이페이지</a>
      <header class="ph ph--tight"><h1>내 실적</h1><p class="num">추천코드 ${p.code} · ${p.joined} 시작</p></header>
      <div class="tiles"><div class="tile"><small>링크 누름</small><b class="num">37</b></div><div class="tile"><small>가입 · 접수</small><b class="num">3건</b></div><div class="tile"><small>확정 수수료</small><b class="num">${H.won(FEE)}</b></div><div class="tile"><small>지급 예정</small><b>10월 말</b></div></div>
      <h2 class="me-sec-t">소개한 건</h2>
      <table class="adm-tbl"><thead><tr><th>날짜</th><th>내용</th><th>단계</th><th>수수료</th></tr></thead><tbody>${rows.map(function (r) { return `<tr><td class="num">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td class="num">${r[3] == null ? "안내 예정" : r[2] === "개통완료" ? H.won(r[3]) : "개통되면 " + H.won(r[3])}</td></tr>`; }).join("")}</tbody></table>
      <p class="demo-note"><span class="demo-tag">시안</span>예시 값이에요 · 인터넷 · 정수기 수수료 금액은 대표가 정해요</p></div>` };
  };
})();
