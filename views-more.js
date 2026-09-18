/* 하이스테이션 리뉴얼 목업 — 구매후기 · 고객센터 · AI 상담 팝업 · 검색 · 전체 메뉴 · 상담 창 · 만기 챙김 · 랜덤박스 이벤트 · 기획 메모 */
(function () {
  "use strict";
  var H = window.H, D = H.D, C = H.C, N = H.N;

  /* ---------- 구매후기 (하이스테이션은 아직 0건 — 시안대로 빈 상태, «예시 보기»로 채워 볼 수 있다) ---------- */
  H.reviewsAll = function () {
    var mine = (H.state.reviews || []).slice();
    return mine.concat(H.state.sampleReviews ? C.sampleReviews : []);
  };
  H.views.reviews = function () {
    var list = H.reviewsAll();
    return {
      title: "구매후기",
      html: `<div class="wrap">
  <header class="ph ph--hs"><h1>경험한 고객의 솔직한 후기</h1><p>개통 뒤 사진과 함께 후기를 남기면 랜덤박스 선물코드를 드려요. 후기는 직원이 확인한 뒤 공개돼요.</p></header>
  <div class="demo-tools"><span class="demo-tag">시안</span><button type="button" class="btn btn--soft btn--sm" data-act="toggleSample">${H.state.sampleReviews ? "예시 후기 감추기" : "예시 후기 보기"}</button><button type="button" class="btn btn--ink btn--sm" data-act="writeReview">후기 쓰기</button></div>
  ${list.length ? `<div class="rvband__grid">${list.map(function (r) { return `<a class="rvbox" href="#/review/${r.id}"><b>${H.esc(r.phone)}</b><p>${H.esc(r.text)}</p><small class="num">${H.esc(r.name)} · ${H.esc(r.date)}${r.img ? " · 사진" : ""}</small></a>`; }).join("")}</div>`
      : `<div class="rvband__empty">아직 등록된 후기가 없습니다<br><small>첫 후기의 주인공이 되어 주세요 · <a href="#/event/randombox" style="color:var(--blue);font-weight:700">랜덤박스 이벤트</a></small></div>`}
</div>`
    };
  };
  H.views.review = function (r) {
    var x = H.reviewsAll().find(function (v) { return String(v.id) === r.parts[1]; });
    if (!x) return { title: "후기", html: `<div class="wrap"><p class="empty">없는 후기예요.<br><br><a class="btn btn--ink btn--sm" href="#/reviews">구매후기로</a></p></div>` };
    return { title: "후기", html: `<div class="wrap me-narrow"><a class="back" href="#/reviews">${H.icon("chev-l")}구매후기</a>
      <div class="rvbox" style="margin-top:12px"><b>${H.esc(x.phone)}</b>${x.img ? `<div style="margin-top:10px;aspect-ratio:1/1;background:var(--panel);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#8a8a8a;font-size:13px">사진 1장 (시안)</div>` : ""}<p style="font-size:15px">${H.esc(x.text)}</p><small class="num">${H.esc(x.name)} · ${H.esc(x.date)}</small></div></div>` };
  };
  H.acts.toggleSample = function () { H.state.sampleReviews = !H.state.sampleReviews; H.save(); H.rerender(); };
  H.acts.writeReview = function () {
    if (!H.state.loggedIn) { H.acts.login(null, "#/my/reviews"); return; }
    var done = H.state.orders.filter(function (o) { return o.step === 4; });
    var phones = done.length ? done.map(function (o) { return H.prod(o.pid).name; }) : ["아이폰 18 프로", "갤럭시 Z 플립8", "인터넷 + TV", "정수기"];
    H.openSheet({
      title: "후기 쓰기",
      body: `<p class="help-t help-t--lead">${done.length ? "개통이 끝난 신청이 있어요. 사진과 함께 남기면 랜덤박스 선물코드를 드려요." : "개통이 끝난 뒤에 남길 수 있어요. 시안에서는 그냥 써 볼 수 있어요."}</p>
        <div class="field"><label for="rvProd">무엇을 쓰셨나요</label><select id="rvProd" class="input">${phones.map(function (p) { return `<option>${H.esc(p)}</option>`; }).join("")}</select></div>
        <div class="field"><label for="rvText">이야기</label><textarea id="rvText" class="input" rows="4" placeholder="어떤 점이 좋았는지, 아쉬웠는지 편하게 적어 주세요" data-focus></textarea></div>
        <label class="btn btn--line btn--block" style="cursor:pointer" data-act="fakePhoto">${H.icon("camera")}사진 넣기 (최대 5장)</label><p class="help-t" id="rvPhotoMsg"></p>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="reviewSave">올리기</button><p class="demo-note"><span class="demo-tag">시안</span>직원이 확인한 뒤 공개돼요 · 실제로 저장되지 않아요</p>`
    });
  };
  H.acts.fakePhoto = function () { H.rvPhoto = true; var m = H.$("#rvPhotoMsg"); if (m) m.textContent = "사진 1장을 넣었어요 (시안)"; };
  H.acts.reviewSave = function () {
    var t = ((H.$("#rvText") || {}).value || "").trim(), prod = (H.$("#rvProd") || {}).value || "";
    if (t.length < 5) { H.toast("이야기를 조금 더 적어 주세요"); return; }
    H.state.reviews = [{ id: "u" + Date.now(), name: H.state.user.name.slice(0, 1) + "*" + H.state.user.name.slice(-1), date: new Date().toISOString().slice(0, 10), text: t, phone: prod, img: !!H.rvPhoto }].concat(H.state.reviews || []);
    H.rvPhoto = false;
    H.save();
    H.closeSheet(true);
    H.toast(H.rvPhoto === false ? "올렸어요. 직원이 확인하면 공개돼요" : "올렸어요");
    H.go("#/my/reviews");
  };

  /* ---------- 고객센터 ---------- */
  H.views.cs = function () {
    var cs = C.cs;
    return {
      title: "고객센터",
      html: `<div class="wrap">
  <header class="ph ph--hs"><h1>무엇을 도와드릴까요?</h1><p>항상 고객님의 입장에서 의견을 귀담아 듣겠습니다. 카카오톡 · AI 상담 · 전화 모두 열려 있어요.</p></header>
  <div class="cs-cards">
    <button type="button" class="cs-card cs-card--dark" data-act="chat"><span class="cs-card__ic">${H.icon("spark")}</span><b>하이스테이션 AI 상담</b><small>세 통신사 가격 · 요금제 · 재고를 지금 화면 금액으로 바로 답해요.</small></button>
    <button type="button" class="cs-card cs-card--kakao" data-act="kakao"><span class="cs-card__ic">${H.icon("kakao", "ic--fill")}</span><b>카카오톡 1:1 상담</b><small>가장 빠르게 답변 받으실 수 있어요.</small></button>
    <a class="cs-card" href="tel:${cs.phone}"><span class="cs-card__ic">${H.icon("call")}</span><b class="num">${cs.phone}</b><small>${cs.hours.join("<br>")}</small></a>
  </div>
  <section class="pd-sec"><h2>자주 묻는 질문</h2>${H.faqHtml()}</section>
  <section class="pd-sec"><h2>이메일 문의</h2><p class="lead">${cs.email}</p></section>
</div>`
    };
  };

  /* ---------- 상담 창(떠 있는 단추) ---------- */
  H.acts.consult = function () {
    H.closeDrawer(true);
    H.openSheet({
      title: "무엇을 도와드릴까요?",
      body: `<div class="consult-list">
        <button type="button" class="cs-card cs-card--dark" data-act="chat"><span class="cs-card__ic">${H.icon("spark")}</span><b>하이스테이션 AI 상담</b><small>세 통신사 가격 · 요금제 · 사은품을 바로 물어보세요</small></button>
        <button type="button" class="cs-card cs-card--kakao" data-act="kakao"><span class="cs-card__ic">${H.icon("kakao", "ic--fill")}</span><b>카카오톡 상담</b><small>상담원과 채팅으로 이야기해요</small></button>
        <a class="cs-card" href="tel:${C.cs.phone}"><span class="cs-card__ic">${H.icon("call")}</span><b class="num">${C.cs.phone}</b><small>${C.cs.hours[0]} · ${C.cs.hours[1]}</small></a>
      </div>`
    });
  };
  H.acts.kakao = function () { H.toast("시안: 하이스테이션 카카오톡 채널(pf.kakao.com/_aKEBX) 상담으로 연결돼요"); };

  /* ---------- AI 상담 팝업 (PC 오른쪽 아래 창 · 휴대폰 아래에서 올라오는 창) ---------- */
  var CHAT_Q = [
    ["아이폰 18 프로, 통신사 세 곳 중 어디가 싸요?", function () {
      var p = H.prod(58);
      return p.carriers.map(function (cc) { var s = H.defaults(p, cc), r = H.price(p, s); return H.carrierLabel(cc) + " " + H.methodLabel(s.method) + " · " + r.plan.name + " → 실구매가 " + H.won(r.principal) + ", 월 " + H.won(r.monthlyTotal); }).join("\n") + "\n지금 쓰는 통신사를 알려 주시면 기기변경·번호이동을 맞춰 다시 계산해 드릴게요.";
    }],
    ["요금제는 언제 낮출 수 있어요?", function () { return "개통일 기준 185일이 지나면 낮출 수 있어요.\nSKT는 월 45,000원 · KT는 50,000원 · LG U+는 47,000원 요금제까지 괜찮고, 그보다 낮추면 위약금이 생길 수 있어요."; }],
    ["인터넷 사은품은 얼마예요?", function () {
      return ["LG", "KT", "SK"].map(function (k) { var c = D.internet.carriers[k], max = Math.max.apply(null, c.plans.map(function (x) { return x[6]; })); return c.label + " 최대 " + H.man(max); }).join(" · ") + "\n인터넷 속도와 TV 구성에 따라 달라요. 인터넷 화면에서 고르면 바로 계산돼요.";
    }]
  ];
  H.chatState = { log: [] };
  function popHtml() {
    var st = H.chatState;
    var msgs = st.log.map(function (m) { return `<p class="msg msg--${m[0]}">${H.esc(m[1])}</p>`; }).join("");
    var left = CHAT_Q.filter(function (q) { return st.log.every(function (m) { return m[1] !== q[0]; }); });
    return `<div class="aip__hd"><span class="aip__who"><span class="chat-av">HS</span><b>하이스테이션 AI 상담</b><small>지금 답해요</small></span>
        <span class="aip__acts"><button type="button" data-act="chatReset">새 상담</button><button type="button" class="aip__x" data-act="aiClose" aria-label="닫기">${H.icon("close")}</button></span></div>
      <div class="aip__body" id="chatBox"><p class="msg msg--ai">안녕하세요, 하이스테이션이에요 😊<br>찾으시는 기종이나 궁금한 점을 편하게 말씀해 주세요. 세 통신사 금액을 바로 비교해 드려요.</p>${msgs}
        ${left.length ? `<div class="chat-sugg">${left.map(function (q) { return `<button type="button" data-act="chatAsk" data-i="${CHAT_Q.indexOf(q)}">${q[0]}</button>`; }).join("")}</div>` : `<div class="chat-sugg"><button type="button" data-act="kakao">상담원과 이야기하기</button></div>`}</div>
      <div class="aip__foot"><div class="ai-send"><input class="input" id="chatInput" placeholder="궁금한 내용을 적어 주세요" aria-label="궁금한 내용"><button type="button" class="ai-send__go" data-act="chatSend" aria-label="보내기">${H.icon("arrow")}</button></div>
        <p class="aip__note">${H.icon("info")}<span>이 대화는 담당 직원도 함께 봐요 · 지금 화면 금액으로 답해요</span></p></div>`;
  }
  H.acts.chat = function () {
    H.closeSheet(true); H.closeDrawer(true);
    var el = H.$("#aiPop");
    if (!el) { el = document.createElement("div"); el.id = "aiPop"; el.className = "aip"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "AI 상담"); document.body.appendChild(el); }
    el.innerHTML = popHtml();
    document.body.classList.add("ai-on");
    var i = H.$("#chatInput"); if (i) setTimeout(function () { i.focus(); }, 60);
  };
  H.acts.aiOpen = H.acts.chat;
  H.acts.aiClose = function () { document.body.classList.remove("ai-on"); var el = H.$("#aiPop"); if (el) el.remove(); };
  function refresh() { var el = H.$("#aiPop"); if (el) { el.innerHTML = popHtml(); var b = H.$("#chatBox"); if (b) b.scrollTop = b.scrollHeight; } }
  H.acts.chatReset = function () { H.chatState = { log: [] }; refresh(); };
  H.acts.chatAsk = function (el) { var q = CHAT_Q[Number(el.dataset.i)]; H.chatState.log.push(["me", q[0]], ["ai", q[1]()]); refresh(); };
  H.acts.chatSend = function () {
    var el = H.$("#chatInput"), v = (el && el.value || "").trim();
    if (!v) { H.toast("궁금한 내용을 적어 주세요"); return; }
    H.chatState.log.push(["me", v], ["ai", "시안에서는 위 질문에만 답해요. 실제 상담에서는 이 물음도 AI가 받고, 어려우면 직원이 이어받아요."]);
    refresh();
  };
  H.views.chat = function () { setTimeout(H.acts.chat, 50); return { title: "AI 상담", html: `<div class="wrap"><header class="ph"><h1>AI 상담</h1><p>팝업으로 열려요.</p></header></div>` }; };

  /* ---------- 검색 ---------- */
  var POPULAR = ["아이폰 18 프로", "폴드8", "플립8", "갤럭시 S26", "인터넷 사은품", "정수기", "요금제 낮추기"];
  function norm(s) {
    return String(s).toLowerCase().replace(/\s+/g, "").replace(/iphone/g, "아이폰").replace(/galaxy/g, "갤럭시").replace(/promax|프로맥스/g, "프로맥스").replace(/pro/g, "프로").replace(/air/g, "에어").replace(/ultra/g, "울트라").replace(/plus|\+/g, "플러스").replace(/fold/g, "폴드").replace(/flip/g, "플립");
  }
  function find(q) {
    var toks = q.trim().split(/\s+/).map(norm).filter(Boolean);
    var hit = function (text) { var t = norm(text); return toks.every(function (k) { return t.indexOf(k) >= 0; }); };
    return {
      prods: H.ordered().filter(function (p) { return hit(p.name + " " + p.maker + " " + (D.series[p.series] || "")); }),
      news: H.newsList().filter(function (g) { return hit(g.title + " " + g.summary + " " + g.cat + " 요금제 낮추기 사은품 인터넷 번호이동"); }),
      purs: D.purifiers.filter(function (x) { return hit(x.name + " " + x.brand + " 정수기 " + x.tags.join(" ")); })
    };
  }
  function resultsHtml(q) {
    if (!q.trim()) {
      var recent = H.state.searches;
      return (recent.length ? `<h2>최근 찾은 말</h2><div class="kw">${recent.map(function (k) { return `<button type="button" data-act="kw" data-v="${H.esc(k)}">${H.esc(k)}</button>`; }).join("")}</div>` : "") +
        `<h2>많이 찾는 말</h2><div class="kw">${POPULAR.map(function (k) { return `<button type="button" data-act="kw" data-v="${k}">${k}</button>`; }).join("")}</div>`;
    }
    var res = find(q);
    if (!res.prods.length && !res.news.length && !res.purs.length) return `<p class="empty">«${H.esc(q)}»에 맞는 결과가 없어요.<br>다른 말로 찾아보거나 상담으로 물어보세요.<br><br><button type="button" class="btn btn--ink btn--sm" data-act="chat">AI에게 물어보기</button></p>`;
    return (res.prods.length ? `<h2>휴대폰 ${res.prods.length}</h2><div>${res.prods.map(function (p) { var r = H.listPrice(p); return `<a class="res-row" href="#/phone/${p.id}"><span class="th"><img src="${H.img(p, r.sel.color)}" alt=""></span><span><b>${p.name}</b><small class="num">${H.carrierLabel(r.sel.cc)} 기준 실구매가 ${H.won(r.principal)}</small></span></a>`; }).join("")}</div>` : "") +
      (res.purs.length ? `<h2>정수기 ${res.purs.length}</h2><div>${res.purs.map(function (x) { return `<a class="res-row" href="#/purifier/${x.id}"><span class="th"><img src="${x.img}" alt=""></span><span><b>${H.esc(x.name)}</b><small class="num">카드 할인시 월 ${H.won(x.card)}부터</small></span></a>`; }).join("")}</div>` : "") +
      (res.news.length ? `<h2>소식 ${res.news.length}</h2><div>${res.news.map(function (g) { return `<a class="res-row" href="#/news/${g.slug}"><span class="th">${H.icon("doc")}</span><span><b>${H.esc(g.title)}</b><small>${H.esc(g.cat)}</small></span></a>`; }).join("")}</div>` : "");
  }
  H.views.search = function (r) {
    var q = r.q.q || "";
    return { title: "검색", html: `<div class="wrap"><div class="srch">
  <div class="srch__box">${H.icon("search")}<input id="srchQ" type="search" value="${H.esc(q)}" placeholder="휴대폰 · 정수기 이름이나 궁금한 말을 적어 보세요" aria-label="검색어" data-input="search" data-change="searchCommit" enterkeyhint="search" autocomplete="off"><button type="button" data-act="clearSearch" aria-label="검색어 지우기">${H.icon("close", "ic--sm")}</button></div>
  <div id="srchRes">${resultsHtml(q)}</div></div></div>` };
  };
  H.after.search = function () { var i = H.$("#srchQ"); if (i) i.focus({ preventScroll: true }); };
  H.inputs.search = function (el) { H.$("#srchRes").innerHTML = resultsHtml(el.value); history.replaceState(null, "", "#/search" + (el.value ? "?q=" + encodeURIComponent(el.value) : "")); };
  H.inputs.searchCommit = function (el) { var v = el.value.trim(); if (!v) return; H.state.searches = [v].concat(H.state.searches.filter(function (x) { return x !== v; })).slice(0, 6); H.save(); };
  H.acts.kw = function (el) { var i = H.$("#srchQ"); if (!i) return; i.value = el.dataset.v; H.inputs.search(i); H.inputs.searchCommit(i); };
  H.acts.clearSearch = function () { var i = H.$("#srchQ"); if (!i) return; i.value = ""; H.inputs.search(i); i.focus(); };

  /* ---------- 전체 메뉴(서랍) ---------- */
  H.acts.menu = function () {
    var cs = C.cs, c = H.state.carrier;
    H.openDrawer(`<div class="dr-hd"><img src="img/logo-white.png" alt="HI STATION"><button type="button" class="sheet__x" data-act="closeDrawer" aria-label="메뉴 닫기">${H.icon("close")}</button></div>
      <div class="dr-body">
        <a class="dr-search" href="#/search">${H.icon("search")}휴대폰 · 정수기 · 궁금한 말 찾기</a>
        <button type="button" class="mine-row" style="width:100%" data-act="gate"><span>${c ? `지금 쓰는 통신사 <b>${H.carrierLabel(c)}</b>` : "지금 쓰는 통신사 <b>고르기</b>"}</span><span style="font-size:12px;color:#666">바꾸기</span></button>
        <nav class="dr-nav" aria-label="전체 메뉴">
          <a href="#/phones">휴대폰${H.icon("chev-r")}</a>
          <div class="dr-sub">${D.cats.map(function (k) { return `<a href="#/phones?cat=${k.key}">${k.label}</a>`; }).join("")}</div>
          <a href="#/internet">인터넷 + TV${H.icon("chev-r")}</a>
          <a href="#/purifier">정수기${H.icon("chev-r")}</a>
          <a href="#/news">소식 · 구매 가이드${H.icon("chev-r")}</a>
          ${H.state.reviewsOn !== false ? `<a href="#/reviews">구매후기${H.icon("chev-r")}</a>` : ""}
          <a href="#/care">만기 챙김${H.icon("chev-r")}</a>
          <a href="#/partner">파트너스${H.icon("chev-r")}</a>
          <a href="#/cs">고객센터${H.icon("chev-r")}</a>
          <a href="#/my">${H.state.loggedIn ? "내정보" : "로그인 · 회원가입"}${H.icon("chev-r")}</a>
        </nav>
        <button type="button" class="btn btn--mg btn--block" data-act="alert" data-slug="iphone18-alert">${H.icon("bell")}아이폰 소식 알림 신청</button>
      </div>
      <div class="dr-foot">고객센터 <b class="num">${cs.phone}</b><br>${cs.hours[0]} · ${cs.hours[1]}</div>`);
  };

  /* ---------- 만기 챙김 (하이스테이션만 할 수 있는 상시 서비스 — 기획 2판) ---------- */
  var ITEMS = [["휴대폰", "phone"], ["인터넷", "wifi"], ["정수기", "drop"]];
  var CO = { "휴대폰": ["SKT", "KT", "LG U+", "알뜰폰"], "인터넷": ["LG U+", "KT", "SK", "기타"], "정수기": ["코웨이", "LG", "SK매직", "기타"] };
  function care() {
    if (!H.care) { var u = H.state.user, li = H.state.loggedIn; H.care = { item: "휴대폰", co: "", due: "", unknown: false, name: li ? u.name : "", phone: li ? u.phone : "", agree: false, tried: false }; }
    return H.care;
  }
  H.resetCare = function () { H.care = null; };
  H.fillCareSample = function () { Object.assign(care(), { item: "인터넷", co: "KT", due: "2027-03", name: "이하이", phone: "010-2345-6789", agree: true, tried: false }); };
  H.views.care = function () {
    var f = care();
    var bad = function (k) { return f.tried && (k === "co" ? !f.co : k === "due" ? (!f.due && !f.unknown) : k === "phone" ? String(f.phone).replace(/\D/g, "").length < 10 : k === "agree" ? !f.agree : !String(f[k] || "").trim()); };
    return {
      title: "만기 챙김",
      html: `<div class="wrap">
  <section class="care-hero"><small>만기 챙김 · 하이스테이션만</small><h1>약정 끝나는 날,<br>저희가 챙겨드릴게요.</h1><p>휴대폰 · 인터넷 · 정수기에는 전부 약정이 있어요. 그런데 끝나는 날을 기억하는 분은 거의 없죠. 만기 시점만 남겨 두시면 한 달 전에 알림톡으로 알려드리고, 그날 기준 가장 좋은 조건과 사은품을 함께 담아 보내드려요.</p><a class="btn btn--pill" href="#careForm">만기 맡기기</a></section>
  <div class="care-steps">
    <div class="care-step"><i>1</i><div><b>맡기기</b><p>품목 · 지금 쓰는 곳 · 만기 시점(대략도 돼요) · 연락처만 남겨요. 모르시면 «모르겠어요»에 체크 — 확인하는 방법을 알림톡으로 보내드려요.</p></div></div>
    <div class="care-step"><i>2</i><div><b>맡아두는 구간</b><p>손님은 아무것도 안 하셔도 돼요. 마이페이지 «내 노선»에 맡긴 만기가 D-day로 떠요.</p></div></div>
    <div class="care-step"><i>3</i><div><b>챙겨드리는 날</b><p>만기 한 달 전에 «챙겨드릴 때가 됐어요» 알림톡이 가요. 단추를 누르면 그 품목의 오늘 조건 화면으로 바로 이어져요.</p></div></div>
  </div>
  <section class="form-sec" id="careForm" style="margin-top:28px"><h2>어떤 만기를 맡기실래요?</h2>
    <div class="demo-tools"><span class="demo-tag">시안</span><button type="button" class="btn btn--soft btn--sm" data-act="careSample">예시로 채우기</button></div>
    <div class="seg3" role="group" aria-label="품목">${ITEMS.map(function (x) { return `<button type="button" data-act="carePick" data-k="item" data-v="${x[0]}" aria-pressed="${f.item === x[0]}">${H.icon(x[1])}${x[0]}</button>`; }).join("")}</div>
    <p class="help-t" style="margin-top:14px">지금 쓰는 ${f.item === "정수기" ? "브랜드" : "통신사"}</p>
    <div class="seg4" role="group" aria-label="지금 쓰는 곳">${CO[f.item].map(function (c) { return `<button type="button" data-act="carePick" data-k="co" data-v="${c}" aria-pressed="${f.co === c}">${c}</button>`; }).join("")}</div>${bad("co") ? '<p class="err-t">지금 쓰는 곳을 골라 주세요</p>' : ""}
    <div class="field" style="margin-top:14px"><label for="careDue">만기 시점 (연 · 월)</label><input id="careDue" class="input${bad("due") ? " bad" : ""}" type="month" value="${H.esc(f.due)}" data-input="careField" data-f="due"${f.unknown ? " disabled" : ""}>${bad("due") ? '<p class="err-t">만기 시점을 넣거나 «모르겠어요»에 체크해 주세요</p>' : '<p class="help-t">대략이어도 돼요. 가입한 달에서 약정 기간(보통 휴대폰 24개월 · 인터넷 36개월 · 정수기 3~5년)을 더하면 돼요.</p>'}</div>
    <div class="agree"><label><input type="checkbox" data-change="careUnknown"${f.unknown ? " checked" : ""}><span class="box">${H.icon("check")}</span><span>만기를 모르겠어요 — 확인하는 방법을 알림톡으로 보내 주세요</span></label></div>
  </section>
  <section class="form-sec"><h2>알림 받을 분</h2>
    <div class="field"><label for="careName">이름<span class="req">*</span></label><input id="careName" class="input${bad("name") ? " bad" : ""}" value="${H.esc(f.name)}" data-input="careField" data-f="name" autocomplete="name">${bad("name") ? '<p class="err-t">이름을 적어 주세요</p>' : ""}</div>
    <div class="field"><label for="carePhone">휴대폰 번호<span class="req">*</span></label><input id="carePhone" class="input${bad("phone") ? " bad" : ""}" inputmode="tel" value="${H.esc(f.phone)}" placeholder="010-0000-0000" data-input="careField" data-f="phone">${bad("phone") ? '<p class="err-t">번호를 끝까지 적어 주세요</p>' : ""}</div>
    <div class="agree"><label><input type="checkbox" data-change="careAgree"${f.agree ? " checked" : ""}><span class="box">${H.icon("check")}</span><span>[필수] 만기 알림톡 받기와 개인정보 수집·이용에 동의해요</span></label></div>${bad("agree") ? '<p class="err-t">동의가 필요해요</p>' : ""}
    <button type="button" class="btn btn--mg btn--block pd-more" data-act="careSubmit">맡기기</button>
    <p class="demo-note"><span class="demo-tag">시안</span>실제로 저장되지 않아요 · 등록만으로 드리는 것은 없어요(챙겨드리는 것 자체가 혜택)</p>
  </section>
  <section class="pd-sec"><h2>이렇게 챙겨드려요 · 알림톡 예시</h2>
    <p class="kchat-label">① 맡긴 직후</p><div class="kchat"><div class="kchat__who"><span class="kchat__av">HS</span><b>하이스테이션</b><small>알림톡</small></div><div class="kchat__bubble">${H.esc(C.careMsg.reg.replace("#{NAME}", "이하이").replace("#{ITEM}", "인터넷(KT)").replace("#{DUE}", "2027년 3월"))}</div></div>
    <p class="kchat-label">② 만기 한 달 전</p><div class="kchat"><div class="kchat__who"><span class="kchat__av">HS</span><b>하이스테이션</b><small>알림톡</small></div><div class="kchat__bubble">${H.esc(C.careMsg.due.replace("#{NAME}", "이하이").replace("#{ITEM}", "인터넷(KT)").replace("#{DUE}", "2027년 3월"))}<div class="kchat__btn" style="margin-top:10px;background:#fff;border-radius:8px;padding:10px;text-align:center;font-weight:700;color:var(--blue)">내 조건 확인하기</div></div></div>
  </section>
</div>`
    };
  };
  H.acts.carePick = function (el) { var f = care(), k = el.dataset.k; f[k] = el.dataset.v; if (k === "item") f.co = ""; H.rerender(el); };
  H.inputs.careField = function (el) { care()[el.dataset.f] = el.value; };
  H.inputs.careUnknown = function (el) { care().unknown = el.checked; H.rerender(); };
  H.inputs.careAgree = function (el) { care().agree = el.checked; };
  H.acts.careSample = function () { H.fillCareSample(); H.rerender(); H.toast("예시 값으로 채웠어요"); };
  H.acts.careSubmit = function () {
    var f = care();
    f.tried = true;
    var ok = f.co && (f.due || f.unknown) && f.name.trim() && String(f.phone).replace(/\D/g, "").length >= 10 && f.agree;
    if (!ok) { H.rerender(); var first = H.$(".input.bad") || H.$(".err-t"); if (first) first.scrollIntoView({ block: "center", behavior: "smooth" }); H.toast("빠진 칸을 채워 주세요"); return; }
    var l = { id: "CR" + String(Date.now()).slice(-6), kind: "care", item: f.item, carrier: f.co, due: f.unknown ? "" : f.due, unknown: f.unknown, name: f.name, phone: f.phone, date: H.today() };
    H.state.leads.unshift(l);
    H.care = null;
    H.save();
    H.go("#/care/done?id=" + l.id);
  };
  H.views["care-done"] = function (r) {
    var l = H.state.leads.find(function (x) { return x.id === r.q.id; });
    if (!l) return { title: "만기 챙김", html: `<div class="wrap"><div class="empty">맡긴 내용을 찾을 수 없어요.</div></div>` };
    var due = l.unknown ? "확인 방법 안내 예정" : l.due.replace("-", "년 ") + "월";
    var msg = C.careMsg.reg.replace("#{NAME}", l.name).replace("#{ITEM}", l.item + "(" + l.carrier + ")").replace("#{DUE}", due);
    return { title: "만기 챙김 완료", tab: false, html: `<div class="wrap"><div class="done">
  <div class="done__ic">${H.icon("calendar")}</div><h1>잘 맡아두겠습니다</h1>
  <p class="lead">${H.esc(l.name)}님의 ${H.esc(l.item)}(${H.esc(l.carrier)}) 만기를 맡았어요. ${l.unknown ? "만기를 확인하는 방법을 알림톡으로 보내드려요." : "만기 한 달 전에 그날 기준 조건과 사은품을 챙겨서 알려드릴게요."} 지금 하실 일은 없어요.</p>
  <div class="sum"><dl class="kv"><div><dt>품목</dt><dd>${H.esc(l.item)} · ${H.esc(l.carrier)}</dd></div><div><dt>만기 시점</dt><dd>${H.esc(due)}</dd></div><div><dt>알림 받을 번호</dt><dd class="num">${H.esc(l.phone)}</dd></div></dl></div>
  <p class="kchat-label">지금 이렇게 가요 · 알림톡</p>
  <div class="kchat"><div class="kchat__who"><span class="kchat__av">HS</span><b>하이스테이션</b><small>알림톡</small></div><div class="kchat__bubble">${H.esc(msg)}</div></div>
  <div class="done__acts"><a class="btn btn--soft btn--sm" href="#/my">내 노선에서 보기</a><a class="btn btn--soft btn--sm" href="#/care">하나 더 맡기기</a><a class="btn btn--soft btn--sm" href="#/">첫 화면으로</a></div>
</div></div>` };
  };

  /* ---------- 랜덤박스 후기 이벤트 (글과 칸으로 · 대표 결정: 그림 기획전 말고) ---------- */
  H.views.event = function () {
    return { title: "후기이벤트", html: `<div class="wrap">
  <header class="news-hd"><small>후기 이벤트 · 랜덤투유 × HI STATION</small><h1>사진 후기 쓰고<br>랜덤박스 받으세요</h1><p>하이스테이션에서 휴대폰을 개통하고 사진과 함께 후기를 남겨주신 분께 랜덤투유 랜덤박스 선물코드를 드립니다. 개통 고객 대상 · 1인 1회</p></header>
  <div class="news-body">
    <h2>참여 방법은 간단합니다</h2>
    <ol class="steps">${[["사진과 함께 후기 작성", "하이스테이션에서 휴대폰을 개통한 후, 마이페이지 › 구매 후기 › 후기 쓰기에서 사진과 함께 남겨주세요."], ["고객센터에 선물코드 요청", "후기 작성을 마쳤다면 카카오톡 채널로 랜덤박스 선물코드를 요청해 주세요."], ["카카오톡·문자로 코드 수신", "전달받은 선물코드를 확인해 주세요."], ["랜덤투유 앱에서 박스 개봉", "랜덤투유 앱 마이페이지 › 선물함에 코드를 넣고 «하이스테이션님이 보낸 선물»을 열어 당첨 상품을 확인해 주세요."]].map(function (st, i) { return `<li class="step"><i>${i + 1}</i><div><b>${st[0]}</b><p>${st[1]}</p></div></li>`; }).join("")}</ol>
    <h2>꼭 읽어주세요</h2>
    <p>하이스테이션에서 휴대폰을 개통한 고객 대상 이벤트입니다. 사진과 함께 후기를 남겨주신 분께 드립니다. 랜덤박스는 고객 1인당 1회 제공되며 상품은 무작위로 제공됩니다. 구성은 운영 상황에 따라 변경될 수 있고, 이벤트는 별도 공지 없이 변경 또는 종료될 수 있습니다.</p>
    <a class="btn btn--mg btn--block" href="#/my/reviews">마이페이지에서 후기 남기기</a>
    <p class="help-t">로그인 후 작성할 수 있습니다.</p>
  </div></div>` };
  };

  /* ---------- 기획 메모(노란 연필 단추) ---------- */
  H.acts.memo = function () {
    var key = H.viewKey, n = (N.screens || {})[key] || (N.screens || {})[key.split("-")[0]];
    var body = n ? `<h3 class="memo-t">${H.esc(n.title)}</h3><ul class="memo-list">${(n.points || []).map(function (p) { return "<li>" + p + "</li>"; }).join("")}</ul>${(n.ask || []).length ? `<h3 class="memo-t memo-t--ask">대표님이 정해 주실 것</h3><ul class="memo-list memo-list--ask">${n.ask.map(function (p) { return "<li>" + p + "</li>"; }).join("")}</ul>` : ""}`
      : `<p class="help-t">이 화면은 따로 적은 메모가 없어요.</p>`;
    H.openSheet({ title: "기획 메모 · " + (n ? n.title : key), wide: true,
      body: body + `<p class="demo-note"><span class="demo-tag">시안</span>기획서 전체는 <a href="plan.html" target="_blank" rel="noopener" style="color:var(--blue);font-weight:700">plan.html</a> · 화면 순서대로 보기는 <a href="#/screens" style="color:var(--blue);font-weight:700">여기</a></p>` });
  };
  H.acts.toggleMemoHidden = function () { H.state.memoHidden = !H.state.memoHidden; H.save(); H.rerender(); };
})();
