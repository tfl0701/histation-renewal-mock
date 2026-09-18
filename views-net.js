/* 하이스테이션 리뉴얼 목업 — 인터넷 + TV(3사 사은품 계산 → 신청) · 정수기(목록 → 상세 → 렌탈 신청)
 * 요금·사은품은 자비스웹 hs_internet_settings(기준일 2026-09-07) 값. 손님 사은품 = 정책금 − 마진(customerGiftOf) 로 미리 계산해 넣었다.
 * 정수기 목록 값은 지금 histation.co.kr/purifier 그대로, 상세 조건(약정·관리)은 예시.
 */
(function () {
  "use strict";
  var H = window.H, D = H.D, C = H.C;
  var NET = D.internet.carriers, NKEYS = ["LG", "KT", "SK"];

  /* ---------- 인터넷 ---------- */
  function nsel() {
    if (!H.nsel) H.nsel = { c: "LG", net: 0, tv: -1, wifi: false };
    return H.nsel;
  }
  function netRow(c, s) {
    var cfg = NET[c], iname = cfg.internet[s.net][0], tname = s.tv < 0 ? "" : cfg.tv[s.tv][0];
    return cfg.plans.find(function (r) { return r[0] === iname && r[1] === tname; }) || null;
  }
  function installFee(c, s) {
    var cfg = NET[c], key = s.tv < 0 ? "인터넷단독" : "인터넷+TV";
    var f = cfg.install.find(function (x) { return x[0] === key; });
    return f ? f[1] : null;
  }
  H.netQuote = function (c, s) {
    var cfg = NET[c], row = netRow(c, s);
    if (!row) return null;
    var wifiFee = s.wifi ? cfg.wifi : 0;
    return { carrier: cfg.label, internet: cfg.internet[s.net], tv: s.tv < 0 ? null : cfg.tv[s.tv], monthly: row[2] + row[3] + wifiFee, phone: row[5] + wifiFee, gift: row[6], install: installFee(c, s), wifiFee: wifiFee, title: cfg.internet[s.net][0] + (s.tv < 0 ? " (TV 없이)" : " + " + cfg.tv[s.tv][0]) };
  };
  function nsum(q) {
    return `<div class="nsum" id="nsum">
      <div class="nsum__row"><small>고른 구성</small><b>${H.esc(q.carrier)} · ${H.esc(q.title)}${q.wifiFee ? " · 공유기" : ""}</b></div>
      <div class="nsum__row"><small>월 요금 (3년 약정)</small><b class="num">${H.won(q.monthly)}</b></div>
      <div class="nsum__row"><small>${H.esc(q.carrier)} 휴대폰과 결합하면</small><b class="num">${H.won(q.phone)}</b></div>
      ${q.install != null ? `<div class="nsum__row"><small>설치비 (최초 1회)</small><b class="num">${H.won(q.install)}</b></div>` : ""}
      <div class="nsum__gift"><small>가입 사은품</small><b class="num">${H.won(q.gift)}</b></div>
      <p class="nsum__note">요금·사은품은 고른 구성 기준이에요. 설치 환경·이벤트에 따라 최종 금액은 상담에서 확정해요. 자비스웹 ${D.internet.basisDate.replace(/-/g, ".")} 기준.</p>
      <div class="nsum__acts"><a class="btn btn--mg btn--block" href="#/internet/apply">이 조건으로 신청하기</a><button type="button" class="btn btn--line btn--block" data-act="kakao">${H.icon("kakao", "ic--fill")}카카오톡으로 물어보기</button></div>
    </div>`;
  }
  H.views.internet = function (r) {
    var s = nsel();
    if (r.q.c && NET[r.q.c]) { s.c = r.q.c; }
    var cfg = NET[s.c], q = H.netQuote(s.c, s);
    var max = Math.max.apply(null, cfg.plans.map(function (x) { return x[6]; }));
    return {
      title: "인터넷 + TV",
      html: `<div class="wrap">
  <header class="ph ph--hs"><small class="eyebrow-blue">INTERNET + TV</small><h1>인터넷·TV를<br class="mo-only"> 직접 골라 사은품을 확인하세요</h1><p>통신사를 고르고 인터넷·TV·공유기를 선택하면 월 요금과 가입 사은품을 그 자리에서 보여드려요. TV나 공유기가 필요 없다면 «없이»를 고르면 돼요.</p></header>
  <div class="net2"><div>
    <div class="ntab" role="group" aria-label="통신사">${NKEYS.map(function (k) {
      var m = Math.max.apply(null, NET[k].plans.map(function (x) { return x[6]; }));
      return `<button type="button" data-act="netPick" data-k="c" data-v="${k}" aria-pressed="${s.c === k}"><b>${NET[k].label}</b><small>사은품 최대 ${H.man(m)}</small></button>`;
    }).join("")}</div>
    <div class="ngroup"><h3>인터넷 속도 <small>${cfg.label} 사은품 최대 ${H.man(max)}</small></h3><div class="nopts nopts--3">${cfg.internet.map(function (x, i) {
      return `<button type="button" class="nopt" data-act="netPick" data-k="net" data-v="${i}" aria-pressed="${s.net === i}"><b>${H.esc(x[0])}</b><small>${H.esc(x[1])}</small></button>`;
    }).join("")}</div></div>
    <div class="ngroup"><h3>TV <small>채널 수는 통신사 기준</small></h3><div class="nopts">${[`<button type="button" class="nopt" data-act="netPick" data-k="tv" data-v="-1" aria-pressed="${s.tv === -1}"><b>TV 없이</b><small>인터넷만</small></button>`].concat(cfg.tv.map(function (x, i) {
      return `<button type="button" class="nopt" data-act="netPick" data-k="tv" data-v="${i}" aria-pressed="${s.tv === i}"><b>${H.esc(x[0])}</b><small>${H.esc(x[1])}개 채널</small></button>`;
    })).join("")}</div></div>
    <div class="ngroup"><h3>공유기(와이파이)</h3><div class="nopts">
      <button type="button" class="nopt" data-act="netPick" data-k="wifi" data-v="0" aria-pressed="${!s.wifi}"><b>공유기 없이</b><small>내 공유기를 써요</small></button>
      <button type="button" class="nopt" data-act="netPick" data-k="wifi" data-v="1" aria-pressed="${s.wifi}"><b>공유기 포함</b><small>${cfg.wifi ? "월 " + H.won(cfg.wifi) : "무료 제공"}${cfg.wifiMsg ? " · " + H.esc(cfg.wifiMsg) : ""}</small></button></div></div>
    <p class="help-t" style="margin-top:14px">${H.icon("info", "ic--sm")} 같은 통신사 휴대폰을 하이스테이션에서 쓰면 «휴대폰 결합 요금»으로 내려가요. 휴대폰까지 같이 바꿀 생각이면 <a href="#/phones" style="color:var(--blue);font-weight:700">휴대폰 조건</a>도 함께 보세요.</p>
    <section class="pd-sec" style="margin-top:28px"><h2>자주 묻는 질문</h2>${H.faqHtml(C.netFaq)}</section>
  </div>${q ? nsum(q) : '<p class="empty">이 구성은 아직 요금이 없어요</p>'}</div>
</div>`
    };
  };
  H.acts.netPick = function (el) {
    var s = nsel(), k = el.dataset.k, v = el.dataset.v;
    if (k === "c") { s.c = v; s.net = 0; s.tv = -1; s.wifi = false; }
    else if (k === "wifi") s.wifi = v === "1";
    else s[k] = Number(v);
    H.rerender(el);
  };
  function lead() {
    if (!H.lead) { var u = H.state.user, li = H.state.loggedIn; H.lead = { name: li ? u.name : "", phone: li ? u.phone : "", addr: "", addr2: "", when: "", memo: "", agree: false, tried: false }; }
    return H.lead;
  }
  H.leadAddr = function (v) { lead().addr = v; };
  H.resetLead = function () { H.lead = null; };
  H.fillLeadSample = function () { Object.assign(lead(), { name: "이하이", phone: "010-2345-6789", addr: H.SAMPLE_ADDR[0], addr2: "K1타워 207호", when: "다음 주 토요일 오전", memo: "지금 KT 쓰고 있어요. 이사 날짜에 맞춰 설치 부탁드려요", agree: true, tried: false }); };
  function leadField(id, key, label, o) {
    var f = lead(), bad = f.tried && !(o.check ? o.check(f[key]) : String(f[key] || "").trim());
    return `<div class="field"><label for="${id}">${label}${o.opt ? ' <span class="opt-tag">선택</span>' : '<span class="req">*</span>'}</label>
      <input id="${id}" class="input${bad ? " bad" : ""}" data-input="leadField" data-f="${key}" value="${H.esc(f[key])}" ${o.attrs || ""}>${bad ? `<p class="err-t">${o.err}</p>` : o.help ? `<p class="help-t">${o.help}</p>` : ""}</div>`;
  }
  H.inputs.leadField = function (el) { lead()[el.dataset.f] = el.value; };
  H.leadForm = function (kind) {
    var f = lead();
    return `<div class="demo-tools"><span class="demo-tag">시안</span><button type="button" class="btn btn--soft btn--sm" data-act="leadSample">예시로 채우기</button></div>
    <section class="form-sec"><h2>신청하시는 분</h2>
      ${leadField("ldName", "name", "이름", { err: "이름을 적어 주세요", attrs: 'autocomplete="name"' })}
      ${leadField("ldPhone", "phone", "연락처", { err: "연락처를 끝까지 적어 주세요", check: function (v) { return String(v).replace(/\D/g, "").length >= 10; }, attrs: 'inputmode="tel" placeholder="010-0000-0000"' })}
    </section>
    <section class="form-sec"><h2>${kind === "internet" ? "설치할 곳" : "설치할 곳"}</h2>
      <div class="field"><label for="ldAddr">주소<span class="req">*</span></label><div class="field-row"><input id="ldAddr" class="input${f.tried && !f.addr ? " bad" : ""}" value="${H.esc(f.addr)}" placeholder="주소를 찾아 주세요" readonly data-act="addrSheet" data-target="lead"><button type="button" class="btn btn--line" data-act="addrSheet" data-target="lead">주소 찾기</button></div>${f.tried && !f.addr ? '<p class="err-t">주소를 찾아 주세요</p>' : ""}</div>
      ${leadField("ldAddr2", "addr2", "상세 주소", { err: "동 · 호수를 적어 주세요", attrs: 'placeholder="동 · 호수"' })}
      ${leadField("ldWhen", "when", "설치 희망일", { opt: true, attrs: 'placeholder="예) 다음 주 토요일 오전"', help: kind === "internet" ? "정확한 날짜는 상담에서 잡아드려요. 이사 날짜가 있으면 적어 주세요." : "설치 기사님 방문 일정은 상담에서 잡아드려요." })}
      ${leadField("ldMemo", "memo", "남길 말", { opt: true, attrs: kind === "internet" ? 'placeholder="지금 쓰는 통신사, 약정 만기 등"' : 'placeholder="설치 장소(싱크대 옆 등), 궁금한 점"' })}
    </section>
    <section class="form-sec"><h2>동의</h2><div class="agree"><label><input type="checkbox" id="ldAgree" data-change="leadAgree"${f.agree ? " checked" : ""}><span class="box">${H.icon("check")}</span><span>[필수] 상담을 위한 개인정보 수집·이용에 동의해요</span></label></div>${f.tried && !f.agree ? '<p class="err-t">동의가 필요해요</p>' : ""}</section>`;
  };
  H.inputs.leadAgree = function (el) { lead().agree = el.checked; };
  H.acts.leadSample = function () { H.fillLeadSample(); H.rerender(); H.toast("예시 값으로 채웠어요"); };
  function leadValid() {
    var f = lead();
    f.tried = true;
    var ok = f.name.trim() && String(f.phone).replace(/\D/g, "").length >= 10 && f.addr && f.addr2.trim() && f.agree;
    if (!ok) { H.rerender(); var first = H.$(".input.bad") || H.$("#ldAgree"); if (first) first.scrollIntoView({ block: "center", behavior: "smooth" }); H.toast("빠진 칸을 채워 주세요"); }
    return !!ok;
  }
  H.views["internet-apply"] = function () {
    var s = nsel(), q = H.netQuote(s.c, s);
    if (!q) return { title: "인터넷 신청", html: `<div class="wrap"><div class="empty">먼저 구성을 골라 주세요.<br><br><a class="btn btn--ink btn--sm" href="#/internet">인터넷 고르러 가기</a></div></div>` };
    return {
      title: "인터넷 신청", tab: false,
      bar: `<div class="bar__price"><small>${H.esc(q.carrier)} · ${H.esc(q.title)}</small><b class="num">사은품 ${H.won(q.gift)}</b></div><button type="button" class="btn btn--mg" data-act="leadSubmit" data-kind="internet">신청하기</button>`,
      html: `<div class="wrap"><a class="back" href="#/internet">${H.icon("chev-l")}인터넷 + TV</a>
  <header class="ph ph--tight"><h1>인터넷 신청</h1><p>남겨 주시면 담당자가 사은품과 설치 일정을 확인해 연락드려요. 신청만으로 개통되지 않아요.</p></header>
  <div class="order"><aside class="order__side"><div class="sum">
      <dl class="kv"><div><dt>통신사</dt><dd>${H.esc(q.carrier)}</dd></div><div><dt>구성</dt><dd>${H.esc(q.title)}${q.wifiFee ? " · 공유기" : ""}</dd></div><div><dt>월 요금</dt><dd class="num">${H.won(q.monthly)} (결합 시 ${H.won(q.phone)})</dd></div>${q.install != null ? `<div><dt>설치비</dt><dd class="num">${H.won(q.install)}</dd></div>` : ""}</dl>
      <div class="sum__total"><span>가입 사은품</span><b class="num">${H.won(q.gift)}</b></div>
      <div class="order-submit pc-only"><button type="button" class="btn btn--mg btn--block" data-act="leadSubmit" data-kind="internet">신청하기</button><p class="demo-note"><span class="demo-tag">시안</span>실제로 접수되지 않아요</p></div>
    </div><a class="link-arrow pd-more" href="#/internet">구성 바꾸기${H.icon("arrow")}</a></aside>
  <div class="order-form">${H.leadForm("internet")}</div></div></div>`
    };
  };
  H.acts.leadSubmit = function (el) {
    if (!leadValid()) return;
    var f = lead(), kind = el.dataset.kind, id = (kind === "internet" ? "IN" : "RT") + String(Date.now()).slice(-6), l;
    if (kind === "internet") {
      var s = nsel(), q = H.netQuote(s.c, s);
      l = { id: id, kind: "internet", carrier: q.carrier, title: q.title, monthly: q.monthly, phone: q.phone, gift: q.gift, install: q.install, name: f.name, contact: f.phone, addr: f.addr + " " + f.addr2, when: f.when, memo: f.memo, date: H.today(), step: 0 };
    } else {
      var x = H.purifier(H.rsel ? H.rsel.id : D.purifiers[0].id), rq = H.rentQuote(x);
      l = { id: id, kind: "rental", brand: x.brand, name: x.name + " · " + rq.label, fee: rq.fee, card: rq.card, pid: x.id, contact: f.phone, who: f.name, addr: f.addr + " " + f.addr2, when: f.when, memo: f.memo, date: H.today(), step: 0 };
    }
    H.state.leads.unshift(l);
    H.lead = null;
    H.save();
    H.go((kind === "internet" ? "#/internet/done?id=" : "#/purifier/done?id=") + id);
  };
  H.views["internet-done"] = function (r) {
    var l = H.state.leads.find(function (x) { return x.id === r.q.id; });
    if (!l) return { title: "신청 완료", html: `<div class="wrap"><div class="empty">신청을 찾을 수 없어요.</div></div>` };
    return { title: "신청 완료", tab: false, html: `<div class="wrap"><div class="done">
  <div class="done__ic">${H.icon("check")}</div><h1>인터넷 신청을 받았어요</h1>
  <p class="lead">${H.esc(l.name)}님, ${H.esc(l.carrier)} ${H.esc(l.title)} 신청이에요. 담당자가 사은품과 설치 일정을 확인하고 <b>${H.esc(l.contact)}</b>로 연락드려요. 진행은 마이페이지 «내 노선»에서 볼 수 있어요.</p>
  ${H.tracker(0, H.LEAD_STEPS)}<p class="next-st">${H.icon("train")}<span>다음 정차역 <b>상담</b></span></p>
  <div class="sum"><dl class="kv"><div><dt>신청번호</dt><dd class="num">${l.id} · ${l.date}</dd></div><div><dt>구성</dt><dd>${H.esc(l.carrier)} · ${H.esc(l.title)}</dd></div><div><dt>예상 사은품</dt><dd class="num">${H.won(l.gift)}</dd></div><div><dt>설치할 곳</dt><dd>${H.esc(l.addr)}</dd></div>${l.when ? `<div><dt>희망일</dt><dd>${H.esc(l.when)}</dd></div>` : ""}</dl></div>
  <p class="kchat-label">신청 직후 이렇게 와요 · 알림톡 예시</p>
  <div class="kchat"><div class="kchat__who"><span class="kchat__av">HS</span><b>하이스테이션</b><small>알림톡</small></div><div class="kchat__bubble">[하이스테이션] 인터넷 신청 접수 ✅\n${H.esc(l.name)} 고객님, ${H.esc(l.carrier)} ${H.esc(l.title)} 신청을 받았습니다.\n담당자가 확인 후 연락드립니다.\n· 예상 사은품: ${H.won(l.gift)}\n· 설치 희망: ${H.esc(l.when || "상담 시 확정")}</div></div>
  <div class="done__acts"><a class="btn btn--soft btn--sm" href="#/my">내 노선 보기</a><a class="btn btn--soft btn--sm" href="#/phones">휴대폰도 같이 보기</a><a class="btn btn--soft btn--sm" href="#/">첫 화면으로</a></div>
</div></div>` };
  };

  /* ---------- 정수기 ---------- */
  var BRANDS = ["전체", "코웨이", "LG", "SK매직", "쿠쿠"];
  H.views.purifier = function (r) {
    var b = r.q.b || "전체", sort = r.q.s || "rec";
    var list = D.purifiers.filter(function (x) { return b === "전체" || x.brand === b; });
    if (sort === "low") list = list.slice().sort(function (a, c) { return a.card - c.card; });
    if (sort === "high") list = list.slice().sort(function (a, c) { return c.card - a.card; });
    return {
      title: "정수기 렌탈",
      html: `<div class="wrap">
  <header class="ph ph--hs"><small class="eyebrow-blue">RENTAL</small><h1>매일 마시는 물,<br class="mo-only"> 부담 없는 월 렌탈료로 시작하세요</h1><p>코웨이 · LG · SK매직 · 쿠쿠 인기 모델을 한자리에서 비교하고, 약정과 관리 방식까지 골라보세요.</p></header>
  <div class="filters">${BRANDS.map(function (x) { return `<a class="chip" href="#/purifier?b=${encodeURIComponent(x)}&s=${sort}" aria-pressed="${b === x}">${x}</a>`; }).join("")}</div>
  <div class="sec-row" style="margin-top:14px"><p class="list-count num">총 ${list.length}개 <small style="color:#8a8a8a">· 시안은 8개, 지금 사이트는 58개</small></p>
    <div class="filters">${[["rec", "추천순"], ["low", "월 렌탈료 낮은순"], ["high", "월 렌탈료 높은순"]].map(function (x) { return `<a class="chip" href="#/purifier?b=${encodeURIComponent(b)}&s=${x[0]}" aria-pressed="${sort === x[0]}">${x[1]}</a>`; }).join("")}</div></div>
  <div class="hgrid" style="margin-top:14px">${list.map(H.purifierCard).join("")}</div>
  <section class="pd-sec"><h2>자주 묻는 질문</h2>${H.faqHtml(C.rentFaq)}</section>
</div>`
    };
  };
  function rsel(x) {
    if (!H.rsel || H.rsel.id !== x.id) H.rsel = { id: x.id, color: 0, care: "visit", years: 5 };
    return H.rsel;
  }
  /* 예시 계산 규칙(시안): 목록의 «월 요금» = 방문관리 · 5년. 3년은 +6,000 · 6년 −2,000 · 7년 −4,000, 자가관리는 −3,000. 카드 할인은 5년 기준 값에서 같은 폭으로 움직인다 */
  H.rentQuote = function (x, s) {
    s = s || rsel(x);
    var adj = { 3: 6000, 5: 0, 6: -2000, 7: -4000 }[s.years] + (s.care === "self" ? -3000 : 0);
    return { fee: x.fee + adj, card: Math.max(0, x.card + adj), label: x.colors[s.color] + " · " + (s.care === "self" ? "자가관리" : "4개월방문") + " · " + s.years + "년 약정" };
  };
  H.views["purifier-item"] = function (r) {
    var x = H.purifier(r.parts[1]);
    if (!x) return { title: "정수기", html: `<div class="wrap"><p class="empty">정수기를 찾을 수 없어요.<br><br><a class="btn btn--ink btn--sm" href="#/purifier">정수기 보러 가기</a></p></div>` };
    var s = rsel(x), q = H.rentQuote(x, s);
    return {
      title: x.name, tab: false,
      bar: `<div class="bar__price"><small>${H.esc(q.label)}</small><b class="num">월 ${H.won(q.fee)} · 카드 할인시 ${H.won(q.card)}</b></div><a class="btn btn--mg" href="#/purifier/apply">렌탈 신청</a>`,
      html: `<div class="wrap"><a class="back mo-only" href="#/purifier">${H.icon("chev-l")}정수기 목록</a>
  <div class="pur2"><div class="pur2__img"><img src="${x.img}" alt="${H.esc(x.name)}"></div>
  <div>
    <p class="hcard__brand">${H.esc(x.brand)}</p><h1 style="font-size:22px;font-weight:700;margin-top:4px">${H.esc(x.name)}</h1><p class="help-t num">모델명 ${H.esc(x.model)}${x.tags.length ? " · " + x.tags.join(" · ") : ""}</p>
    <div class="opt" style="margin-top:18px"><div class="opt__t"><h2>색상</h2><span class="hint">${H.esc(x.colors[s.color])}</span></div><div class="opt__body choice-row" style="grid-template-columns:repeat(${Math.min(3, x.colors.length)},1fr)">${x.colors.map(function (c, i) { return `<button type="button" class="choice choice--center" data-act="rentPick" data-k="color" data-v="${i}" aria-pressed="${s.color === i}">${H.esc(c)}</button>`; }).join("")}</div><p class="help-t">고르신 색상은 상담 시 함께 전달됩니다.</p></div>
    <div class="opt"><div class="opt__t"><h2>관리 방식</h2></div><div class="opt__body choice-row">
      <button type="button" class="choice" data-act="rentPick" data-k="care" data-v="visit" aria-pressed="${s.care === "visit"}">4개월방문<small>전문 매니저가 주기적으로 점검</small></button>
      <button type="button" class="choice" data-act="rentPick" data-k="care" data-v="self" aria-pressed="${s.care === "self"}">자가관리<small>필터를 직접 교체해 월 요금이 낮아져요</small></button></div></div>
    <div class="opt"><div class="opt__t"><h2>약정 기간</h2></div><div class="opt__body choice-row" style="grid-template-columns:repeat(4,1fr)">${[3, 5, 6, 7].map(function (y) { var qq = H.rentQuote(x, Object.assign({}, s, { years: y })); return `<button type="button" class="choice choice--center" data-act="rentPick" data-k="years" data-v="${y}" aria-pressed="${s.years === y}">${y}년<small class="num">월 ${H.won(qq.fee)}</small></button>`; }).join("")}</div></div>
    <div class="rentbox"><p class="help-t" style="margin:0 0 6px">선택하신 조건 · ${H.esc(q.label)}</p>
      <div class="rentbox__row"><span>월</span><b class="num">${H.won(q.fee)}</b></div>
      <div class="rentbox__card"><span>제휴카드 할인시 월</span><b class="num">${H.won(q.card)}</b></div>
      <p class="help-t">제휴카드 발급 후 렌탈료 자동이체 · 전월실적 조건 충족 시 청구할인 (카드사·실적 구간별 상이). 카드 발급·등록은 상담 때 함께 안내해드립니다.</p>
      <p class="help-t">설치비·등록비 등 최종 조건은 상담 시 안내드립니다.</p>
      <div class="nsum__acts pc-only"><a class="btn btn--mg btn--block" href="#/purifier/apply">렌탈 신청하기</a><button type="button" class="btn btn--line btn--block" data-act="kakao">${H.icon("kakao", "ic--fill")}카카오톡 상담</button></div>
    </div>
    ${H.askCard("net", "인터넷도 같이 볼게요", "정수기 설치 상담 때 인터넷 사은품도 같이 안내해요.")}
  </div></div>
  <section class="pd-sec"><h2>제휴카드 할인, 이렇게 됩니다</h2>
    <ol class="steps">${[["제휴카드를 발급받습니다", "어떤 카드사가 유리한지 상담 때 골라드리고, 발급 신청까지 안내해드립니다. 이미 갖고 계신 제휴카드가 있다면 새로 만들 필요 없습니다."], ["월 렌탈료를 그 카드로 자동이체 연결", "설치 접수 때 자동이체까지 같이 연결해드립니다."], ["다음 달부터 카드값에서 자동 할인", "렌탈료는 정상 결제되고, 카드사가 카드 대금을 청구할 때 할인액만큼 깎아줍니다(청구할인). 전월 카드 사용액 조건(보통 30만원 이상)을 채운 달에 적용됩니다."]].map(function (st, i) { return `<li class="step"><i>${i + 1}</i><div><b>${st[0]}</b><p>${st[1]}</p></div></li>`; }).join("")}</ol>
    <ul class="bf-grid"><li class="bf">${H.icon("drop")}<b>설치는 전문 기사님이</b><span>방문해 설치하고 사용법까지 알려드려요</span></li><li class="bf">${H.icon("calendar")}<b>만기 챙김</b><span>약정 끝나는 달을 저희가 기억해 알려드려요</span></li><li class="bf">${H.icon("won")}<b>약정 중 해지</b><span>남은 기간에 따라 위약금이 생길 수 있어요</span></li><li class="bf">${H.icon("chat")}<b>조건 확정은 상담에서</b><span>설치비 · 등록비 · 카드 조건</span></li></ul>
    <h2 class="pd-sec__h">자주 묻는 질문</h2>${H.faqHtml(C.rentFaq)}
  </section></div>`
    };
  };
  H.acts.rentPick = function (el) {
    var x = H.purifier(H.route.parts[1]), s = rsel(x), k = el.dataset.k, v = el.dataset.v;
    s[k] = k === "care" ? v : Number(v);
    H.rerender(el);
  };
  H.views["purifier-apply"] = function () {
    var x = H.purifier(H.rsel ? H.rsel.id : D.purifiers[0].id), q = H.rentQuote(x);
    return {
      title: "정수기 렌탈 신청", tab: false,
      bar: `<div class="bar__price"><small>${H.esc(x.name)}</small><b class="num">월 ${H.won(q.fee)} · 카드 할인시 ${H.won(q.card)}</b></div><button type="button" class="btn btn--mg" data-act="leadSubmit" data-kind="rental">신청하기</button>`,
      html: `<div class="wrap"><a class="back" href="#/purifier/${x.id}">${H.icon("chev-l")}${H.esc(x.name)}</a>
  <header class="ph ph--tight"><h1>정수기 렌탈 신청</h1><p>남겨 주시면 담당자가 카드 조건과 설치 일정을 확인해 연락드려요. 신청만으로 계약되지 않아요.</p></header>
  <div class="order"><aside class="order__side"><div class="sum">
      <div class="sum__prod"><div class="sum__th"><img src="${x.img}" alt=""></div><div><b>${H.esc(x.name)}</b><small>${H.esc(q.label)}</small></div></div>
      <div class="sum__total"><span>월 렌탈료</span><b class="num">${H.won(q.fee)}</b></div><p class="help-t num">제휴카드 할인시 월 ${H.won(q.card)}</p>
      <div class="order-submit pc-only"><button type="button" class="btn btn--mg btn--block" data-act="leadSubmit" data-kind="rental">신청하기</button><p class="demo-note"><span class="demo-tag">시안</span>실제로 접수되지 않아요</p></div>
    </div></aside>
  <div class="order-form">${H.leadForm("rental")}</div></div></div>`
    };
  };
  H.views["purifier-done"] = function (r) {
    var l = H.state.leads.find(function (x) { return x.id === r.q.id; });
    if (!l) return { title: "신청 완료", html: `<div class="wrap"><div class="empty">신청을 찾을 수 없어요.</div></div>` };
    return { title: "신청 완료", tab: false, html: `<div class="wrap"><div class="done">
  <div class="done__ic">${H.icon("check")}</div><h1>렌탈 신청을 받았어요</h1>
  <p class="lead">${H.esc(l.who)}님, ${H.esc(l.name)} 신청이에요. 담당자가 카드 조건과 설치 일정을 확인하고 <b>${H.esc(l.contact)}</b>로 연락드려요.</p>
  ${H.tracker(0, H.LEAD_STEPS)}<p class="next-st">${H.icon("train")}<span>다음 정차역 <b>상담</b></span></p>
  <div class="sum"><dl class="kv"><div><dt>신청번호</dt><dd class="num">${l.id} · ${l.date}</dd></div><div><dt>월 렌탈료</dt><dd class="num">${H.won(l.fee)} (카드 할인시 ${H.won(l.card)})</dd></div><div><dt>설치할 곳</dt><dd>${H.esc(l.addr)}</dd></div></dl></div>
  <div class="done__acts"><a class="btn btn--soft btn--sm" href="#/my">내 노선 보기</a><a class="btn btn--soft btn--sm" href="#/care">만기 챙김 맡기기</a><a class="btn btn--soft btn--sm" href="#/">첫 화면으로</a></div>
</div></div>` };
  };
})();
