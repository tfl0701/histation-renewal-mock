/* 하이스테이션 리뉴얼 목업 — 직원 운영(시안): 접수 운영판 · 소식 관리 · 배너 관리 · 만기 챙김 명단 · 후기 관리
 * 실제로는 자비스웹(직원 로그인) «판매몰 관리 › 손님몰 화면 · 하이스테이션» 안에 들어갈 화면. 목업에서는 이 브라우저에만 저장된다.
 * 탭 옆 표시: 있음 = 지금 자비스웹 메뉴 · 고침 = 칸 더하기 · 새로 = 새 메뉴
 */
(function () {
  "use strict";
  var H = window.H, C = H.C, D = H.D;
  var TAG = { "있음": "have", "고침": "fix", "새로": "new" };
  function shell(tab, inner, title) {
    var tabs = [["home", "관리 첫 화면", "#/admin", ""], ["queue", "접수 운영판", "#/admin/queue", "고침"], ["news", "소식 관리", "#/admin/news", "새로"], ["banners", "배너 관리", "#/admin/banners", "고침"], ["care", "만기 챙김", "#/admin/care", "새로"], ["reviews", "후기 관리", "#/admin/reviews", "고침"]];
    return { title: title, tab: false, footer: false, html: `<div class="adm">
  <div class="adm__bar"><div class="wrap adm__bar-in"><b>자비스웹 <span class="adm__path">판매몰 관리 › 손님몰 화면 · 하이스테이션</span></b><a class="adm__out" href="#/">손님 화면으로${H.icon("arrow", "ic--sm")}</a></div></div>
  <div class="wrap"><nav class="adm__tabs" aria-label="관리 메뉴">${tabs.map(function (t) { return `<a href="${t[2]}"${tab === t[0] ? ' aria-current="page"' : ""}>${t[1]}${t[3] ? `<small class="adm-tag adm-tag--${TAG[t[3]]}">${t[3]}</small>` : ""}</a>`; }).join("")}</nav>${inner}</div></div>` };
  }

  /* 운영판 예시 자료 — 단계마다 한두 건 */
  function sampleQueue() {
    if (H.state.queue) return H.state.queue;
    var mk = function (id, pid, cc, step, name, date, flag) { var p = H.prod(pid), s = H.defaults(p, cc), r = H.price(p, s); return { id: id, pid: pid, name: name, cc: cc, method: s.method, plan: r.plan.name, principal: r.principal, step: step, date: date, flag: flag || "" }; };
    H.state.queue = {
      phones: [
        mk("HS260918", 58, "SKT", 0, "이*이", "09.18 10:12", "신청서 미작성 · 2시간"),
        mk("HS260917", 31, "KT", 0, "박*아", "09.17 19:40", "신청서 미작성 · 재촉 1회"),
        mk("HS260916", 11, "LGUP", 1, "김*훈", "09.16 14:02", "최종안내 보냄 · 답 대기"),
        mk("HS260915", 29, "LGUP", 2, "최*리", "09.15 11:30", "개통 완료 · 출고 대기"),
        mk("HS260914", 2, "SKT", 3, "정*우", "09.14 16:20", "CJ 1234-5678-9012"),
        mk("HS260910", 4, "KT", 4, "한*민", "09.10 09:05", "D-179 · 185일 알림 예약됨")
      ],
      leads: [
        { id: "IN260918", kind: "internet", name: "박*아", title: "KT 에센스 + TV 베이직", gift: 620000, step: 0, date: "09.18 09:30" },
        { id: "RT260917", kind: "rental", name: "송*지", title: "코웨이 아이콘 프로 · 5년", fee: 29900, step: 1, date: "09.17 15:10" },
        { id: "IN260915", kind: "internet", name: "오*수", title: "LG U+ 기가 + 실속형", gift: 660000, step: 2, date: "09.15 13:00", when: "09.20 오전" }
      ]
    };
    return H.state.queue;
  }
  var ACTS = [
    [["pri", "신청서 재촉 알림톡"], ["", "인증 URL 다시 보내기"], ["", "번호 남긴 손님 전화"]],
    [["pri", "최종안내 카톡 보내기"], ["", "«확인했습니다» 받음 ✓"], ["", "신청내역 확인 링크 복사"]],
    [["pri", "개통 완료 처리"], ["", "송장 입력"], ["", "재고 배정"]],
    [["pri", "출고 알림톡"], ["", "수령 확인 받음 ✓"]],
    [["", "185일 알림 예약"], ["", "후기 요청 알림톡"], ["", "만기 챙김 등록"]]
  ];
  H.views["admin-home"] = function () {
    var q = sampleQueue(), news = H.newsList({ all: true }), hidden = (H.state.newsHidden || []).length;
    var care = H.state.leads.filter(function (l) { return l.kind === "care"; }).length + 4;
    var bnOn = (H.BANNERS || []).filter(function (b) { return (H.state.bannerOff || []).indexOf(b.key) < 0; }).length;
    return shell("home", `
  <header class="ph ph--tight"><h1>관리 첫 화면 · 하이스테이션</h1><p>손님 사이트(histation.co.kr)에는 관리 화면이 없어요. 모두 직원이 로그인하는 자비스웹에 들어가요. 자비스웹과 손님몰은 한 프로그램이라 저장하면 손님 화면에 바로 반영돼요.</p></header>
  <div class="adm-where"><div><b>오늘 할 일</b><p>신청서 미작성 ${q.phones.filter(function (x) { return x.step === 0; }).length}건 · 최종안내 답 대기 ${q.phones.filter(function (x) { return x.step === 1; }).length}건 · 출고 대기 ${q.phones.filter(function (x) { return x.step === 2; }).length}건 · 인터넷·정수기 상담 대기 ${q.leads.filter(function (x) { return x.step === 0; }).length}건 · 이달 만기 챙길 손님 2명</p></div>
    <ul><li><span class="adm-tag adm-tag--have">있음</span>지금 자비스웹에 있는 메뉴</li><li><span class="adm-tag adm-tag--fix">고침</span>있는 메뉴에 칸 · 기능 더하기</li><li><span class="adm-tag adm-tag--new">새로</span>새로 만드는 메뉴</li></ul></div>
  <div class="adm-cards">
    <a class="adm-card" href="#/admin/queue"><small>접수 운영판 <span class="adm-tag adm-tag--fix">고침</span></small><b class="num">${q.phones.length + q.leads.length}건 진행 중</b><span>휴대폰 다섯 정거장 + 인터넷 · 정수기 네 정거장</span></a>
    <a class="adm-card" href="#/admin/news"><small>소식 관리 <span class="adm-tag adm-tag--new">새로</span></small><b class="num">${news.length}개</b><span>사전알림 · 특별 혜택 · 구매 가이드 · 숨김 ${hidden}</span></a>
    <a class="adm-card" href="#/admin/banners"><small>배너 관리 <span class="adm-tag adm-tag--fix">고침</span></small><b class="num">${bnOn}장 켜짐</b><span>그림은 배경만 · 제목 · 설명 · 단추는 칸으로</span></a>
    <a class="adm-card" href="#/admin/care"><small>만기 챙김 <span class="adm-tag adm-tag--new">새로</span></small><b class="num">${care}명</b><span>이번 달 챙길 손님 · 일괄 알림톡</span></a>
    <a class="adm-card" href="#/admin/reviews"><small>후기 관리 <span class="adm-tag adm-tag--fix">고침</span></small><b>${H.state.reviewsOn !== false ? "후기 보임" : "후기 숨김"}</b><span>전체 켜고 끄기 · 개별 숨기기</span></a>
  </div>
  <p class="demo-note"><span class="demo-tag">시안</span>파트너스 · 상품 · 단가표 · 인증 URL 표는 지금 자비스웹 화면을 그대로 써요</p>`, "관리");
  };

  /* ---------- 접수 운영판 — 손님이 보는 노선도와 같은 다섯 정거장을 직원 쪽에서 보는 판 ---------- */
  H.views["admin-queue"] = function () {
    var q = sampleQueue();
    var cols = H.STEP_NAMES.map(function (name, i) {
      var list = q.phones.filter(function (x) { return x.step === i; });
      return `<div class="qcol"><div class="qcol__hd">${name}<span class="num">${list.length}</span></div>${list.map(function (x) {
        var p = H.prod(x.pid);
        return `<div class="qcard"><b>${H.esc(x.name)} · ${H.esc(p.name)}</b><small>${H.carrierLabel(x.cc)} ${H.methodLabel(x.method)} · ${H.esc(x.plan)} · 실구매가 ${H.num(x.principal)}원</small><small class="num">${x.id} · ${x.date}</small>${x.flag ? `<span class="qcard__flag${i >= 3 ? " qcard__flag--ok" : ""}">${H.esc(x.flag)}</span>` : ""}
          <div class="qcard__acts">${ACTS[i].map(function (a) { return `<button type="button" class="${a[0]}" data-act="qDo" data-id="${x.id}" data-what="${H.esc(a[1])}">${a[1]}</button>`; }).join("")}${i < 4 ? `<button type="button" data-act="qNext" data-id="${x.id}">다음 정거장 →</button>` : ""}</div></div>`;
      }).join("") || '<p class="help-t" style="margin-top:10px">없음</p>'}</div>`;
    }).join("");
    var leads = q.leads.map(function (l) {
      return `<div class="qcard"><b>${H.esc(l.name)} · ${l.kind === "internet" ? "인터넷" : "정수기"}</b><small>${H.esc(l.title)} · ${l.kind === "internet" ? "사은품 " + H.won(l.gift) : "월 " + H.won(l.fee)}</small><small class="num">${l.id} · ${l.date}${l.when ? " · 설치 " + l.when : ""}</small>
        <span class="qcard__flag${l.step >= 2 ? " qcard__flag--ok" : ""}">${H.LEAD_STEPS[l.step]}</span>
        <div class="qcard__acts">${[["pri", l.step === 0 ? "전화 상담" : l.step === 1 ? "설치 예약 잡기" : l.step === 2 ? "설치 완료 처리" : "사은품 지급 처리"], ["", "안내 알림톡"], ["", "만기 챙김 등록"]].map(function (a) { return `<button type="button" class="${a[0]}" data-act="qDo" data-id="${l.id}" data-what="${H.esc(a[1])}">${a[1]}</button>`; }).join("")}${l.step < 3 ? `<button type="button" data-act="qLeadNext" data-id="${l.id}">다음 →</button>` : ""}</div></div>`;
    }).join("");
    return shell("queue", `
  <div class="adm-hd"><div><h1>접수 운영판</h1><p>손님 «내 노선»의 다섯 정거장을 직원 쪽에서 본 판이에요. 지금 자비스웹 접수 관리(목록·상세)에 «단계별 판»과 «단계마다 할 일 단추»를 더한 것. 단추를 누르면 알림톡 · 양식 복사가 그 자리에서 돼요.</p></div><button type="button" class="btn btn--line btn--sm" data-act="qReset">예시 처음으로</button></div>
  <div class="queue">${cols}</div>
  <h2 class="me-sec-t" style="margin-top:26px">인터넷 · 정수기 (신청 → 상담 → 설치 예약 → 설치완료)</h2>
  <div class="queue" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${leads}</div>
  <p class="demo-note"><span class="demo-tag">시안</span>알림톡 단추는 지금 자비스웹의 «신청서 재촉 · 최종안내 양식 복사 · 출고 알림 보내기»를 한 자리에 모은 것. 185일 알림과 만기 챙김 등록은 새로 만들 일</p>`, "접수 운영판");
  };
  H.acts.qDo = function (el) { H.toast("시안: «" + el.dataset.what + "» — " + el.dataset.id); };
  H.acts.qNext = function (el) { var q = sampleQueue(), x = q.phones.find(function (v) { return v.id === el.dataset.id; }); if (x && x.step < 4) { x.step++; x.flag = ""; } H.save(); H.rerender(); };
  H.acts.qLeadNext = function (el) { var q = sampleQueue(), x = q.leads.find(function (v) { return v.id === el.dataset.id; }); if (x && x.step < 3) x.step++; H.save(); H.rerender(); };
  H.acts.qReset = function () { H.state.queue = null; H.save(); H.rerender(); };

  /* ---------- 소식 관리 — 카테고리 · 홈 노출 · 순서 · 공개 (대표 기획안 5~8절) ---------- */
  H.views["admin-news"] = function () {
    var list = H.newsList({ all: true }), hidden = H.state.newsHidden || [];
    return shell("news", `
  <div class="adm-hd"><div><h1>소식 관리</h1><p>한 번 쓴 소식이 첫 화면 · 전체 목록 · 상세에 같이 반영돼요. 홈에는 «홈 노출»을 켠 글이 순서대로 3개까지 보여요. 공개 전 초안은 손님에게 안 보여요.</p></div><a class="btn btn--mg btn--sm" href="#/admin/news-edit/new">새 소식 쓰기</a></div>
  <table class="adm-tbl"><thead><tr><th>분류</th><th>제목</th><th>홈 노출</th><th>순서</th><th>상태</th><th></th></tr></thead><tbody>${list.map(function (g) {
      var off = hidden.indexOf(g.slug) >= 0;
      return `<tr><td>${H.esc(g.cat)}</td><td><b>${H.esc(g.title)}</b><br><small style="color:#666">${H.esc(g.summary)}</small></td><td><button type="button" class="switch" role="switch" aria-checked="${!!g.home}" aria-label="홈 노출" data-act="newsHome" data-v="${g.slug}"></button></td><td class="num">${g.order || "-"}</td><td>${g.status === "draft" ? '<span class="adm-tag adm-tag--fix">초안</span>' : off ? '<span class="adm-tag">숨김</span>' : '<span class="adm-tag adm-tag--new">공개</span>'}</td>
        <td><div class="qcard__acts"><a class="btn btn--line btn--sm" href="#/admin/news-edit/${g.slug}">편집</a><a class="btn btn--line btn--sm" href="#/news/${g.slug}?preview=1">미리보기</a><button type="button" data-act="newsHide" data-v="${g.slug}">${off ? "다시 공개" : "숨기기"}</button></div></td></tr>`;
    }).join("")}</tbody></table>
  <p class="demo-note"><span class="demo-tag">시안</span>카테고리는 직원이 이름 · 순서 · 공개를 더할 수 있게 자료로 둔다(기획안 3절). 검색 · 인기순은 글이 적어 안 넣음</p>`, "소식 관리");
  };
  H.acts.newsHome = function (el) {
    var ed = H.state.newsEdits || (H.state.newsEdits = {}), slug = el.dataset.v, cur = H.newsList({ all: true }).find(function (g) { return g.slug === slug; });
    ed[slug] = Object.assign({}, ed[slug], { home: !cur.home });
    H.save(); H.rerender(el);
  };
  H.acts.newsHide = function (el) {
    var h = H.state.newsHidden || (H.state.newsHidden = []), i = h.indexOf(el.dataset.v);
    if (i >= 0) h.splice(i, 1); else h.push(el.dataset.v);
    H.save(); H.rerender();
  };
  H.views["admin-news-edit"] = function (r) {
    var slug = r.parts[2], isNew = slug === "new";
    var base = isNew ? { slug: "new-" + String(Date.now()).slice(-4), cat: "특별 혜택", title: "", summary: "", lead: "", sections: [["", ""]], cta: ["내 조건으로 확인하기", "#/phones"], home: false, status: "draft" } : H.newsList({ all: true }).find(function (g) { return g.slug === slug; });
    if (!base) return shell("news", `<p class="empty">없는 글이에요.</p>`, "소식 편집");
    if (!H.editDraft || H.editDraft._slug !== slug) H.editDraft = Object.assign(JSON.parse(JSON.stringify(base)), { _slug: slug });
    var d = H.editDraft;
    var special = { "사전알림": ["알림 대상", "안내할 소식", "접수 상태(접수 전 · 접수 중 · 종료)", "안내 방식"], "특별 혜택": ["대상 고객", "혜택 내용과 수치", "시작 · 종료일", "적용 상품 · 요금제 · 유지 조건 · 중복 여부"], "구매 가이드": ["핵심 답변", "본문 블록(소제목 · 문단 · 확인 항목 · 비교표)", "적용 범위와 예외", "관련 상품 · 질문"] }[d.cat];
    return shell("news", `
  <a class="back" href="#/admin/news">${H.icon("chev-l")}소식 관리</a>
  <div class="adm-hd"><div><h1>${isNew ? "새 소식 쓰기" : "소식 편집"}</h1><p>글꼴 · 색 · 여백은 공통 틀이 정해요. 직원은 내용만 넣어요.</p></div></div>
  <div class="adm-two"><form class="adm-form" onsubmit="return false">
    <div class="field"><label for="edCat">카테고리</label><select id="edCat" class="input" data-input="edField" data-f="cat">${C.newsCats.slice(1).map(function (c) { return `<option${d.cat === c ? " selected" : ""}>${c}</option>`; }).join("")}</select></div>
    <div class="field"><label for="edTitle">제목</label><input id="edTitle" class="input" value="${H.esc(d.title)}" data-input="edField" data-f="title"></div>
    <div class="field"><label for="edSum">목록 한 줄 설명</label><input id="edSum" class="input" value="${H.esc(d.summary)}" data-input="edField" data-f="summary"></div>
    <div class="field"><label for="edLead">핵심 내용(맨 위 굵은 글)</label><textarea id="edLead" class="input" data-input="edField" data-f="lead">${H.esc(d.lead || "")}</textarea></div>
    <div class="field"><label>이 카테고리의 전용 칸</label><ul class="memo-list" style="margin-top:6px">${special.map(function (s) { return "<li>" + s + "</li>"; }).join("")}</ul><p class="help-t">카테고리를 바꾸면 전용 칸이 바뀌어요(기획안 6절). 시안에서는 이름만 보여요.</p></div>
    <div class="field"><label for="edCta">다음 행동 단추 글</label><input id="edCta" class="input" value="${H.esc(d.cta ? d.cta[0] : "")}" data-input="edField" data-f="ctaLabel"></div>
    <div class="field"><label for="edTo">연결 대상</label><select id="edTo" class="input" data-input="edField" data-f="ctaTo">${[["#/phones", "휴대폰 목록"], ["alert", "사전알림 신청 창"], ["#/internet", "인터넷 화면"], ["#/purifier", "정수기 목록"], ["#/my", "마이페이지"], ["#/my/reviews", "후기 쓰기"]].map(function (o) { return `<option value="${o[0]}"${d.cta && d.cta[1] === o[0] ? " selected" : ""}>${o[1]}</option>`; }).join("")}</select></div>
    <div class="field"><span class="field-label">근거 자료 · 확인일 · 담당자</span><div class="field-row"><input class="input" placeholder="근거 자료 링크"><input class="input" type="date" value="${new Date().toISOString().slice(0, 10)}"><input class="input" placeholder="담당자" value="아낌"></div></div>
    <div class="toggle"><span>홈 노출</span><button type="button" class="switch" role="switch" aria-checked="${!!d.home}" data-act="edHome" aria-label="홈 노출"></button></div>
    <div class="qcard__acts"><button type="button" class="btn btn--line btn--sm" data-act="edSave" data-status="draft">초안 저장</button><a class="btn btn--line btn--sm" href="#/news/${d.slug}?preview=1" data-act="edPreview">미리보기</a><button type="button" class="btn btn--mg btn--sm" data-act="edSave" data-status="open">공개</button></div>
    <p class="help-t">저장 · 공개는 서버 확인 뒤에만 «완료»로 표시해요. 공개 중인 글을 고치면 새 초안이 되고, 다시 공개하기 전까지 손님은 옛 글을 봐요.</p>
  </form>
  <div class="adm-preview"><p class="adm-preview__lab">손님 화면 미리보기 (첫 화면 소식 줄)</p><div class="news-row" style="border:0"><small>${H.esc(d.cat)}</small><span><b>${H.esc(d.title || "제목")}</b><span>${H.esc(d.summary || "한 줄 설명")}</span></span>${H.icon("arrow")}</div>
    <p class="adm-preview__lab" style="margin-top:18px">상세 머리</p><div class="news-hd"><small>${H.esc(d.cat)}</small><h1 style="font-size:20px">${H.esc(d.title || "제목")}</h1><p>${H.esc(d.summary || "")}</p></div></div></div>`, "소식 편집");
  };
  H.inputs.edField = function (el) {
    var d = H.editDraft, f = el.dataset.f;
    if (f === "ctaLabel") d.cta = [el.value, d.cta ? d.cta[1] : "#/phones"];
    else if (f === "ctaTo") d.cta = [d.cta ? d.cta[0] : "확인하기", el.value];
    else d[f] = el.value;
    var pv = H.$(".adm-preview"); if (pv) { var t = pv.querySelectorAll("b, h1"); t.forEach(function (x) { x.textContent = d.title || "제목"; }); var sm = pv.querySelectorAll(".news-row span span, .news-hd p"); sm.forEach(function (x) { x.textContent = d.summary || "한 줄 설명"; }); pv.querySelectorAll("small").forEach(function (x) { x.textContent = d.cat; }); }
  };
  H.acts.edHome = function (el) { H.editDraft.home = !H.editDraft.home; el.setAttribute("aria-checked", String(H.editDraft.home)); };
  H.acts.edSave = function (el) {
    var d = H.editDraft, status = el.dataset.status;
    if (!d.title.trim()) { H.toast("제목을 적어 주세요"); return; }
    d.status = status;
    var isNew = d._slug === "new";
    if (isNew) { H.state.newsNew = (H.state.newsNew || []).concat([Object.assign({}, d, { order: 99 })]); }
    else { var ed = H.state.newsEdits || (H.state.newsEdits = {}); ed[d.slug] = { title: d.title, summary: d.summary, lead: d.lead, cat: d.cat, cta: d.cta, home: d.home, status: status }; }
    H.save();
    H.toast(status === "open" ? "공개했어요 — 손님 화면에 바로 보여요" : "초안으로 저장했어요");
    H.editDraft = null;
    H.go("#/admin/news");
  };

  /* ---------- 배너 관리 — 그림은 배경만, 글자는 칸 ---------- */
  H.views["admin-banners"] = function () {
    var list = H.BANNERS || [], off = H.state.bannerOff || [];
    return shell("banners", `
  <div class="adm-hd"><div><h1>배너 관리</h1><p>첫 화면 배너 5장이 5초마다 넘어가요. 하이유플 결정(2026-09-16)과 같이 <b>그림은 배경만</b> 넣고 제목 · 설명 · 단추 글은 칸으로 적어요 — 대표가 소재를 바꿔도 글은 그대로예요.</p></div><button type="button" class="btn btn--mg btn--sm" data-act="toast" data-msg="시안: 배너 추가 칸이 열려요">배너 추가</button></div>
  <p class="adm-now">${H.icon("info", "ic--sm")}<span>지금 하이스테이션 배너(자비스웹)는 그림 4장 · 글자까지 그림에 · 배너 전체가 링크. 이 시안은 PC 2400×880 · 휴대폰 800×985 그림 + 글 칸이에요.</span></p>
  <div class="bnr-list">${list.map(function (b, i) {
      var on = off.indexOf(b.key) < 0;
      return `<div class="bnr${on ? "" : " is-off"}"><span class="bnr__th" style="background:${b.pc ? "#1a1f2e" : "var(--blue)"}" aria-hidden="true"><i class="num">${i + 1}</i></span>
        <div class="bnr__main"><b>${H.esc(b.name)}</b><small>${H.esc(b.to)}</small>
          <dl class="bnr__kv"><div><dt>PC 그림</dt><dd>${b.pc ? "올림" : "없음(색 판)"}</dd></div><div><dt>모바일 그림</dt><dd>${b.mo ? "올림" : "없음(색 판)"}</dd></div><div><dt>제목</dt><dd>${H.esc(String(b.title).replace(/<br>/g, " "))}</dd></div><div><dt>단추</dt><dd>${H.esc(b.pill)}</dd></div><div><dt>노출 기간</dt><dd>없음</dd></div></dl></div>
        <button type="button" class="switch" role="switch" aria-checked="${on}" aria-label="${H.esc(b.name)} 켜기" data-act="bnrToggle" data-v="${b.key}"></button></div>`;
    }).join("")}</div>`, "배너 관리");
  };
  H.acts.bnrToggle = function (el) {
    var off = H.state.bannerOff || (H.state.bannerOff = []), i = off.indexOf(el.dataset.v);
    if (i >= 0) off.splice(i, 1); else off.push(el.dataset.v);
    H.save(); H.rerender(el);
  };

  /* ---------- 만기 챙김 명단 — 이번 달 챙길 손님 · 일괄 알림톡 ---------- */
  H.views["admin-care"] = function (r) {
    var mine = H.state.leads.filter(function (l) { return l.kind === "care"; }).map(function (l) { return { name: l.name, phone: l.phone, item: l.item, co: l.carrier, due: l.due || "모름", src: "손님 등록", state: "맡아둠" }; });
    var sample = [{ name: "김*훈", phone: "010-****-1234", item: "휴대폰", co: "KT", due: "2026-10", src: "개통완료 자동", state: "이달 챙김" }, { name: "오*수", phone: "010-****-8890", item: "인터넷", co: "LG U+", due: "2026-10", src: "손님 등록", state: "이달 챙김" }, { name: "송*지", phone: "010-****-4411", item: "정수기", co: "코웨이", due: "2027-02", src: "설치완료 자동", state: "맡아둠" }, { name: "정*우", phone: "010-****-7788", item: "휴대폰", co: "SKT", due: "모름", src: "손님 등록", state: "확인 방법 보냄" }];
    var all = mine.concat(sample), f = r.q.f || "all";
    var list = f === "month" ? all.filter(function (x) { return x.state === "이달 챙김"; }) : all;
    return shell("care", `
  <div class="adm-hd"><div><h1>만기 챙김 명단</h1><p>손님이 맡긴 만기 + 개통 · 설치가 끝난 건에서 저절로 잡힌 만기(휴대폰 24개월 · 인터넷 36개월 · 정수기 약정). 매달 초 «이번 달 챙길 손님»에게 일괄 알림톡을 보내요.</p></div>
    <div class="qcard__acts"><a class="btn btn--line btn--sm" href="#/admin/care?f=all" ${f === "all" ? 'aria-current="true"' : ""}>전체</a><a class="btn btn--line btn--sm" href="#/admin/care?f=month" ${f === "month" ? 'aria-current="true"' : ""}>이번 달 챙길 손님</a><button type="button" class="btn btn--mg btn--sm" data-act="careBlast">일괄 알림톡 보내기</button></div></div>
  <table class="adm-tbl"><thead><tr><th>손님</th><th>품목</th><th>지금 쓰는 곳</th><th>만기</th><th>어떻게 들어왔나</th><th>상태</th></tr></thead><tbody>${list.map(function (x) { return `<tr><td><b>${H.esc(x.name)}</b><br><small class="num">${H.esc(x.phone)}</small></td><td>${H.esc(x.item)}</td><td>${H.esc(x.co)}</td><td class="num">${H.esc(String(x.due).replace("-", "."))}</td><td>${H.esc(x.src)}</td><td>${x.state === "이달 챙김" ? '<span class="adm-tag adm-tag--new">이달 챙김</span>' : '<span class="adm-tag">' + H.esc(x.state) + "</span>"}</td></tr>`; }).join("")}</tbody></table>
  <p class="demo-note"><span class="demo-tag">시안</span>아이폰 사전알림 장치(hs_leads · 일괄 알림톡)를 그대로 쓴다. 알림톡 문안 2건은 솔라피 검수 필요</p>`, "만기 챙김");
  };
  H.acts.careBlast = function () { H.toast("시안: 이번 달 챙길 손님 2명에게 «챙겨드릴 때가 됐어요» 알림톡을 보내요"); };

  /* ---------- 후기 관리 — 전체 켜고 끄기(지금은 코드 스위치) + 개별 숨기기 ---------- */
  H.views["admin-reviews"] = function () {
    var on = H.state.reviewsOn !== false, list = H.reviewsAll();
    return shell("reviews", `
  <div class="adm-hd"><div><h1>후기 관리</h1><p>후기 영역 전체를 켜고 끄는 것과, 후기 하나를 숨기는 것을 한 화면에서.</p></div></div>
  <div class="toggle" style="border:1px solid var(--line);border-radius:12px;padding:14px 16px"><span><b>손님몰에 구매후기 보이기</b><br><small style="color:#666">끄면 메뉴 · 첫 화면 후기 띠 · 상품 상세 후기 탭 · 후기 목록이 한 번에 빠져요. 쓰기는 열려 있어요. (지금은 코드 스위치 showReviews — 자비스웹 칸으로 옮기는 것은 새로 만들 일)</small></span><button type="button" class="switch" role="switch" aria-checked="${on}" data-act="reviewsOn" aria-label="구매후기 보이기"></button></div>
  <table class="adm-tbl"><thead><tr><th>날짜</th><th>손님</th><th>내용</th><th>사진</th><th>상태</th><th></th></tr></thead><tbody>${list.length ? list.map(function (x) { return `<tr><td class="num">${H.esc(x.date)}</td><td>${H.esc(x.name)}</td><td>${H.esc(x.text).slice(0, 60)}…</td><td>${x.img ? "1장" : "-"}</td><td><span class="adm-tag adm-tag--new">공개</span></td><td><div class="qcard__acts"><button type="button" data-act="toast" data-msg="시안: 이 후기를 숨겼어요">숨기기</button><button type="button" data-act="toast" data-msg="시안: 랜덤박스 선물코드를 발급했어요">선물코드 발급</button></div></td></tr>`; }).join("") : '<tr><td colspan="6" class="help-t">아직 후기가 없어요. 손님 화면 «예시 후기 보기»를 켜면 여기서도 보여요.</td></tr>'}</tbody></table>`, "후기 관리");
  };
  H.acts.reviewsOn = function (el) { H.state.reviewsOn = H.state.reviewsOn === false; H.save(); H.rerender(el); H.toast(H.state.reviewsOn ? "손님몰에 후기가 보여요" : "손님몰에서 후기를 감췄어요"); };
})();
