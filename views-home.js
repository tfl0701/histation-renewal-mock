/* 하이스테이션 리뉴얼 목업 — 첫 화면 (시안 그대로: 배너 → 흐르는 띠 → 문장 → 휴대폰 → 소식 → 인터넷 → 정수기 → 후기)
 * 배너 5장 · 5초 넘김 · 아래 진행 줄 + «4 / 5» + 좌우 + 멈춤 (시안의 조작부 그대로)
 * 배너 글자는 그림에 넣지 않고 화면 글자로 올린다(대표 결정 2026-09-16 «배너는 화면 글자 방식»)
 */
(function () {
  "use strict";
  var H = window.H, D = H.D, C = H.C;

  /* 시안 문구: 사전예약은 9/17 에 끝나 «사전예약 탑승» 대신 정식 출시 문구로 바꿨다(기획서 «시안에서 바꾼 것») */
  var BANNERS = [
    { key: "iphone18", name: "아이폰 18 정식 출시", light: true, pc: "img/hero-iphone-pc.jpg", mo: "img/hero-iphone-mo.jpg", to: "#/phone/58",
      title: "아이폰 18,<br>가장 먼저 출발하는 방법.", sub: "아이폰 18 프로 · 프로 맥스 정식 출시.<br>세 통신사 조건을 비교해 가장 좋은 노선으로 바로 출발하세요.", pill: "아이폰 18 조건 보기" },
    { key: "fold8", name: "갤럭시 Z 폴드8 · 시안 첫 배너", pc: "img/hero-subway-pc.jpg", mo: "img/hero-subway-mo.jpg", to: "#/phones?cat=galaxy&series=z8",
      title: "새 휴대폰으로 가는<br>가장 쉬운 노선", sub: "아이폰부터 갤럭시까지<br>기기와 통신사 조건을 한곳에서 비교하세요.", pill: "모바일 노선 보기" },
    { key: "internet", name: "인터넷 + TV 사은품", theme: "card", to: "#/internet", eyebrow: "INTERNET + TV",
      title: "인터넷 갈아타면<br>사은품이 얼마인지 바로 계산", sub: "LG U+ · KT · SK 세 곳의 요금과 현금 사은품을<br>통신사만 고르면 그 자리에서 보여드려요.", pill: "사은품 확인하기", big: function () { return "최대 " + H.man(H.netMaxGift()); } },
    { key: "care", name: "만기 챙김", theme: "card2", to: "#/care", eyebrow: "만기 챙김 · 하이스테이션만",
      title: "약정 끝나는 날,<br>저희가 기억할게요", sub: "휴대폰 · 인터넷 · 정수기 만기 한 달 전에<br>그날 기준 조건과 사은품을 챙겨서 알려드려요.", pill: "만기 맡기기", list: ["휴대폰 3사", "인터넷 3사", "정수기 렌탈"] },
    { key: "randombox", name: "사진 후기 랜덤박스", theme: "card3", to: "#/event/randombox", eyebrow: "후기 이벤트",
      title: "사진 후기 쓰고<br>랜덤박스 받으세요", sub: "개통 고객 1인 1회 · 랜덤투유 선물코드를<br>카카오톡으로 보내드려요.", pill: "이벤트 보기", art: "img/pur-5.webp", noArt: true }
  ];
  H.BANNERS = BANNERS;
  H.netMaxGift = function () {
    var max = 0;
    Object.keys(D.internet.carriers).forEach(function (k) { D.internet.carriers[k].plans.forEach(function (r) { max = Math.max(max, r[6]); }); });
    return max;
  };
  function slide(b, i, n) {
    var head = `<div class="hero__slide${b.pc ? "" : " hero--" + b.theme}${b.light ? " hero__slide--light" : ""}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${n}">`;
    if (b.pc) {
      return head + `<img class="hero__img hero__img--pc pc-only" src="${b.pc}" alt="">
        <img class="hero__img hero__img--mo mo-only" src="${b.mo}" alt="">
        <div class="hero__txt"><h2>${b.title}</h2><p>${b.sub}</p><a class="pill" href="${b.to}">${b.pill}</a></div></div>`;
    }
    var big = b.big ? `<p class="hero__big num">${typeof b.big === "function" ? b.big() : b.big}</p>` : "";
    var list = b.list ? `<div class="hero__list">${b.list.map(function (x) { return "<span>" + x + "</span>"; }).join("")}</div>` : "";
    return head + `<div class="hero__img hero__img--card" aria-hidden="true"></div>
      <a class="hero__grid" href="${b.to}"><p class="hero__eyebrow">${b.eyebrow}</p><h2>${b.title}</h2>${big}<p class="hero__sub">${b.sub}</p>${list}<span class="pill">${b.pill}</span></a></div>`;
  }
  H.heroHtml = function () {
    var off = H.state.bannerOff || [], list = BANNERS.filter(function (b) { return off.indexOf(b.key) < 0; });
    if (!list.length) list = BANNERS;
    var n = list.length;
    return `<section class="hero is-run" id="hero" aria-roledescription="carousel" aria-label="이번 달 소식">
  <div class="hero__track" id="heroTrack">${list.map(function (b, i) { return slide(b, i, n); }).join("")}</div>
  <div class="hero__ctl">
    <div class="hero__prog" aria-hidden="true"><i id="heroProg"></i></div>
    <div class="hero__nav">
      <button type="button" data-act="heroStep" data-v="-1" aria-label="이전 배너">${H.icon("chev-l")}</button>
      <span class="cnt num" id="heroCnt">1 / ${n}</span>
      <button type="button" data-act="heroStep" data-v="1" aria-label="다음 배너">${H.icon("chev-r")}</button>
      <button type="button" data-act="heroPause" aria-label="자동 넘김 멈추기">${H.icon("pause", "ic--pause")}${H.icon("play", "ic--play")}</button>
    </div>
  </div>
</section>`;
  };
  var hero = { i: 0 };
  function show(i) {
    var root = H.$("#hero");
    if (!root) return;
    var slides = H.$$(".hero__slide", root), n = slides.length;
    hero.i = ((i % n) + n) % n;
    H.$("#heroTrack").style.transform = "translateX(" + -100 * hero.i + "%)";
    slides.forEach(function (s, k) {
      s.setAttribute("aria-hidden", String(k !== hero.i));
      H.$$("a, button", s).forEach(function (a) { if (k === hero.i) a.removeAttribute("tabindex"); else a.setAttribute("tabindex", "-1"); });
    });
    H.$("#heroCnt").textContent = (hero.i + 1) + " / " + n;
    var p = H.$("#heroProg");
    p.style.animation = "none"; void p.offsetWidth; p.style.animation = "";
  }
  H.initHero = function () {
    var root = H.$("#hero");
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "1";
    hero.i = 0;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) root.classList.add("is-paused");
    root.addEventListener("animationend", function (e) { if (e.animationName === "heroFill") show(hero.i + 1); });
    var track = H.$("#heroTrack"), x0 = null, moved = false;
    track.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; moved = false; root.classList.add("is-held"); }, { passive: true });
    track.addEventListener("touchmove", function (e) { if (x0 != null && Math.abs(e.touches[0].clientX - x0) > 10) moved = true; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      root.classList.remove("is-held");
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) show(hero.i + (dx < 0 ? 1 : -1));
    });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    root.addEventListener("mouseenter", function () { root.classList.add("is-held"); });
    root.addEventListener("mouseleave", function () { root.classList.remove("is-held"); });
    show(0);
  };
  H.acts.heroStep = function (el) { show(hero.i + Number(el.dataset.v)); };
  H.acts.heroPause = function (el) {
    var on = H.$("#hero").classList.toggle("is-paused");
    el.setAttribute("aria-label", on ? "자동 넘김 다시 켜기" : "자동 넘김 멈추기");
  };

  /* 흐르는 띠 — 지금 사이트 homeHistationTicker.ts 의 색·순서 그대로 */
  var TICK = [["1", "#2156E7", "#fff", "SMARTPHONES"], ["2", "#33C43D", "#000", "USED PHONE"], ["3", "#ED2E25", "#fff", "INTERNET"], ["4", "#FBDE00", "#000", "WATER PURIFIER"], ["", "", "", "ALL IN ONE PLACE"]];
  function ticker() {
    var one = TICK.map(function (t) { return `<span class="tk">${t[0] ? `<i style="background:${t[1]};color:${t[2]}">${t[0]}</i>` : ""}${t[3]}</span>`; }).join("");
    return `<div class="ticker" aria-hidden="true"><div class="ticker__row">${one}${one}</div></div>`;
  }

  /* 홈 상품 카드 — 시안 «지금 많이 찾는 휴대폰» 4장(폴드8 와이드 · 아이폰 18 프로 · 프로맥스 · 아이폰 17) */
  var HOME_PHONES = [29, 58, 62, 11];
  H.views.home = function () {
    var news = H.newsList().filter(function (g) { return g.home; }).slice(0, 3);
    var netMax = {};
    Object.keys(D.internet.carriers).forEach(function (k) {
      var max = 0, min = Infinity;
      D.internet.carriers[k].plans.forEach(function (r) { max = Math.max(max, r[6]); min = Math.min(min, r[2] + r[3]); });
      netMax[k] = { max: max, min: min };
    });
    var reviewsOn = H.state.reviewsOn !== false, revs = H.reviewsAll ? H.reviewsAll() : [];
    return {
      html: `
${H.heroHtml()}
${ticker()}
<div class="wrap">
  <section class="stmt"><small>HI STATION</small><h2><span>어디서 사는게 중요한게 아닙니다</span>어떻게 사는게 중요합니다</h2><p>하이스테이션은 휴대폰·인터넷·정수기를 조건 그대로, 숨김 없이 파는 곳입니다.</p></section>

  <section class="hsec" aria-labelledby="hpT">
    <div class="hsec__hd"><div><small>MOBILE</small><h2 id="hpT">휴대폰</h2><p>갤럭시·아이폰, 내 통신사 기준 가장 싼 조건부터</p></div><a class="btn btn--outline" href="#/phones">휴대폰 전체보기</a></div>
    <div class="hrow"><div class="hgrid">${HOME_PHONES.map(function (id) { return H.productCard(H.prod(id)); }).join("")}</div><a class="hrow__more" href="#/phones" aria-label="휴대폰 더 보기">${H.icon("chev-r")}</a></div>
  </section>

  <section class="news" aria-labelledby="nwT">
    <div class="news__hd"><div class="news__hdrow"><div><small>WHAT'S NEW</small><h2 id="nwT">하이스테이션에서<br>지금 만나볼 소식</h2><p>새로운 소식과 이벤트,<br>놓치기 아까운 혜택을 확인해보세요.</p></div><a class="pill" href="#/news">모두 보기</a></div></div>
    <div class="news__list">${news.map(function (g) { return `<a class="news-row" href="#/news/${g.slug}"><small>${H.esc(g.cat)}</small><span><b>${H.esc(g.title)}</b><span>${H.esc(g.summary)}</span></span>${H.icon("arrow")}</a>`; }).join("")}</div>
  </section>

  <section class="hsec" aria-labelledby="ntT">
    <div class="hsec__hd"><div><small>INTERNET + TV</small><h2 id="ntT">인터넷</h2><p>통신사를 고르면 요금과 현금 사은품까지 바로 계산해 드려요</p></div><a class="btn btn--outline" href="#/internet">사은품 확인하기</a></div>
    <div class="netgrid">${["LG", "KT", "SK"].map(function (k) {
      var c = D.internet.carriers[k];
      return `<a class="netcard" href="#/internet?c=${k}"><b>${c.label}</b><small>인터넷 + TV</small><p class="num">월 ${H.won(netMax[k].min)}부터 · 사은품 최대 ${H.man(netMax[k].max)}</p></a>`;
    }).join("")}</div>
  </section>

  <section class="hsec" aria-labelledby="puT">
    <div class="hsec__hd"><div><small>RENTAL</small><h2 id="puT">정수기</h2><p>코웨이·LG·SK매직 인기 모델, 월 렌탈료로 비교</p></div><a class="btn btn--outline" href="#/purifier">정수기 전체보기</a></div>
    <div class="hgrid">${D.purifiers.slice(0, 4).map(H.purifierCard).join("")}</div>
  </section>
</div>
${reviewsOn ? `<section class="rvband" aria-labelledby="rvT"><div class="wrap">
  <div class="rvband__hd"><h2 id="rvT">경험한 고객의 솔직한 후기</h2><a class="btn btn--outline" href="#/reviews">MORE</a></div>
  ${revs.length ? `<div class="rvband__grid">${revs.slice(0, 3).map(function (r) { return `<a class="rvbox" href="#/review/${r.id}"><b>${H.esc(r.phone)}</b><p>${H.esc(r.text)}</p><small class="num">${H.esc(r.name)} · ${H.esc(r.date)}</small></a>`; }).join("")}</div>`
      : `<div class="rvband__empty">아직 등록된 후기가 없습니다<br><small>개통 뒤 사진 후기를 남기면 랜덤박스를 드려요 · <a href="#/event/randombox" style="color:var(--blue);font-weight:700">이벤트 보기</a></small></div>`}
</div></section>` : ""}`
    };
  };

  /* 정수기 카드 — 첫 화면 · 목록 공용 */
  H.purifierCard = function (x) {
    return `<a class="pcard" href="#/purifier/${x.id}">
      <div class="pcard__img"><img src="${x.img}" alt="" loading="lazy"></div>
      <div class="pcard__body"><p class="pcard__brand">${H.esc(x.brand)}</p><p class="pcard__name">${H.esc(x.name)}</p>
        ${x.tags.length ? `<div class="pcard__tags">${x.tags.map(function (t) { return "<span>" + t + "</span>"; }).join("")}</div>` : ""}
        <p class="pcard__was num">월 ${H.won(x.fee)}</p><p class="pcard__now num">카드 할인시 월 ${H.won(x.card)}<em>부터</em></p></div></a>`;
  };
})();
