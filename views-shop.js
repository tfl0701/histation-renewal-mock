/* 하이스테이션 리뉴얼 목업 — 휴대폰 목록 · 상품 화면 · 통신사 관문(노선도)
 * 하이유플과 다른 점 = 3사. «지금 쓰는 통신사» 하나만 묻고(관문), 상품 화면에서는 «개통할 통신사» 세 칸을 나란히 보여 준다.
 * 가입유형(기기변경·번호이동)은 둘을 견줘 저절로 붙는다. 건너뛰기 없음 · 고르면 바로 넘어감 (대표 확정 2026-09-01)
 */
(function () {
  "use strict";
  var H = window.H, D = H.D, C = H.C;

  /* ---------- 통신사 관문 ---------- */
  H.acts.gate = function (el) {
    var cur = H.state.carrier;
    H.openSheet({
      gate: true, title: "통신사 선택",
      body: `<div class="gate__hd"><small>HI STATION · LINE</small><h2>어느 노선에서<br>오셨어요?</h2><p>출발역만 알려주시면 갈아타기는 저희가 안내합니다.</p></div>
        <div class="gate__body"><div class="gate__lines">${D.carriers.map(function (c) {
          return `<button type="button" class="gate__opt" data-act="pickCarrier" data-v="${c[0]}"${cur === c[0] ? ' aria-current="true"' : ""}${!cur && c[0] === "SKT" ? " data-focus" : ""}>${c[1]}</button>`;
        }).join("")}</div>
        <p class="gate__note">통신사를 고르면 바로 다음으로 넘어가요</p>
        <p class="gate__foot"><span aria-hidden="true">ⓘ</span><span><b>키즈폰을 새로 개통</b>하시는 경우, 보호자(법정대리인)가 쓰고 계신 통신사를 골라주세요.</span></p>
        <p class="gate__foot"><span aria-hidden="true">ⓘ</span><span>상품 화면의 ‘바꾸기’ 단추로 언제든 바꿀 수 있어요.</span></p></div>`
    });
  };
  H.acts.pickCarrier = function (el) {
    H.state.carrier = el.dataset.v;
    H.save();
    H.closeSheet(true);
    if (H.viewKey === "product") H.refreshProduct(); else H.rerender();
    H.toast(H.carrierLabel(el.dataset.v) + " 기준으로 금액을 보여드려요");
  };
  H.mineRow = function () {
    var c = H.state.carrier;
    return `<div class="mine-row"><span>${c ? `지금 쓰는 통신사 <b>${H.carrierLabel(c)}</b> 기준이에요` : "지금 쓰는 통신사를 고르면 <b>내 조건</b>으로 보여드려요"}</span><button type="button" data-act="gate">${c ? "바꾸기" : "고르기"}</button></div>`;
  };

  /* ---------- 상품 카드(시안 모양) — 통신사별 «기본 요금제» 중 가장 싼 조건 ---------- */
  H.productCard = function (p) {
    var r = H.listPrice(p), s = r.sel;
    return `<a class="hcard" href="#/phone/${p.id}">
      <div class="hcard__img"><img src="${H.img(p, s.color)}" alt="" loading="lazy"></div>
      <div class="hcard__body">${p.badge ? `<span class="hcard__badge">${p.badge}</span>` : ""}
        <p class="hcard__brand">${H.esc(p.maker)}</p><p class="hcard__name">${H.esc(p.name)}</p>
        <p class="hcard__plan">${H.esc(r.plan.name)}<span class="hcard__cc">${H.carrierLabel(s.cc)} ${H.methodLabel(s.method)}</span></p>
        <div class="hcard__line"></div>
        <div class="hcard__price num"><div><small>출고가</small><span>${H.won(r.release)}</span></div><div><small>할부원금</small><b>${H.won(r.principal)}<em>부터</em></b></div></div>
      </div></a>`;
  };

  /* ---------- 휴대폰 목록 ---------- */
  H.views.phones = function (r) {
    var q = r.q.cat || "", last = H.prod(H.state.recent[0]);
    var group = q === "iphone" ? "iphone" : q ? "galaxy" : last ? last.cat : "galaxy";
    var cat = D.cats.find(function (k) { return k.key === group; });
    var tabs = D.cats.map(function (k) { return `<a class="brand-tab" href="#/phones?cat=${k.key}"${k.key === group ? ' aria-current="true"' : ""}>${k.label}</a>`; }).join("");
    var total = 0;
    var sections = cat.series.map(function (sk) {
      var list = H.ordered().filter(function (p) { return p.series === sk; });
      total += list.length;
      if (!list.length) return "";
      return `<section class="series" id="s-${sk}" aria-labelledby="st-${sk}"><h2 class="series__t" id="st-${sk}">${D.series[sk]}<small class="num">${list.length}</small></h2><div class="hgrid">${list.map(H.productCard).join("")}</div></section>`;
    }).join("");
    return {
      title: "휴대폰",
      html: `<div class="wrap">
  <header class="ph ph--hs"><h1>한눈에 비교하고<br class="mo-only"> 더 합리적으로 선택</h1><p>SKT · KT · LG U+ 공식 인증 대리점 · 보이는 가격 그대로</p></header>
  <nav class="brand-tabs" aria-label="휴대폰 종류">${tabs}</nav>
  ${H.mineRow()}
  <p class="list-count num">${cat.label} ${total}개 · 카드 금액은 통신사 세 곳 중 ${H.state.carrier ? "내 조건에서" : "번호이동 기준"} 가장 싼 조건이에요</p>
  ${sections}
</div>`
    };
  };
  H.after.phones = function (r) {
    if (!r.q.series) return;
    var el = H.$("#s-" + r.q.series);
    if (!el) return;
    var hdr = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--hdr"), 10) || 50;
    setTimeout(function () { window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - hdr - 12); }, 40);
  };

  /* ---------- 상품 화면: 고르는 칸 ---------- */
  function optCarrier(p, s, r) {
    var cards = p.carriers.map(function (cc) {
      var t = H.fix(p, Object.assign({}, s, { cc: cc, planId: (p.presets[cc] || null) })), rr = H.price(p, t);
      return { cc: cc, sel: t, r: rr };
    });
    var min = Math.min.apply(null, cards.map(function (c) { return c.r.principal; }));
    var html = cards.map(function (c) {
      var on = c.cc === s.cc;
      return `<button type="button" class="cc" data-act="ccPick" data-v="${c.cc}" aria-pressed="${on}">${c.r.principal === min && cards.length > 1 ? '<span class="cc__tag">가장 싸요</span>' : ""}
        <b>${H.carrierLabel(c.cc)}</b><small>${H.esc(c.r.plan ? c.r.plan.name : "")}</small>
        <p class="cc__p num">${H.won(on ? r.principal : c.r.principal)}</p><p class="cc__m num">월 ${H.won(on ? r.monthlyTotal : c.r.monthlyTotal)}</p>
        <span class="cc__method">${H.methodLabel(c.sel.method)}</span></button>`;
    }).join("");
    var mine = H.state.carrier;
    var note = mine ? `${H.carrierLabel(mine)}를 쓰고 계셔서 ${mine === "MVNO" ? "어디로 가도 번호이동이에요" : H.carrierLabel(mine) + "는 기기변경, 나머지는 번호이동이에요"}. 번호는 그대로예요.` : "지금 쓰는 통신사를 고르면 기기변경·번호이동을 저절로 맞춰 드려요.";
    return `<div class="opt" data-n="02"><div class="opt__t"><h2>개통할 통신사</h2><span class="hint">세 곳 나란히 비교</span></div>
      <div class="opt__body"><div class="cc-cards${cards.length === 2 ? " cc-cards--2" : ""}">${html}</div>
      <p class="cc-note">${H.icon("train")}<span>${note} <button type="button" data-act="gate">${mine ? "지금 쓰는 통신사 바꾸기" : "지금 쓰는 통신사 고르기"}</button></span></p></div></div>`;
  }
  function optVol(p, s) {
    if (p.vols.length < 2) return `<div class="opt" data-n="03"><div class="opt__t"><h2>용량</h2><span class="hint num">${p.vols[0][0]} · 출고가 ${H.won(p.vols[0][1])}</span></div></div>`;
    return `<div class="opt" data-n="03"><div class="opt__t"><h2>용량</h2></div><div class="opt__body choice-row${p.vols.length > 2 ? " choice-row--3" : ""}">${p.vols.map(function (v, i) {
      return `<button type="button" class="choice choice--center" data-act="setOpt" data-k="vol" data-v="${i}" aria-pressed="${s.vol === i}">${v[0]}<small class="num">${H.won(v[1])}</small></button>`;
    }).join("")}</div></div>`;
  }
  H.colorPicker = function (p, ci, act) {
    var c = p.colors[ci] || p.colors[0];
    return `<div class="opt opt--color" data-n="01"><div class="opt__t"><h2>색상</h2><span class="sw-name" aria-live="polite"><i style="background:${c[1]}"></i>${c[0]}</span></div>
      <div class="opt__body swatches" role="radiogroup" aria-label="색상">${p.colors.map(function (x, i) {
        return `<button type="button" class="sw" role="radio" aria-checked="${ci === i}" aria-label="${x[0]}" title="${x[0]}" data-act="${act}" data-k="color" data-v="${i}"><i style="background:${x[1]}"></i><span class="sw__t">${x[0]}</span></button>`;
      }).join("")}</div></div>`;
  };
  function optPlan(p, s, r) {
    var pl = r.plan, n = H.offeredRows(p, s.cc, s.method, s.discount).length;
    return `<div class="opt" data-n="04"><div class="opt__t"><h2>요금제</h2><span class="hint">${H.carrierLabel(s.cc)} ${n}개 중에서 고르기</span></div>
      <div class="opt__body"><button type="button" class="plan-btn" data-act="planSheet"><span><b>${H.esc(pl.name)}</b><small>데이터 ${H.esc(pl.data)}${pl.after ? " · 다 쓰면 " + H.esc(pl.after) : ""} · 통화 ${H.esc(pl.voice)}</small></span><span class="fee num">월 ${H.won(r.planFeeBase)}${H.icon("chev-r", "ic--sm")}</span></button>
      <p class="plan-note">${H.icon("info")}185일 이후 월 ${H.num(H.floor(s.cc))}원까지 낮출 수 있어요(${H.carrierLabel(s.cc)} 기준)<a href="#/news/plan-down-185">자세히</a></p></div></div>`;
  }
  function optDiscount(p, s) {
    var both = !!(p.official && p.select), fl = H.floor(s.cc);
    var canDown = both && H.price(p, s).planFeeBase > fl;
    var down = canDown && H.state.cmpDown === true;
    var best = H.cheaper(p, s, down), when = down ? "185일 뒤 월 " + H.num(fl) + "원으로 낮추면 24개월 동안" : "24개월 동안";
    var btn = function (key, label, sub, ok) {
      return `<button type="button" class="choice" data-act="setOpt" data-k="discount" data-v="${key}" aria-pressed="${s.discount === key}"${ok ? "" : " disabled"}>${best && best.key === key ? '<span class="save">덜 내요</span>' : ""}${label}<small>${ok ? sub : "이 상품은 안 돼요"}</small></button>`;
    };
    var basis = canDown ? `<p class="cmp-basis-lab">${H.icon("spark")}나중에 요금제를 낮추실 건가요?</p>
      <div class="cmp-basis" role="group" aria-label="비교 기준"><button type="button" data-act="cmpBasis" data-v="keep" aria-pressed="${!down}">요금제 그대로</button><button type="button" data-act="cmpBasis" data-v="down" aria-pressed="${down}">요금을 낮출 생각이면</button></div>` : "";
    var line = "";
    if (best && best.key !== s.discount) line = `<p class="save-line">${H.icon("spark")}<span>이 조건에선 <b>${best.label}</b>이 ${when} <b class="num">${H.won(best.diff)}</b> 덜 내요.</span><button type="button" data-act="setOpt" data-k="discount" data-v="${best.key}">바꾸기</button></p>`;
    else if (best) line = `<p class="save-line">${H.icon("check")}<span>지금 고른 <b>${best.label}</b>이 ${when} <b class="num">${H.won(best.diff)}</b> 덜 내요.</span></p>`;
    else if (both) line = `<p class="save-line">${H.icon("info")}<span>두 방법의 24개월 합계가 같거나 한쪽만 돼요.</span></p>`;
    var more = both ? `<button type="button" class="more-btn" data-act="cmpSheet">24개월 합계 자세히 보기${H.icon("chev-r")}</button>` : "";
    return `<div class="opt" data-n="05"><div class="opt__t"><h2>할인 방법</h2><a class="hint" href="#/news/check-before-buy">어느 쪽이 나아요?</a></div>
      <div class="opt__body"><div class="choice-row">${btn("official", "이통사지원금", "기기값에서 한 번에 할인", p.official)}${btn("select", "선택약정", "매달 요금 25% 할인", p.select)}</div>${basis}${line}${more}</div></div>`;
  }
  H.acts.cmpBasis = function (el) { H.state.cmpDown = el.dataset.v === "down"; H.save(); H.refreshProduct(); H.refocus(el); };
  function cmpTable(p, s, down) {
    var so = Object.assign({}, s, { discount: "official" }), ss = Object.assign({}, s, { discount: "select" });
    var ro = H.price(p, so), rs = H.price(p, ss), fl = H.floor(s.cc);
    var co = down ? H.costDown(p, so) : H.cost(p, so), cs = down ? H.costDown(p, ss) : H.cost(p, ss);
    var k = H.KEEP, rest = 24 - k, low = Math.min(ro.planFeeBase, fl);
    var row = function (label, a, b) { return `<tr><td>${label}</td><td class="num">${a}</td><td class="num">${b}</td></tr>`; };
    var fees = down
      ? row(`요금 1~${k}개월<br><small>월 ${H.won(ro.planFeeBase)}</small>`, H.won(ro.planFee * k), H.won(rs.planFee * k)) + row(`요금 ${k + 1}~24개월<br><small>월 ${H.won(low)}</small>`, H.won(low * rest), H.won(Math.round(low * 0.75) * rest))
      : row("요금 24개월", H.won(ro.planFee * 24), H.won(rs.planFee * 24));
    var win = co === cs ? "" : co < cs ? "a" : "b";
    var minus = function (v) { return v > 0 ? "− " + H.won(v) : "없음"; };
    var head = row("출고가", H.won(ro.release), H.won(rs.release))
      + `<tr class="hl"><td>이통사지원금</td><td class="num">${minus(ro.carrierSupport)}</td><td class="num">${minus(rs.carrierSupport)}</td></tr>`
      + row("하이스테이션 자체할인", minus(ro.self), minus(rs.self));
    return `<table class="cmp-tbl"><thead><tr><th></th><th>이통사지원금</th><th>선택약정</th></tr></thead><tbody>
      ${head}${row("할부원금", H.won(ro.principal), H.won(rs.principal))}${row("할부 이자", H.won(ro.totalInterest), H.won(rs.totalInterest))}${fees}
      <tr class="tot"><td>24개월 합계</td><td class="num${win === "a" ? " win" : ""}">${H.won(co)}</td><td class="num${win === "b" ? " win" : ""}">${H.won(cs)}</td></tr></tbody></table>
      ${win ? `<p class="cmp-res">${win === "a" ? "이통사지원금" : "선택약정"}이 <span class="num">${H.won(Math.abs(co - cs))}</span> 덜 내요.</p>` : ""}`;
  }
  H.acts.cmpSheet = function () {
    var p = H.prod(H.route.parts[1]), s = H.selFor(p), r = H.price(p, s), fl = H.floor(s.cc), canDown = r.planFeeBase > fl;
    H.openSheet({
      title: "할인 방법 24개월 합계", wide: true,
      body: `<p class="plan-note plan-note--top">${H.icon("info")}${p.name} ${p.vols[s.vol][0]} · ${H.carrierLabel(s.cc)} ${H.methodLabel(s.method)} · ${r.plan.name} · ${r.months ? r.months + "개월 할부" : "일시불"} 기준</p>
        <section class="cmp-sec"><h3>요금제를 24개월 그대로 쓰면</h3>${cmpTable(p, s, false)}</section>
        ${canDown ? `<section class="cmp-sec"><h3>185일 뒤 월 ${H.num(fl)}원 요금제로 낮추면</h3>${cmpTable(p, s, true)}<p class="help-t">185일은 개통일부터 세요. 185일이 지나는 ${H.KEEP}개월째까지는 고른 요금제, ${H.KEEP + 1}개월째부터 ${H.carrierLabel(s.cc)} 한도인 월 ${H.num(fl)}원 요금제로 계산했어요. 그보다 낮추면 위약금이 생길 수 있어요.</p></section>` : `<p class="help-t">고른 요금제가 ${H.carrierLabel(s.cc)} 한도(월 ${H.num(fl)}원) 이하라 낮추는 경우는 따로 계산하지 않았어요.</p>`}
        <p class="help-t">24개월 합계 = 할부원금 + 할부 이자 + 요금. 선택약정 25% 할인은 바꾼 요금제 기준으로 이어져요. 하이스테이션 ${D.asOf.replace(/-/g, ".")} 가격 기준이에요.</p>`
    });
  };
  function optPay(s) {
    var cur = s.payment === "installment" ? String(s.months) : "0";
    return `<div class="opt opt--last" data-n="06"><div class="opt__t"><h2>구매 방식</h2><span class="hint">통신사 할부 이자 연 5.9%</span></div><div class="opt__body choice-row choice-row--3">${[["0", "일시불"], ["24", "24개월 할부"], ["30", "30개월 할부"]].map(function (o) {
      return `<button type="button" class="choice choice--center" data-act="setOpt" data-k="pay" data-v="${o[0]}" aria-pressed="${cur === o[0]}">${o[1]}</button>`;
    }).join("")}</div></div>`;
  }
  /* 금액칸 = 탑승권 한 장 (core.js H.ticketHtml) — 출발역(지금 통신사) → 도착역(개통 통신사) */
  function priceBox(p, s, r) { return H.ticketHtml(p, s, r, {}); }
  H.floatCard = function (p) {
    var s = H.selFor(p), r = H.price(p, s);
    return `<div class="pdf__prod"><span class="pdf__th"><img src="${H.img(p, s.color)}" alt=""></span><span><b>${p.name}</b><small>${H.esc(H.condLine(p, s, r))}</small></span></div>
      <div class="pbox__rows">${H.priceRows(p, s, r)}</div>
      <div class="pdf__total"><span>월 납부 금액</span><b class="num">${H.won(r.monthlyTotal)}</b></div>`;
  };
  H.productPanel = function (p) {
    var s = H.selFor(p), r = H.price(p, s);
    return H.colorPicker(p, s.color, "setOpt") + optCarrier(p, s, r) + optVol(p, s) + optPlan(p, s, r) + optDiscount(p, s) + optPay(s) + priceBox(p, s, r) +
      `<div class="pd-net">${H.askCard("net", "인터넷도 같이 상담받을게요", "같은 통신사면 결합 할인 · 사은품까지 담당자가 따로 알려드려요.")}${H.askCard("rent", "정수기도 같이 볼게요", "휴대폰 접수에 같이 실려요. 렌탈 조건은 상담으로 안내해요.")}</div>` +
      `<div class="pd-cta pc-only"><button type="button" class="btn btn--mg btn--block" data-act="order">주문하기</button>
        <div class="pd-cta__sub"><button type="button" data-act="callback">${H.icon("call")}번호만 남기고 상담받기</button><button type="button" data-act="chat">${H.icon("spark")}AI에게 물어보기</button></div></div>
      <div class="pd-cta__sub pd-sub-mo mo-only"><button type="button" data-act="callback">${H.icon("call")}번호만 남기고 상담받기</button><button type="button" data-act="chat">${H.icon("spark")}AI에게 물어보기</button></div>`;
  };
  H.priceSheetCard = function (p) {
    var s = H.selFor(p), r = H.price(p, s);
    return `<div class="pdf__prod"><span class="pdf__th"><img src="${H.img(p, s.color)}" alt=""></span><span><b>${p.name}</b><small>${H.esc(H.condLine(p, s, r))}</small></span></div>
      <div class="pbox__main"><span class="k">나의 실구매가</span><span class="v num">${H.won(r.principal)}</span></div>
      <div class="pbox__month"><span class="k">월 납부 금액 (VAT 포함)</span><span class="v num">${H.won(r.monthlyTotal)}</span></div>
      <p class="pbox__parts num"><span>휴대폰 ${H.won(r.monthlyTotal - r.planFee)}</span><i>+</i><span>요금 ${H.won(r.planFee)}</span></p>
      <div class="pbox__rows">${H.priceRows(p, s, r)}</div>
      <p class="pbox__note">지금 보시는 금액이 최종 결제 금액이에요. 추가 청구는 없어요.${r.months ? " 할부를 다 갚기 전에 한 번에 갚으면, 그 뒤 이자는 붙지 않아요." : ""}</p>`;
  };
  H.productBar = function (p) {
    var s = H.selFor(p), r = H.price(p, s);
    var up = document.body.classList.contains("pdsheet-on");
    return `<div class="pd-sheet mo-only" id="pdSheet" aria-hidden="${!up}" style="height:${stopH(H.pdStop)}px">
      <button type="button" class="pd-sheet__grab" data-act="barDetail" aria-label="금액 상세 ${up ? "접기" : "펴기"}"><i></i></button>
      <div class="pd-sheet__in">${H.priceSheetCard(p)}</div>
    </div><button type="button" class="bar__price" data-act="barDetail" aria-expanded="${up}"><small class="num">${H.state.carrier ? H.carrierLabel(H.state.carrier) + " → " : ""}${H.carrierLabel(s.cc)} ${H.methodLabel(s.method)} · 실구매가 ${H.won(r.principal)}</small><b class="num">월 ${H.won(r.monthlyTotal)}${H.icon("chev-d", "bar__chev")}</b></button><button type="button" class="bar__more pc-only" data-act="barMore" aria-expanded="false">금액 상세${H.icon("chev-d", "bar__chev2")}</button><button type="button" class="btn btn--mg" data-act="order">주문하기</button>`;
  };
  H.acts.barMore = function (el) { var on = document.body.classList.toggle("bar-open"); el.setAttribute("aria-expanded", String(on)); };

  /* 금액칸을 띠 위로 올리기 — 하이유플에서 대표가 확정한 자리 셋(접힘 22 · 절반 · 72%) 그대로 */
  var GRAB_H = 22, STOPS = ["closed", "half", "full"], DRAG_STEP = 60;
  function stopH(stop) {
    if (stop === "closed") return GRAB_H;
    if (stop === "half") return Math.round(innerHeight * 0.5);
    return Math.min(Math.round(innerHeight * 0.72), 560);
  }
  function nearestStop(h) { return STOPS.reduce(function (best, s) { return Math.abs(stopH(s) - h) < Math.abs(stopH(best) - h) ? s : best; }); }
  function stopAfterDrag(from, dy, h) {
    if (Math.abs(dy) < DRAG_STEP) return from;
    var at = STOPS.indexOf(from), step = dy > 0 ? 1 : -1;
    var one = STOPS[Math.min(STOPS.length - 1, Math.max(0, at + step))] || from;
    var near = nearestStop(h);
    if (step > 0) return STOPS.indexOf(near) > STOPS.indexOf(one) ? near : one;
    return STOPS.indexOf(near) < STOPS.indexOf(one) ? near : one;
  }
  H.pdStop = "closed";
  H.pdSheet = function (stop) {
    if (stop === true) stop = "half";
    if (stop === false || !stop) stop = "closed";
    var on = stop !== "closed";
    H.pdStop = stop;
    document.body.classList.toggle("pdsheet-on", on);
    var sh = H.$("#pdSheet");
    if (sh) {
      sh.style.transition = "";
      sh.style.height = stopH(stop) + "px";
      sh.setAttribute("aria-hidden", String(!on));
      var g = sh.querySelector(".pd-sheet__grab");
      if (g) g.setAttribute("aria-label", "금액 상세 " + (on ? "접기" : "펴기"));
      if (!on) { var inn = sh.querySelector(".pd-sheet__in"); if (inn) inn.scrollTop = 0; }
    }
    var pr = H.$(".bar__price");
    if (pr) pr.setAttribute("aria-expanded", String(on));
    var dim = H.$("#pdDim");
    if (!dim && on) { dim = document.createElement("div"); dim.className = "pd-dim"; dim.id = "pdDim"; dim.setAttribute("data-act", "pdClose"); document.body.appendChild(dim); void dim.offsetWidth; }
    if (dim) dim.classList.toggle("on", on);
    if (H.$("#sheet") && H.$("#sheet").hidden !== false) document.body.style.overflow = on ? "hidden" : "";
  };
  H.acts.pdClose = function () { H.pdSheet("closed"); };
  H.acts.barDetail = function () {
    if (matchMedia("(min-width: 1024px)").matches) {
      var box = H.$(".ticket");
      if (!box) return;
      var hdr = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--hdr"), 10) || 50;
      window.scrollTo({ top: Math.max(0, box.getBoundingClientRect().top + window.scrollY - hdr - 12), behavior: "smooth" });
      box.classList.remove("ticket--flash"); void box.offsetWidth; box.classList.add("ticket--flash");
      return;
    }
    H.pdSheet(H.pdStop === "closed" ? "half" : "closed");
  };
  (function () {
    var sh = null, y0 = 0, h0 = 0, h = 0, from = "closed", moved = false, full = 0, body = false;
    function move(e) {
      if (!sh) return;
      var dy = y0 - e.clientY;
      if (body && dy > 0 && !moved) { var el0 = sh; sh = null; el0.style.transition = ""; H.pdSheet(from); removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); return; }
      if (Math.abs(dy) > 3) moved = true;
      h = Math.max(GRAB_H, Math.min(full, h0 + dy));
      sh.style.height = h + "px";
    }
    function up(e) {
      if (!sh) return;
      var el = sh, dy = y0 - (e && e.clientY !== undefined ? e.clientY : y0);
      sh = null;
      removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      el.style.transition = "";
      if (moved) H.pdSheet(stopAfterDrag(from, dy, h));
      else if (!body) H.pdSheet(from === "closed" ? "half" : "closed");
      else H.pdSheet(from);
    }
    document.addEventListener("pointerdown", function (e) {
      if (!e.target.closest) return;
      var g = e.target.closest(".pd-sheet__grab"), inn = e.target.closest(".pd-sheet__in");
      if ((!g && !inn) || matchMedia("(min-width: 1024px)").matches) return;
      if (inn && inn.scrollTop > 0) return;
      sh = (g || inn).parentNode; body = !!inn; from = H.pdStop;
      y0 = e.clientY; h0 = sh.offsetHeight; h = h0; moved = false; full = stopH("full");
      sh.style.transition = "none";
      addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
    });
  })();

  H.refreshProduct = function () {
    var p = H.prod(H.route.parts[1]);
    if (!p) return;
    var s = H.selFor(p), panel = H.$("#pdPanel"), bar = H.$("#bar"), img = H.$("#pdImg img"), fl = H.$("#pdFloat"), dt = H.$("#pdDetail");
    if (panel) panel.innerHTML = H.productPanel(p);
    if (fl) fl.innerHTML = H.floatCard(p);
    if (bar) bar.innerHTML = H.productBar(p);
    if (dt) dt.innerHTML = detailBlock(p, s);
    if (img && img.getAttribute("src") !== H.img(p, s.color)) img.src = H.img(p, s.color);
  };

  /* 상세 구역 — 우리 자료로만(색상 · 용량 · 값). 제조사 사양은 지어내지 않는다 */
  function detailBlock(p, s) {
    var cols = p.colors.map(function (c, i) {
      return `<button type="button" class="dt-col" data-act="setOpt" data-k="color" data-v="${i}" aria-pressed="${s.color === i}"><span class="dt-col__img">${c[2] ? `<img src="${c[2]}" alt="" loading="lazy">` : ""}</span><span class="dt-col__n"><i style="background:${c[1]}"></i>${H.esc(c[0])}</span></button>`;
    }).join("");
    var rows = p.vols.map(function (v, i) {
      var r = H.price(p, Object.assign({}, s, { vol: i }));
      return `<tr${s.vol === i ? ' class="on"' : ''}><th>${v[0]}</th><td class="num">${H.won(v[1])}</td><td class="num">${H.won(r.principal)}</td><td class="num">${r.months ? "월 " + H.won(r.monthlyTotal) : "일시불"}</td></tr>`;
    }).join("");
    return `<div class="dt"><h3>색상 ${p.colors.length}가지</h3><div class="dt-cols">${cols}</div>
      <h3>용량별로 얼마인가요?</h3><div class="tbl-wrap"><table class="dt-tbl"><thead><tr><th>용량</th><th>출고가</th><th>실구매가</th><th>월 납부</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="asof">${H.carrierLabel(s.cc)} ${H.methodLabel(s.method)} · ${H.esc(H.plan(s.planId) ? H.plan(s.planId).name : "요금제")} · ${H.discountLabel(s.discount)} 기준이에요. 위에서 조건을 바꾸면 이 표도 같이 바뀌어요.</p></div>`;
  }

  H.views.product = function (r) {
    var p = H.prod(r.parts[1]);
    if (!p) return { title: "상품", html: `<div class="wrap"><p class="empty">상품을 찾을 수 없어요.<br><br><a class="btn btn--ink btn--sm" href="#/phones">휴대폰 보러 가기</a></p></div>` };
    var s = H.selFor(p);
    var tabs = [["pdBenefit", "구매혜택"], ["pdGuide", "주문 안내"], ["pdFaq", "자주 묻는 질문"]];
    var bonus = C.signupBonus();
    return {
      title: p.name, tab: false, bar: H.productBar(p),
      html: `
<div class="wrap">
  <a class="back mo-only" href="#/phones?cat=${p.cat}&series=${p.series}">${H.icon("chev-l")}휴대폰</a>
  <div class="pd">
    <div class="pd-gallery">
      <div class="pd-img" id="pdImg">${H.badge(p)}<img src="${H.img(p, s.color)}" alt="${p.name}"></div>
      <div class="pd-colors-pc pc-only" aria-hidden="true">${p.colors.map(function (c) { return `<i style="background:${c[1]}"></i>`; }).join("")}</div>
    </div>
    <div class="pd-main">
      <div class="pd-head"><h1>${p.name}</h1><p>${p.maker} · ${p.net} · ${p.carriers.map(H.carrierLabel).join(" · ")} 개통</p></div>
      ${H.mineRow()}
      ${H.state.loggedIn ? "" : `<p class="a-note">${H.icon("spark")}<span>회원가입하면 <b>${H.num(bonus)} 포인트</b>를 드려요. 주문할 때 기기값에서 바로 빼요.${bonus > 10000 ? " (10월 31일까지 2만, 그 뒤 1만)" : ""}</span></p>`}
      <div id="pdPanel">${H.productPanel(p)}</div>
    </div>
  </div>
  <aside class="pd-float pc-only" id="pdFloat" aria-hidden="true">${H.floatCard(p)}</aside>
  <div class="pd-lower">
    <nav class="pd-tabs" aria-label="상품 안내">${tabs.map(function (t, i) { return `<button type="button" data-act="jump" data-id="${t[0]}" class="${i === 0 ? "on" : ""}">${t[1]}</button>`; }).join("")}</nav>
    <section class="pd-sec" id="pdBenefit">
      <h2>복잡한 선택은 줄이고,<br>좋은 조건은 더 분명하게</h2>
      <p class="lead">추가 조건 없이, 보이는 가격 그대로. 부가서비스 가입도, 기존폰 반납도, 제휴카드 실적도, 인터넷 결합도 필요하지 않습니다.</p>
      <div class="nocond-card"><p class="nocond-card__eyebrow">NO CONDITION</p><h3>이 네 가지, 하나도 걸지 않아요</h3>
        <ul class="nocond">${[["부가서비스 가입", "별도의 유료 부가서비스 가입을 요구하지 않습니다."], ["기존폰 반납", "사용하던 휴대폰을 반납하지 않아도 됩니다."], ["제휴카드 발급 · 실적 조건", "카드 발급, 사용 실적 등을 조건에 포함하지 않습니다."], ["인터넷 결합", "인터넷 신규 가입이나 결합을 요구하지 않습니다."]].map(function (t) { return `<li>${H.icon("check")}<span>${t[0]}<small style="display:block;color:#666;font-size:12px;margin-top:2px">${t[1]}</small></span><b>없음</b></li>`; }).join("")}</ul></div>
      <div class="info-cards">
        <article class="info-card"><small>추가 청구 없음</small><h3>앞서 확인하신 월 납부 금액이 실제 금액입니다</h3><p>개통 후에 다른 명목으로 더 청구하지 않아요. 할부를 선택하신 경우에만 연 5.9% 이자가 별도로 붙어요.</p></article>
        <article class="info-card"><small>요금제</small><h3>요금제는 185일 이후 변경할 수 있습니다</h3><p>개통일 기준 185일이 지나면 통신사별 한도(SKT 45,000 · KT 50,000 · LG U+ 47,000원)까지 낮출 수 있어요. 변경 시점이 되면 마이페이지 «내 노선»에 D-day로 보여드려요.</p><a class="link-arrow" href="#/news/plan-down-185">자세히 보기${H.icon("arrow")}</a></article>
      </div>
      <ul class="bf-grid">
        <li class="bf">${H.icon("train")}<b>세 통신사 한 번에 비교</b><span>SKT · KT · LG U+ 실구매가와 월 납부를 나란히</span></li>
        <li class="bf">${H.icon("won")}<b>택배비 무료</b><span>번호이동은 유심비 7,700원만 따로 내요</span></li>
        <li class="bf">${H.icon("spark")}<b>가입하면 ${H.num(bonus)} 포인트</b><span>주문할 때 할인으로 바로 써요</span></li>
        <li class="bf">${H.icon("chat")}<b>전화 없이 개통까지</b><span>신청서 · 가입내역 확인 · 개통 · 배송</span></li>
      </ul>
      <div id="pdDetail">${detailBlock(p, s)}</div>
      <h3 class="pd-sec__h">통신사 공식인증대리점</h3>
      <p class="help-t">각 마크를 누르면 한국정보통신진흥협회가 발급한 사전승낙서 원문을 확인하실 수 있습니다.</p>
      <div class="marks">${C.marks.map(function (m) { return `<a href="https://ictmarket.or.kr:8443/agent/pop_AgentCertIcon.do?AGENT_REQ_ID=${m[3]}&AGENT_CD=${m[4]}" target="_blank" rel="noopener"><img src="${m[2]}" alt="${m[0]} 사전승낙 마크"><b>${m[0]}</b>${m[1]}</a>`; }).join("")}</div>
    </section>
    <section class="pd-sec" id="pdGuide">
      <h2>주문부터 개통까지, 딱 네 단계</h2>
      <ol class="steps">${C.process.map(function (st, i) { return `<li class="step"><i>${i + 1}</i><div><b>${st[0]}</b><p>${st[1]}</p></div></li>`; }).join("")}</ol>
      <h2 class="pd-sec__h">주문 전에 확인해 주세요</h2>
      <dl class="kv">${C.orderGuide.map(function (k) { return `<div><dt>${k[0]}</dt><dd>${k[1]}</dd></div>`; }).join("")}</dl>
      <p class="help-t">표시 금액은 선택하신 통신사·요금제·할인방법에 따라 달라집니다. 자세한 내용은 개통 전 담당자가 다시 한번 안내드립니다.</p>
    </section>
    <section class="pd-sec" id="pdFaq"><h2>자주 묻는 질문</h2>${H.faqHtml()}${H.helpBox()}</section>
  </div>
</div>`
    };
  };
  H.after.product = function (r) {
    var id = Number(r.parts[1]);
    H.state.recent = [id].concat(H.state.recent.filter(function (x) { return x !== id; })).slice(0, 8);
    H.save();
    /* 지금 사이트처럼 통신사를 아직 안 골랐으면 관문을 먼저 띄운다 — 건너뛰기 없음 */
    if (!H.state.carrier && !H.state.tour && !H._gateShown) { H._gateShown = true; setTimeout(function () { if (H.viewKey === "product") H.acts.gate(); }, 350); }
  };
  H.acts.setOpt = function (el) {
    var p = H.prod(H.route.parts[1]), s = H.selFor(p), k = el.dataset.k, v = el.dataset.v;
    if (k === "vol" || k === "color") s[k] = Number(v);
    if (k === "discount") s.discount = v;
    if (k === "pay") { if (v === "0") { s.payment = "lump"; } else { s.payment = "installment"; s.months = Number(v); } }
    H.refreshProduct();
    H.refocus(el);
  };
  H.acts.ccPick = function (el) {
    var p = H.prod(H.route.parts[1]), s = H.selFor(p);
    s.cc = el.dataset.v;
    s.planId = p.presets[s.cc] || null;
    H.fix(p, s);
    H.refreshProduct();
    H.refocus(el);
    H.toast(H.carrierLabel(s.cc) + " " + H.methodLabel(s.method) + " 금액이에요");
  };
  H.acts.planSheet = function () {
    var p = H.prod(H.route.parts[1]), s = H.selFor(p);
    var rows = H.offeredRows(p, s.cc, s.method, s.discount);
    var body = `<p class="plan-note plan-note--top">${H.icon("info")}${H.carrierLabel(s.cc)} ${H.methodLabel(s.method)} · ${H.discountLabel(s.discount)} · ${s.payment === "installment" ? s.months + "개월 할부" : "일시불"} 기준이에요</p>` +
      rows.map(function (row) {
        var pl = H.plan(row[0]), r = H.price(p, Object.assign({}, s, { planId: row[0] }));
        return `<button type="button" class="plan-opt" data-act="pickPlan" data-v="${row[0]}" aria-pressed="${s.planId === row[0]}">
          <b>${H.esc(pl.name)}</b><span class="fee num">월 ${H.won(row[1])}</span>
          <small>데이터 ${H.esc(pl.data)}${pl.after ? " · 다 쓰면 " + H.esc(pl.after) : ""} · 통화 ${H.esc(pl.voice)} · ${pl.net}</small>
          <span class="mo"><span>이 요금제로 월 납부 금액</span><b class="num">${H.won(r.monthlyTotal)}</b></span></button>`;
      }).join("");
    H.openSheet({ title: H.carrierLabel(s.cc) + " 요금제 고르기", body: body });
  };
  H.acts.pickPlan = function (el) {
    var p = H.prod(H.route.parts[1]);
    H.selFor(p).planId = Number(el.dataset.v);
    H.closeSheet();
    H.refreshProduct();
    H.toast(H.plan(Number(el.dataset.v)).name + "(으)로 바꿨어요");
  };
  H.acts.order = function () {
    var p = H.prod(H.route.parts[1]);
    if (!p) return;
    if (!H.state.carrier) { H.acts.gate(); H.toast("지금 쓰는 통신사를 먼저 골라 주세요"); return; }
    H.state.draft = { pid: p.id, sel: Object.assign({}, H.selFor(p)) };
    H.form = null;
    H.save();
    if (!H.state.loggedIn) { H.acts.login(null, "#/order"); return; }
    H.go("#/order");
  };
  H.acts.jump = function (el) {
    var t = H.$("#" + el.dataset.id);
    if (!t) return;
    H.$$(".pd-tabs button").forEach(function (b) { b.classList.toggle("on", b === el); });
    var hdr = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--hdr"), 10) || 50;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - hdr - 50, behavior: "smooth" });
  };
  H.acts.callback = function () {
    var ph = H.state.loggedIn ? H.state.user.phone : "";
    H.openSheet({
      title: "번호만 남기고 상담받기",
      body: `<p class="help-t help-t--lead">지금 고른 조건(통신사 · 요금제 · 할인)을 함께 전해 드려요. 이 번호로 상담원이 연락드려요.</p>
        <div class="field"><label for="cbPhone">휴대폰 번호<span class="req">*</span></label><input id="cbPhone" class="input" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="${ph}" data-focus></div>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="callbackSend">상담 요청하기</button><p class="demo-note"><span class="demo-tag">시안</span>실제로 전달되지 않아요</p>`
    });
  };
  H.acts.callbackSend = function () {
    var v = (H.$("#cbPhone") || {}).value || "";
    if (v.replace(/\D/g, "").length < 10) { H.toast("휴대폰 번호를 끝까지 적어 주세요"); return; }
    H.state.leads.unshift({ id: "CB" + String(Date.now()).slice(-6), kind: "callback", phone: v, date: H.today(), step: 0 });
    H.save();
    H.setSheet(`<div class="ok"><div class="ok__ic">${H.icon("check")}</div><h3>상담 요청을 받았어요</h3><p>${H.esc(v)} 번호로 연락드릴게요.<br>평일 10:00–20:00 · 토요일 11:00–20:00</p></div>`,
      `<button type="button" class="btn btn--ink btn--block" data-act="closeSheet">확인</button>`);
  };
})();
