/* 하이스테이션 리뉴얼 목업 — 소식(사전알림 · 특별 혜택 · 구매 가이드): 목록 · 한 편 · 알림 신청 창
 * 구성은 대표의 «소식·혜택 기획안»(2026-09-15): 회색 머리말(분류 → 제목 → 한 줄) → 흰 본문 → 마지막 행동 하나 → 함께 볼 소식
 */
(function () {
  "use strict";
  var H = window.H, C = H.C;

  H.newsList = function (o) {
    var hidden = H.state.newsHidden || [], ed = H.state.newsEdits || {}, extra = H.state.newsNew || [];
    var list = C.news.concat(extra).map(function (g) { return Object.assign({}, g, ed[g.slug] || {}); });
    if (!(o && o.all)) list = list.filter(function (g) { return hidden.indexOf(g.slug) < 0 && g.status !== "draft"; });
    return list.sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
  };
  function row(g) {
    return `<a class="news-row" href="#/news/${g.slug}"><small>${H.esc(g.cat)}</small><span><b>${H.esc(g.title)}</b><span>${H.esc(g.summary)}</span></span>${H.icon("arrow")}</a>`;
  }
  H.views.news = function (r) {
    var cat = r.q.cat || "전체", list = H.newsList().filter(function (g) { return cat === "전체" || g.cat === cat; });
    return {
      title: "소식",
      html: `<div class="wrap">
  <header class="ph ph--hs"><small class="eyebrow-blue">WHAT'S NEW</small><h1>하이스테이션에서<br class="mo-only"> 지금 만나볼 소식</h1><p>새로운 소식과 이벤트, 놓치기 아까운 혜택을 확인해보세요.</p></header>
  <div class="news-tabs">${C.newsCats.map(function (c) { return `<a class="chip" href="#/news${c === "전체" ? "" : "?cat=" + encodeURIComponent(c)}" aria-pressed="${cat === c}">${c}</a>`; }).join("")}</div>
  <div class="news-list">${list.length ? list.map(row).join("") : `<p class="empty">아직 «${H.esc(cat)}» 소식이 없어요.</p>`}</div>
</div>`
    };
  };
  H.views["news-item"] = function (r) {
    var g = H.newsList({ all: true }).find(function (x) { return x.slug === r.parts[1]; });
    var preview = r.q.preview === "1";
    if (!g || ((H.state.newsHidden || []).indexOf(g.slug) >= 0 && !preview)) return { title: "소식", html: `<div class="wrap"><p class="empty">없거나 내려간 소식이에요.<br><br><a class="btn btn--ink btn--sm" href="#/news">소식 전체 보기</a></div>` };
    var others = H.newsList().filter(function (x) { return x.slug !== g.slug; }).slice(0, 2);
    var cta = g.cta ? (g.cta[1] === "alert" ? `<button type="button" class="btn btn--mg btn--block" data-act="alert" data-slug="${g.slug}">${H.esc(g.cta[0])}</button>` : `<a class="btn btn--mg btn--block" href="${g.cta[1]}">${H.esc(g.cta[0])}</a>`) : "";
    return {
      title: g.title,
      html: `<div class="wrap">
  ${preview ? `<p class="a-note">${H.icon("info")}<span><b>미리보기</b> — 직원만 보는 화면이에요. 손님에게는 «공개»를 눌러야 보여요.</span></p>` : ""}
  <a class="back" href="#/news">${H.icon("chev-l")}소식 전체 보기</a>
  <header class="news-hd"><small>${H.esc(g.cat)}</small><h1>${H.esc(g.title)}</h1><p>${H.esc(g.summary)}</p></header>
  <article class="news-body">
    <p style="font-size:16px;font-weight:700;color:var(--ink);margin-top:26px">${H.esc(g.lead || "")}</p>
    ${(g.sections || []).map(function (s) { return `<hr><h2>${H.esc(s[0])}</h2><p>${H.esc(s[1])}</p>`; }).join("")}
    ${cta}
    <p class="help-t" style="margin-top:12px">${g.cat === "특별 혜택" ? "확인되지 않은 혜택은 «진행 중»으로 표시하지 않아요. 종료되면 이 자리에 종료 안내와 지금 가능한 소식이 보여요." : g.cat === "사전알림" ? "접수 상태(접수 전 · 접수 중 · 종료)에 따라 위 단추가 바뀌어요. 개인정보 입력·동의는 신청 창에서 받아요." : "이 글은 직원이 자비스웹 «소식 관리»에서 고쳐요. 글마다 글자 크기나 색을 따로 정하지 않아요."}</p>
    ${others.length ? `<div class="news-rel"><h3>함께 확인할 소식</h3>${others.map(function (o) { return `<a href="#/news/${o.slug}"><span>${H.esc(o.title)}</span>${H.icon("arrow", "ic--sm")}</a>`; }).join("")}</div>` : ""}
  </article>
</div>`
    };
  };

  /* ---------- 사전알림 신청 창 — 이름 · 번호 · 동의 (지금 사이트 사전알림 창과 같은 칸) ---------- */
  H.acts.alert = function (el) {
    H.closeDrawer(true);
    var g = H.newsList({ all: true }).find(function (x) { return x.slug === ((el && el.dataset.slug) || "iphone18-alert"); }) || {};
    var u = H.state.user, li = H.state.loggedIn, already = H.state.alerts.some(function (a) { return a.slug === g.slug; });
    H.openSheet({
      title: "사전알림 신청",
      body: `<div class="alert-model">${H.icon("bell", "ic")}<div><b>${H.esc(g.title || "소식 알림")}</b><small>소식이 열리면 알림톡으로 가장 먼저 알려드려요</small></div></div>
        ${already ? `<p class="a-note">${H.icon("check")}<span>이미 신청하셨어요. 다시 신청하지 않아도 돼요.</span></p>` : ""}
        <div class="field"><label for="alName">이름<span class="req">*</span></label><input id="alName" class="input" autocomplete="name" value="${li ? H.esc(u.name) : ""}" data-focus></div>
        <div class="field"><label for="alPhone">휴대폰 번호<span class="req">*</span></label><input id="alPhone" class="input" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="${li ? H.esc(u.phone) : ""}"></div>
        <div class="agree"><label><input type="checkbox" id="alAgree"><span class="box">${H.icon("check")}</span><span>[필수] 알림톡 받기와 개인정보 수집에 동의해요</span></label></div>
        <p class="help-t">광고성 문자를 따로 보내지 않아요. 알림톡 한 통이에요.</p>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="alertSend" data-slug="${g.slug}" data-title="${H.esc(g.title || "")}">알림 신청하기</button><p class="demo-note"><span class="demo-tag">시안</span>실제로 신청되지 않아요</p>`
    });
  };
  H.acts.alertSend = function (el) {
    var name = H.$("#alName").value.trim(), phone = H.$("#alPhone").value, agreed = H.$("#alAgree").checked;
    if (!name || phone.replace(/\D/g, "").length < 10) { H.toast("이름과 휴대폰 번호를 적어 주세요"); return; }
    if (!agreed) { H.toast("알림톡 받기에 동의해 주세요"); return; }
    var now = new Date();
    if (!H.state.alerts.some(function (a) { return a.slug === el.dataset.slug; })) H.state.alerts.unshift({ slug: el.dataset.slug, title: el.dataset.title, date: now.getMonth() + 1 + "월 " + now.getDate() + "일" });
    H.save();
    H.setSheet(`<div class="ok"><div class="ok__ic">${H.icon("bell")}</div><h3>알림 신청이 끝났어요</h3><p>${H.esc(el.dataset.title)}<br>소식이 열리면 알림톡으로 가장 먼저 알려드릴게요.</p></div>
      <p class="kchat-label">신청 직후 이렇게 와요 · 알림톡 예시</p>
      <div class="kchat"><div class="kchat__who"><span class="kchat__av">HS</span><b>하이스테이션</b><small>알림톡</small></div><div class="kchat__bubble">[하이스테이션] 사전알림 신청 완료 🔔\n${H.esc(name)} 고객님, ${H.esc(el.dataset.title)} 소식을 이 번호로 가장 먼저 보내드릴게요.\n지금 하실 일은 없습니다.</div></div>`,
      `<button type="button" class="btn btn--ink btn--block" data-act="closeSheet">확인</button>`);
  };
})();
