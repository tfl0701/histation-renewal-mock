/* 하이스테이션 리뉴얼 목업 — 공통: 상태 · 3사 가격 계산 · 길 찾기 · 머리/바닥글 · 창
 * 하이유플 목업(core.js)의 뼈대를 그대로 쓰되, 하이스테이션은 3사를 다 파는 몰이라
 * «지금 쓰는 통신사(SKT·KT·LG U+·알뜰폰)» 와 «개통할 통신사(상품이 파는 통신사)» 가 따로 있다.
 * 가입유형은 둘을 견줘 저절로 정한다 — 같으면 기기변경, 다르면 번호이동, 알뜰폰은 늘 번호이동(대표 확정 2026-09-01).
 */
(function () {
  "use strict";
  var D = window.HS, C = window.HS_CONTENT, N = window.HS_NOTES;
  var H = (window.H = { D: D, C: C, N: N, views: {}, acts: {}, inputs: {}, after: {}, sel: {} });

  /* ---------- 작은 도구 ---------- */
  H.$ = function (s, r) { return (r || document).querySelector(s); };
  H.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  H.esc = function (v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  H.num = function (n) { return Math.round(n).toLocaleString("ko-KR"); };
  H.won = function (n) { return H.num(n) + "원"; };
  H.man = function (n) { return n >= 10000 && n % 10000 === 0 ? (n / 10000) + "만원" : H.won(n); };
  H.icon = function (name, cls) { return '<svg class="ic ' + (cls || "") + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; };
  H.prod = function (id) { return D.products.find(function (p) { return p.id === Number(id); }); };
  H.plan = function (id) { return D.plans[id]; };
  H.img = function (p, ci) {
    var c = p.colors[ci || 0];
    if (c && c[2]) return c[2];
    var f = p.colors.find(function (x) { return x[2]; });
    return f ? f[2] : "";
  };
  H.ordered = function () { return D.order.map(H.prod).filter(Boolean); };
  H.badge = function (p) { return p.badge ? '<span class="badge badge--new">' + p.badge + "</span>" : ""; };
  H.news = function (slug) { return C.news.find(function (g) { return g.slug === slug; }); };
  H.purifier = function (id) { return D.purifiers.find(function (x) { return x.id === String(id); }); };

  /* ---------- 통신사 ---------- */
  H.CARRIERS = D.carriers; // [["SKT","SKT"],["KT","KT"],["LGUP","LG U+"],["MVNO","알뜰폰"]]
  H.carrierLabel = function (c) { var f = D.carriers.find(function (x) { return x[0] === c; }); return f ? f[1] : c || ""; };
  H.floor = function (cc) { return D.floor[cc] || 47000; };
  H.floorName = function (cc) { return D.floorName[cc] || ""; };
  /* 가입유형 — 지금 쓰는 통신사와 개통할 통신사를 견줘 저절로 */
  H.method = function (p, cc) {
    var mine = H.state.carrier;
    if (!mine || mine === "MVNO") return "move";
    return mine === cc && p.change ? "change" : "move";
  };
  H.methodLabel = function (m) { return m === "change" ? "기기변경" : "번호이동"; };
  H.discountLabel = function (d) { return d === "select" ? "선택약정" : "이통사지원금"; };
  H.rowVal = function (row, method, discount) {
    var ch = method === "change";
    return discount === "official" ? (ch ? row[5] : row[4]) : (ch ? row[7] : row[6]);
  };
  /* 이 조합(통신사 × 가입유형 × 할인)에서 보여 줄 수 있는 요금제만 — 자체할인 -1 은 뺀다 */
  H.offeredRows = function (p, cc, method, discount) {
    return (p.rows[cc] || []).filter(function (r) { return H.rowVal(r, method, discount) >= 0; });
  };
  H.discountFor = function (p, want) {
    if (want === "select" && p.select) return "select";
    if (want === "official" && p.official) return "official";
    return p.official ? "official" : "select";
  };

  /* ---------- 상태(이 브라우저에만 저장) ---------- */
  var KEY = "hs-renewal-mock-v1";
  var initial = {
    loggedIn: false, user: { id: "hihi97", name: "이하이", birth: "19970815", phone: "010-2345-6789", joined: "2026.09.18" },
    carrier: null, orders: [], leads: [], alerts: [], recent: [], searches: [], reviews: [], draft: null,
    memoHidden: false, mileage: 20000, tour: null, welcomed: false, bannerOff: [], newsHidden: [], newsEdits: {},
    cmpDown: false, netAsk: false, rentAsk: false, partner: null, reviewsOn: true, queue: null
  };
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
  H.state = Object.assign({}, initial, saved);
  H.save = function () { try { localStorage.setItem(KEY, JSON.stringify(H.state)); } catch (e) { /* 저장 못 해도 화면은 돈다 */ } };
  H.reset = function () { try { localStorage.removeItem(KEY); } catch (e) {} H.state = Object.assign({}, JSON.parse(JSON.stringify(initial))); H.sel = {}; };

  /* ---------- 가격 계산 — 지금 사이트(priceCalc · supportCalc)와 같은 식 ---------- */
  var K24 = 0.059 * 1.0295 * 1.0295; // 24개월 총 이자 비율 ≈ 6.25%
  H.defaults = function (p, cc) {
    cc = cc && p.rows[cc] ? cc : (p.primary || p.carriers[0]);
    var method = H.method(p, cc), discount = H.discountFor(p, "official");
    var rows = H.offeredRows(p, cc, method, discount);
    if (!rows.length && p.select) { discount = "select"; rows = H.offeredRows(p, cc, method, discount); }
    var pre = p.presets[cc], row = rows.find(function (r) { return r[0] === pre; }) || rows[0];
    var ci = p.colors.findIndex(function (c) { return c[2]; });
    var vi = 0;
    return { cc: cc, vol: vi, color: ci < 0 ? 0 : ci, planId: row ? row[0] : null, method: method, discount: discount, payment: "installment", months: 24 };
  };
  /* 고른 값이 그 조합에서 유효한지 맞춘다 — 통신사를 바꾸면 요금제도 그 통신사 것으로 */
  H.fix = function (p, s) {
    if (!p.rows[s.cc]) s.cc = p.primary || p.carriers[0];
    s.method = H.method(p, s.cc);
    if (s.discount === "select" && !p.select) s.discount = "official";
    if (s.discount === "official" && !p.official) s.discount = "select";
    var rows = H.offeredRows(p, s.cc, s.method, s.discount);
    if (!rows.length) { s.discount = s.discount === "official" ? "select" : "official"; rows = H.offeredRows(p, s.cc, s.method, s.discount); }
    if (!rows.some(function (r) { return r[0] === s.planId; })) {
      var pre = p.presets[s.cc], row = rows.find(function (r) { return r[0] === pre; }) || rows[0];
      s.planId = row ? row[0] : null;
    }
    return s;
  };
  H.selFor = function (p) {
    if (!H.sel[p.id]) H.sel[p.id] = H.defaults(p);
    return H.fix(p, H.sel[p.id]);
  };
  H.price = function (p, s) {
    var rows = p.rows[s.cc] || [];
    var row = rows.find(function (r) { return r[0] === s.planId; }) || H.offeredRows(p, s.cc, s.method, s.discount)[0];
    var release = (p.vols[s.vol] || p.vols[0])[1];
    if (!row) return { cc: s.cc, release: release, carrierSupport: 0, self: 0, principal: release, months: 0, monthlyDevice: 0, interest: 0, totalInterest: 0, planFee: 0, planFeeBase: 0, selectMonthly: 0, monthlyTotal: 0, plan: null, planId: null };
    var ch = s.method === "change", off = s.discount === "official";
    var carrierSupport = off ? (ch ? row[3] : row[2]) : 0;
    var selfRaw = H.rowVal(row, s.method, s.discount);
    var self = Math.min(Math.max(0, selfRaw), Math.max(0, release - carrierSupport)); // 자체할인은 남은 기기값까지만
    var principal = Math.max(0, Math.round(release - carrierSupport - self));
    var months = s.payment === "installment" ? s.months : 0;
    var raw = months && principal > 0 ? (principal * (1 + K24 * (months / 24))) / months : 0;
    var monthlyDevice = raw > 0 ? Math.ceil(raw) : 0;
    var interest = raw > 0 ? Math.ceil(raw) - Math.ceil(principal / months) : 0;
    var totalInterest = monthlyDevice > 0 ? monthlyDevice * months - principal : 0;
    var planFee = off ? row[1] : Math.round(row[1] * 0.75);
    return {
      cc: s.cc, release: release, carrierSupport: carrierSupport, self: self, principal: principal, months: months,
      monthlyDevice: monthlyDevice, interest: interest, totalInterest: totalInterest,
      planFee: planFee, planFeeBase: row[1], selectMonthly: row[1] - planFee,
      monthlyTotal: monthlyDevice + planFee, plan: H.plan(row[0]), planId: row[0], offered: selfRaw >= 0
    };
  };
  /* 통신사마다 «그 통신사에서 가장 싼 조건»을 내고, 그중 실구매가가 가장 낮은 통신사를 고른다 */
  H.bestFor = function (p, cc) {
    var s = H.defaults(p, cc), best = null;
    ["official", "select"].forEach(function (d) {
      if (d === "official" && !p.official) return;
      if (d === "select" && !p.select) return;
      H.offeredRows(p, cc, s.method, d).forEach(function (row) {
        var t = Object.assign({}, s, { discount: d, planId: row[0] }), r = H.price(p, t);
        if (!best || r.principal < best.r.principal || (r.principal === best.r.principal && r.monthlyTotal < best.r.monthlyTotal)) best = { sel: t, r: r };
      });
    });
    return best;
  };
  H.best = function (p) {
    var out = null;
    p.carriers.forEach(function (cc) {
      var b = H.bestFor(p, cc);
      if (b && (!out || b.r.principal < out.r.principal || (b.r.principal === out.r.principal && b.r.monthlyTotal < out.r.monthlyTotal))) out = b;
    });
    return out;
  };
  /* 목록 카드용 — 통신사별 «기본 요금제(자비스웹 추천)» 기준으로 가장 싼 통신사 */
  H.listPrice = function (p) {
    var out = null;
    p.carriers.forEach(function (cc) {
      var s = H.defaults(p, cc), r = H.price(p, s);
      if (!out || r.principal < out.principal || (r.principal === out.principal && r.monthlyTotal < out.monthlyTotal)) out = Object.assign(r, { sel: s });
    });
    return out;
  };
  /* 24개월 동안 내는 돈 = 기기값 + 할부 이자 + 요금 24개월 */
  H.cost = function (p, s) { var r = H.price(p, s); return r.principal + r.totalInterest + r.planFee * 24; };
  H.KEEP = 7; // 185일이 지나는 7개월째까지 고른 요금제, 8개월째부터 하향 한도 요금제
  H.feeTotal = function (p, s, down) {
    var r = H.price(p, s);
    if (!down) return r.planFee * 24;
    var low = Math.min(r.planFeeBase, H.floor(s.cc)), rate = s.discount === "select" ? 0.75 : 1;
    return r.planFee * H.KEEP + Math.round(low * rate) * (24 - H.KEEP);
  };
  H.costDown = function (p, s) { var r = H.price(p, s); return r.principal + r.totalInterest + H.feeTotal(p, s, true); };
  H.cheaper = function (p, s, down) {
    if (!(p.official && p.select)) return null;
    var f = down ? H.costDown : H.cost;
    var so = Object.assign({}, s, { discount: "official" }), ss = Object.assign({}, s, { discount: "select" });
    if (!H.price(p, so).offered || !H.price(p, ss).offered) return null;
    var a = f(p, so), b = f(p, ss);
    if (a === b) return null;
    return { key: a < b ? "official" : "select", label: a < b ? "이통사지원금" : "선택약정", diff: Math.abs(a - b) };
  };

  /* 인터넷 · 정수기 같이 상담 — 상품 화면 · 주문서가 같은 값을 쓴다 */
  H.askCard = function (kind, title, desc) {
    var on = kind === "net" ? H.state.netAsk === true : H.state.rentAsk === true;
    return `<div class="bf-net${on ? " on" : ""}"><button type="button" class="bf-net__chk" data-act="askToggle" data-k="${kind}" aria-pressed="${on}">
        <span class="box">${H.icon("check")}</span>
        <span class="bf-net__t"><b>${H.esc(title)}</b><small>${H.esc(desc)}</small></span></button></div>`;
  };
  H.acts.askToggle = function (el) {
    if (el.dataset.k === "net") H.state.netAsk = !H.state.netAsk; else H.state.rentAsk = !H.state.rentAsk;
    H.save();
    if (H.refreshProduct && H.viewKey === "product") H.refreshProduct(); else H.rerender(el);
  };

  /* 금액표 줄 — 이름은 지금 사이트 그대로(«하이스테이션 자체할인») */
  H.priceRows = function (p, s, r) {
    var out = '<div class="row"><span>출고가</span><b class="num">' + H.won(r.release) + "</b></div>";
    if (s.discount === "official") out += '<div class="row"><span>이통사지원금 할인</span><b class="num minus">- ' + H.won(r.carrierSupport) + "</b></div>";
    out += '<div class="row"><span>하이스테이션 자체할인</span><b class="num minus">- ' + H.won(r.self) + "</b></div>";
    out += '<div class="row"><span>할부원금</span><b class="num">' + H.won(r.principal) + "</b></div>";
    if (r.months) {
      out += '<div class="row"><span>월 휴대폰 할부금 (' + r.months + '개월)</span><b class="num">' + H.won(r.monthlyDevice) + "</b></div>";
      out += '<div class="row row--sub"><span>통신사 할부 이자 (연 5.9%)</span><b class="num">' + H.won(r.interest) + "</b></div>";
      out += '<div class="row row--sub"><span>' + r.months + '개월 총 할부이자</span><b class="num">' + H.won(r.totalInterest) + "</b></div>";
    }
    out += '<div class="row"><span>월 통신 요금 (VAT 포함)</span><b class="num">' + H.won(r.planFee) + "</b></div>";
    if (s.discount === "select") out += '<div class="row row--sub"><span>선택약정 할인 (월 ' + H.num(r.selectMonthly) + '원 × 24개월)</span><b class="num">- ' + H.won(r.selectMonthly * 24) + "</b></div>";
    return out;
  };

  /* ---------- 탑승권 — 출발역(지금 통신사) → 도착역(개통 통신사) 이 그려진 금액 카드
   * 상품 화면 · 주문서 · 접수 완료 · 신청내역 확인 · 내 노선이 같은 한 장을 쓴다 (2026-09-18 2판) ---------- */
  H.ticketHtml = function (p, s, r, o) {
    o = o || {};
    var mine = H.state.carrier, from = mine ? H.carrierLabel(mine) : "?";
    var fromSub = mine ? "지금 쓰는 통신사" : '<button type="button" data-act="gate">지금 쓰는 통신사 고르기</button>';
    var tags = [H.discountLabel(s.discount), r.months ? r.months + "개월 할부" : "일시불", p.vols[s.vol][0] + " · " + p.colors[s.color][0]];
    var conds = o.conds !== false ? '<div class="pbox__conds">' + ["부가서비스", "카드발급", "기존폰 반납", "인터넷 가입"].map(function (c) { return '<span class="cond-pill">' + c + "<b>" + H.icon("check") + "없음</b></span>"; }).join("") + "</div>" : "";
    var rows = o.rows === "open"
      ? '<div class="ticket__rows" style="border-top:1px solid var(--line-2);padding-top:12px"><div class="pbox__rows">' + H.priceRows(p, s, r) + (o.extraRows || "") + "</div></div>"
      : '<details class="ticket__rows"><summary>금액 자세히 보기' + H.icon("chev-d") + '</summary><div class="pbox__rows">' + H.priceRows(p, s, r) + (o.extraRows || "") + "</div></details>";
    var code = o.code ? '<div class="ticket__code"><i aria-hidden="true"></i><small class="num">' + H.esc(o.code) + "</small></div>" : "";
    return '<div class="ticket' + (o.cls ? " " + o.cls : "") + '" aria-live="polite">' +
      '<div class="ticket__hd"><small>HI STATION · TICKET</small><span>' + H.esc(p.name) + "</span></div>" +
      '<div class="ticket__route">' +
        '<div class="ticket__st"><small>출발</small><b>' + from + "</b><span>" + fromSub + "</span></div>" +
        '<div class="ticket__arrow" aria-hidden="true"><i></i><em>' + H.methodLabel(s.method) + "</em></div>" +
        '<div class="ticket__st ticket__st--to"><small>도착</small><b>' + H.carrierLabel(s.cc) + "</b><span>" + H.esc(r.plan ? r.plan.name : "") + "</span></div>" +
      "</div>" +
      '<div class="ticket__tags">' + tags.map(function (t) { return "<span>" + H.esc(t) + "</span>"; }).join("") + '<span class="ok">' + H.icon("check") + "조건 없음</span></div>" +
      '<div class="ticket__cut" aria-hidden="true"></div>' +
      '<div class="ticket__main"><div><small>나의 실구매가</small><b class="num">' + H.won(r.principal) + '</b></div><div><small>월 납부 금액 (VAT 포함)</small><b class="num">' + H.won(r.monthlyTotal) + "</b>" + (r.months ? '<em class="num">휴대폰 ' + H.won(r.monthlyTotal - r.planFee) + " + 요금 " + H.won(r.planFee) + "</em>" : "") + "</div></div>" +
      conds +
      (o.note !== false ? '<p class="pbox__note">지금 보시는 금액이 최종 결제 금액이에요. 추가 청구는 없어요.' + (r.months ? " 할부를 고른 경우에만 통신사 할부 이자(연 5.9%)가 붙어요." : "") + "</p>" : "") +
      rows + code + "</div>";
  };
  H.condLine = function (p, s, r) {
    return [H.carrierLabel(s.cc) + " " + H.methodLabel(s.method), p.vols[s.vol][0], p.colors[s.color][0], (r.plan || {}).name, H.discountLabel(s.discount), r.months ? r.months + "개월 할부" : "일시불"].filter(Boolean).join(" · ");
  };

  /* ---------- 노선도(진행 단계) — 다섯 정거장 (대표 결정 2026-09, 하이유플과 같은 이름) ---------- */
  H.STEP_NAMES = ["신청", "접수확인", "준비중", "전달 예정", "개통완료"];
  H.tracker = function (step, names, small) {
    names = names || H.STEP_NAMES;
    var n = names.length;
    return '<ol class="line' + (small ? " line--sm" : "") + '" aria-label="진행 단계" style="--n:' + n + '">' + names.map(function (t, i) {
      var cls = i < step ? "is-done" : i === step ? "is-now" : "";
      return '<li class="' + cls + '"' + (i === step ? ' aria-current="step"' : "") + '><i></i><span>' + t + "</span></li>";
    }).join("") + "</ol>";
  };
  H.nextStation = function (step, names) {
    names = names || H.STEP_NAMES;
    return step >= names.length - 1 ? "" : names[step + 1];
  };

  /* ---------- 자주 묻는 질문 · 도움 ---------- */
  H.faqHtml = function (list) {
    return '<div class="faq">' + (list || C.faq).map(function (f, i) {
      return '<details class="faq__item"' + (i === 0 ? " open" : "") + '><summary><span class="faq__q">Q</span>' + H.esc(f.q) + H.icon("chev-d", "faq__chev") + '</summary><p>' + H.esc(f.a) + "</p></details>";
    }).join("") + "</div>";
  };
  H.helpBox = function () {
    var cs = C.cs;
    return `<div class="helpbox"><div><b>선택이 어려우면, 하이스테이션이 함께 확인해드립니다</b><p>요금제 비교부터 개통 이후까지, 편하게 물어보세요. 카카오톡 · AI 상담 · 전화 모두 열려 있어요.</p></div>
      <div class="helpbox__acts"><button type="button" class="btn btn--line btn--sm" data-act="chat">${H.icon("spark", "ic--sm")}AI 상담</button><button type="button" class="btn btn--line btn--sm" data-act="kakao">${H.icon("kakao", "ic--sm ic--fill")}카카오톡</button><a class="btn btn--line btn--sm num" href="tel:${cs.phone}">${H.icon("call", "ic--sm")}${cs.phone}</a></div></div>`;
  };

  /* ---------- 길 찾기 ---------- */
  H.parse = function () {
    var h = location.hash.replace(/^#\/?/, "");
    var i = h.indexOf("?");
    var path = i < 0 ? h : h.slice(0, i), qs = i < 0 ? "" : h.slice(i + 1);
    var parts = path.split("/").filter(Boolean).map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } });
    var q = {};
    new URLSearchParams(qs).forEach(function (v, k) { q[k] = v; });
    return { path: parts[0] || "", parts: parts, q: q, hash: location.hash || "#/" };
  };
  var ROUTES = { "": "home", phones: "phones", order: "order", done: "done", my: "my", news: "news", reviews: "reviews", review: "review", cs: "cs", search: "search", signup: "signup", screens: "screens", tour: "tour", partner: "partner", admin: "admin", internet: "internet", purifier: "purifier", receipt: "receipt", care: "care", event: "event", chat: "chat" };
  function viewKey(r) {
    if (r.path === "news" && r.parts[1]) return "news-item";
    if (r.path === "phone") return "product";
    if (r.path === "my" && r.parts[1]) return "my-" + r.parts[1];
    if (r.path === "signup" && r.parts[1]) return "signup-" + r.parts[1];
    if (r.path === "partner" && r.parts[1]) return "partner-" + r.parts[1];
    if (r.path === "admin") return "admin-" + (r.parts[1] || "home");
    if (r.path === "internet" && r.parts[1]) return "internet-" + r.parts[1];
    if (r.path === "purifier" && r.parts[1]) return /^\d+$/.test(r.parts[1]) ? "purifier-item" : "purifier-" + r.parts[1];
    if (r.path === "care" && r.parts[1]) return "care-" + r.parts[1];
    if (r.path === "event") return "event";
    return ROUTES[r.path] || "home";
  }
  H.go = function (hash) {
    H._forceTop = true;
    if (location.hash === hash) { H.render(); window.scrollTo(0, 0); } else { location.hash = hash; }
  };

  function header(r) {
    var cur = r.path === "phone" ? "phones" : r.path === "review" ? "reviews" : r.path;
    var nav = [["phones", "휴대폰", "#/phones"], ["internet", "인터넷", "#/internet"], ["purifier", "정수기", "#/purifier"]];
    if (H.state.reviewsOn !== false) nav.push(["reviews", "구매후기", "#/reviews"]);
    var li = H.state.loggedIn;
    return '<header class="hdr"><div class="wrap hdr__in">' +
      '<a class="logo" href="#/" aria-label="하이스테이션 첫 화면"><img class="logo__word" src="img/logo-white.png" alt="HI STATION"><img class="logo__sym" src="img/symbol-white.png" alt="HI STATION"></a>' +
      '<nav class="hdr__nav" aria-label="주 메뉴">' + nav.map(function (n) {
        return '<a href="' + n[2] + '"' + (cur === n[0] ? ' aria-current="page"' : "") + ">" + n[1] + "</a>";
      }).join("") + "</nav>" +
      '<div class="hdr__act">' +
      (li ? '<a class="hdr__txt pc-only" href="#/my">내정보</a><button type="button" class="hdr__txt pc-only" data-act="logout">로그아웃</button>'
        : '<button type="button" class="hdr__txt pc-only" data-act="login">로그인</button><a class="hdr__txt pc-only" href="#/signup">회원가입</a>') +
      '<a class="hdr__btn pc-only" href="#/search" aria-label="검색">' + H.icon("search") + "</a>" +
      '<a class="hdr__btn" href="#/my" aria-label="' + (li ? "내정보" : "로그인") + '">' + H.icon("user") + "</a>" +
      '<button class="hdr__btn mo-only" type="button" data-act="menu" aria-label="전체 메뉴">' + H.icon("menu") + "</button>" +
      "</div></div></header>";
  }
  function footer() {
    var cs = C.cs, soon = "시안: 약관 화면은 지금 사이트 것을 그대로 써요";
    return '<footer class="ftr"><div class="wrap">' +
      '<nav class="ftr__links" aria-label="바닥 메뉴">' + (H.state.reviewsOn !== false ? '<a href="#/reviews">구매후기</a>' : "") +
      '<button type="button" data-act="toast" data-msg="' + soon + '">이용약관</button><button type="button" data-act="toast" data-msg="' + soon + '">개인정보 처리방침</button><a href="#/cs">고객센터 <span class="num">' + cs.phone + "</span></a>" +
      '<a href="#/partner">파트너스</a><a href="#/care">만기 챙김</a></nav>' +
      '<p class="ftr__biz"><b>이 페이지는 하이스테이션 리뉴얼 시안이에요 · 실제 주문은 histation.co.kr</b><br>' + cs.biz + "<br>" + cs.addr + " · " + cs.email + " · " + cs.bank + "<br>공정거래위원회 · 한국정보통신진흥협회 · 통신시장유통질서건전화</p>" +
      '<div class="ftr__marks"><a href="#/cs" title="LG U+ 공식 인증 대리점 · (주)더퓨처랩"><img src="img/cert-lgu.png" alt="LG U+ 사전승낙 마크"></a></div>' +
      '<p class="ftr__logo">HI STATION</p>' +
      "</div></footer>";
  }

  H.render = function () {
    var r = (H.route = H.parse());
    var key = (H.viewKey = viewKey(r));
    if (key === "tour" && H.runTour) { H.runTour(r); return; }
    var v = (H.views[key] || H.views.home)(r) || {};
    var b = document.body.classList;
    b.toggle("has-bar", !!v.bar);
    b.toggle("memo-hidden", !!H.state.memoHidden);
    b.toggle("has-tour", !!H.state.tour);
    b.toggle("is-admin", /^admin/.test(key));
    b.toggle("is-home", key === "home");
    b.toggle("is-inner", key !== "home");
    H.$("#app").innerHTML = header(r) + '<main id="main">' + (v.html || "") + "</main>" + (v.footer === false ? "" : footer()) + (v.bar ? '<div class="bar" id="bar">' + v.bar + "</div>" : "");
    var tb = H.$("#tourBar");
    if (tb) tb.innerHTML = H.tourBar ? H.tourBar() : "";
    document.title = (v.title ? v.title + " — " : "") + "하이스테이션 리뉴얼 목업";
    if (H.after[key]) H.after[key](r);
    watchBar();
    if (H._tourAfter) { var fn = H._tourAfter; H._tourAfter = null; setTimeout(fn, 80); }
  };
  H.rerender = function (el) {
    var y = window.scrollY;
    H.render();
    window.scrollTo(0, y);
    if (el && el.dataset && H.refocus) H.refocus(el);
  };
  H.refocus = function (el) {
    var sel = '[data-act="' + el.dataset.act + '"]' + (el.dataset.k ? '[data-k="' + el.dataset.k + '"]' : "") + (el.dataset.v ? '[data-v="' + el.dataset.v + '"]' : "");
    var again = H.$(sel);
    if (again) again.focus({ preventScroll: true });
  };
  H.today = function () {
    var d = new Date();
    return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
  };
  H.addDays = function (dateStr, days) {
    var d = new Date(String(dateStr).replace(/\./g, "-"));
    d.setDate(d.getDate() + days);
    return d;
  };
  H.fmt = function (d) { return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0"); };

  /* PC 아래 띠 — 오른쪽 칸의 주문 단추가 화면 위로 지나가면 띠를 올린다 (하이유플과 같은 규칙) */
  function watchBar() {
    if (H._barOff) { H._barOff(); H._barOff = null; }
    document.body.classList.remove("bar-up");
    if (H.pdSheet) H.pdSheet(false);
    document.body.classList.toggle("bar-lip", !!H.$("#pdSheet"));
    if (!H.$("#bar")) return;
    var sel = ".pd-cta.pc-only .btn, .order-submit.pc-only .btn";
    var tick = function () {
      var cta = H.$(sel);
      if (!cta) { document.body.classList.add("bar-up"); return; }
      var r = cta.getBoundingClientRect();
      document.body.classList.toggle("bar-up", r.bottom <= 24);
    };
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    H._barOff = function () { removeEventListener("scroll", tick); removeEventListener("resize", tick); };
    tick();
  }

  /* ---------- 창 · 서랍 · 알림 ---------- */
  var sheetToken = 0, drawerToken = 0, toastTimer = 0;
  H.openSheet = function (o) {
    o = o || {};
    var sh = H.$("#sheet"), dim = H.$("#dim"), f = H.$("#sheetFoot");
    sheetToken++;
    H.$("#sheetTitle").textContent = o.title || "";
    H.$("#sheetBody").innerHTML = o.body || "";
    f.innerHTML = o.foot || ""; f.hidden = !o.foot;
    sh.classList.toggle("sheet--wide", !!o.wide);
    sh.classList.toggle("sheet--gate", !!o.gate);
    if (sh.hidden) H._lastFocus = document.activeElement;
    sh.hidden = false; dim.hidden = false;
    requestAnimationFrame(function () { sh.classList.add("on"); dim.classList.add("on"); });
    document.body.style.overflow = "hidden";
    H.$("#sheetBody").scrollTop = 0;
    setTimeout(function () { var el = sh.querySelector("[data-focus]") || sh.querySelector(".sheet__x"); if (el) el.focus({ preventScroll: true }); }, 80);
  };
  H.setSheet = function (body, foot) {
    H.$("#sheetBody").innerHTML = body;
    if (foot !== undefined) { var f = H.$("#sheetFoot"); f.innerHTML = foot || ""; f.hidden = !foot; }
    H.$("#sheetBody").scrollTop = 0;
  };
  H.closeSheet = function (instant) {
    var sh = H.$("#sheet"), dim = H.$("#dim"), t = sheetToken;
    if (sh.hidden) return;
    sh.classList.remove("on");
    if (H.$("#drawer").hidden) { dim.classList.remove("on"); document.body.style.overflow = ""; }
    var done = function () { if (t !== sheetToken) return; sh.hidden = true; if (H.$("#drawer").hidden) dim.hidden = true; };
    if (instant === true) done(); else setTimeout(done, 280);
    if (instant !== true && H._lastFocus && document.contains(H._lastFocus)) { try { H._lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  };
  H.openDrawer = function (html) {
    var dr = H.$("#drawer"), dim = H.$("#dim");
    drawerToken++;
    dr.innerHTML = html; dr.hidden = false; dim.hidden = false;
    requestAnimationFrame(function () { dr.classList.add("on"); dim.classList.add("on"); });
    document.body.style.overflow = "hidden";
    setTimeout(function () { var x = dr.querySelector("button"); if (x) x.focus({ preventScroll: true }); }, 80);
  };
  H.closeDrawer = function (instant) {
    var dr = H.$("#drawer"), dim = H.$("#dim"), t = drawerToken;
    if (dr.hidden) return;
    dr.classList.remove("on");
    if (H.$("#sheet").hidden) { dim.classList.remove("on"); document.body.style.overflow = ""; }
    var done = function () { if (t !== drawerToken) return; dr.hidden = true; if (H.$("#sheet").hidden) dim.hidden = true; };
    if (instant === true) done(); else setTimeout(done, 280);
  };
  H.toast = function (msg) {
    var t = H.$("#toast");
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("on"); }, 2600);
  };

  /* ---------- 누르기 · 입력 ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href^='#/']");
    if (a) {
      H._forceTop = true;
      if (a.getAttribute("href") === location.hash) { e.preventDefault(); H.closeSheet(); H.closeDrawer(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    }
    if (e.target.id === "dim") { H.closeSheet(); H.closeDrawer(); return; }
    var el = e.target.closest("[data-act]");
    if (el && H.acts[el.dataset.act]) { e.preventDefault(); H.acts[el.dataset.act](el, e); }
  });
  document.addEventListener("input", function (e) { var el = e.target.closest("[data-input]"); if (el && H.inputs[el.dataset.input]) H.inputs[el.dataset.input](el, e); });
  document.addEventListener("change", function (e) { var el = e.target.closest("[data-change]"); if (el && H.inputs[el.dataset.change]) H.inputs[el.dataset.change](el, e); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { H.closeSheet(); H.closeDrawer(); if (H.pdSheet) H.pdSheet(false); } });

  H.acts.closeSheet = function () { H.closeSheet(); };
  H.acts.closeDrawer = function () { H.closeDrawer(); };
  H.acts.toast = function (el) { H.toast(el.dataset.msg || ""); };
  H.acts.go = function (el) { H.closeSheet(true); H.closeDrawer(true); H.go(el.dataset.to); };
  H.acts.logout = function () { H.state.loggedIn = false; H.save(); H.toast("로그아웃했어요"); H.rerender(); };

  var scrollMem = {}, lastHash = "";
  window.addEventListener("hashchange", function () {
    scrollMem[lastHash] = window.scrollY;
    lastHash = location.hash;
    H.closeSheet(true); H.closeDrawer(true);
    H.render();
    var y = H._forceTop ? 0 : scrollMem[location.hash] || 0;
    H._forceTop = false;
    window.scrollTo(0, y);
  });

  H.start = function () {
    if (!location.hash || location.hash === "#") history.replaceState(null, "", "#/");
    lastHash = location.hash;
    H.render();
  };
})();
