/* 하이스테이션 리뉴얼 목업 — 로그인 창 · 주문서 · 접수 완료 · 온라인 신청서
 * 약관은 운영과 같은 둘(185일 유지 · 위약금 확인). 우리는 대리점이고 직접 개통이라 제3자 제공 동의를 받지 않는다(대표 2026-09-18).
 * 진행 단계는 다섯 정거장(신청 · 접수확인 · 준비중 · 전달 예정 · 개통완료).
 */
(function () {
  "use strict";
  var H = window.H, C = H.C;
  var AGREE = ["개통 후 185일간은 반드시 회선을 유지 해주셔야 합니다.", "위약금은 신청 전 미리 확인 해주세요."];
  H.SAMPLE_ADDR = ["서울 금천구 가산디지털2로 166 (가산동)", "경기 성남시 분당구 판교역로 235 (삼평동)", "부산 부산진구 중앙대로 672 (부전동)"];

  H.makeOrder = function (pid, step, id, date, cc) {
    var p = H.prod(pid), sel = H.defaults(p, cc);
    var r = H.price(p, sel);
    return { id: id || "HS" + String(Date.now()).slice(-6), pid: pid, sel: sel, monthly: r.monthlyTotal, principal: r.principal, step: step || 0, date: date || H.today(), addr: H.SAMPLE_ADDR[0], addr2: "K1타워 207호", usedMileage: 0, courier: "CJ대한통운", trackingNo: "123456789012", example: true };
  };

  /* ---------- 로그인 창 (지금 사이트: 회원가입하고 2만 포인트 받기 / 이미 회원이세요?) ---------- */
  H.acts.login = function (el, next) {
    next = next || (el && el.dataset.next) || "";
    var signupHref = "#/signup" + (next ? "?next=" + encodeURIComponent(next) : ""), bonus = C.signupBonus();
    H.openSheet({
      title: next === "#/order" ? "주문하려면 로그인이 필요해요" : "로그인",
      body: `<a class="btn btn--mg btn--block" href="${signupHref}" data-focus>회원가입하고 ${H.num(bonus)} 포인트 받기</a>
        <p class="or"><span>이미 회원이세요?</span></p>
        <div class="consult-list">
          <button type="button" class="btn btn--kakao btn--block" data-act="loginDo" data-next="${next}">${H.icon("kakao", "ic--fill")}카카오 로그인</button>
          <button type="button" class="btn btn--naver btn--block" data-act="loginDo" data-next="${next}">네이버 로그인</button>
        </div>
        <div class="field"><label for="lgId">아이디</label><input id="lgId" class="input" autocomplete="username"></div>
        <div class="field"><label for="lgPw">비밀번호</label><input id="lgPw" class="input" type="password" autocomplete="current-password"></div>
        <button type="button" class="btn btn--ink btn--block login-btn" data-act="loginDo" data-next="${next}">로그인</button>
        <p class="login-links"><button type="button" data-act="toast" data-msg="시안: 아이디 찾기는 지금 사이트 화면을 그대로 써요">아이디 찾기</button><span aria-hidden="true">·</span><button type="button" data-act="toast" data-msg="시안: 비밀번호 찾기는 지금 사이트 화면을 그대로 써요">비밀번호 찾기</button></p>
        <p class="demo-note"><span class="demo-tag">시안</span>어느 단추를 눌러도 예시 계정(이하이)으로 로그인돼요</p>`
    });
  };
  H.acts.loginDo = function (el) {
    var next = el.dataset.next || "";
    H.state.loggedIn = true;
    H.save();
    H.closeSheet(true);
    H.toast(H.state.user.name + "님, 반가워요");
    if (next) H.go(next); else H.rerender();
  };

  /* ---------- 주문서 ---------- */
  function form() {
    if (!H.form) {
      var u = H.state.user;
      H.form = { name: u.name, birth: u.birth, phone: u.phone, phone2: "", addr: "", addr2: "", usePoint: false, agree: [false, false], tried: false };
    }
    return H.form;
  }
  H.resetOrderForm = function (tried) { H.form = null; form().tried = !!tried; };
  H.fillOrderSample = function () {
    var f = form();
    f.phone2 = "010-9876-5432"; f.addr = H.SAMPLE_ADDR[0]; f.addr2 = "K1타워 207호"; f.agree = [true, true]; f.tried = false;
  };
  function valid(key, v) {
    v = String(v || "");
    if (key === "birth") return /^\d{8}$/.test(v);
    if (key === "phone" || key === "phone2") return v.replace(/\D/g, "").length >= 10;
    return v.trim().length > 0;
  }
  function field(id, key, label, o) {
    var f = form(), bad = f.tried && !valid(key, f[key]);
    return `<div class="field"><label for="${id}">${label}<span class="req">*</span></label>
      <input id="${id}" class="input${bad ? " bad" : ""}" data-input="orderField" data-f="${key}" value="${H.esc(f[key])}" ${o.attrs || ""}>
      ${bad ? `<p class="err-t">${o.err}</p>` : o.help ? `<p class="help-t">${o.help}</p>` : ""}</div>`;
  }

  H.views.order = function () {
    var d = H.state.draft, p = d && H.prod(d.pid);
    if (!p) return { title: "주문서", html: `<div class="wrap"><div class="empty">주문할 휴대폰을 먼저 골라 주세요.<br><br><a class="btn btn--ink btn--sm" href="#/phones">휴대폰 보러 가기</a></div></div>` };
    if (!H.state.loggedIn) setTimeout(function () { H.acts.login(null, "#/order"); }, 80);
    var s = H.fix(p, d.sel), r = H.price(p, s), f = form(), all = f.agree.every(Boolean);
    var flow = ["간편정보 입력", "온라인 신청서 작성", "가입내역 확인", "개통 · 배송"].map(function (t, i) { return i === 0 ? "<b>" + t + "</b>" : "<span>" + t + "</span>"; }).join(H.icon("chev-r"));
    var side = `<aside class="order__side"><div class="sum">
        <div class="sum__prod"><div class="sum__th"><img src="${H.img(p, s.color)}" alt=""></div><div><b>${p.name}</b><small>${H.esc(H.condLine(p, s, r))}</small></div></div>
        <div class="pbox__rows">${H.priceRows(p, s, r)}${f.usePoint ? `<div class="row"><span>마일리지 사용</span><b class="num minus">- ${H.num(H.mileageLeft())}P</b></div>` : ""}</div>
        <div class="sum__total"><span>월 납부 금액</span><b class="num">${H.won(r.monthlyTotal)}</b></div>
        <div class="order-submit pc-only"><button type="button" class="btn btn--mg btn--block" data-act="submitOrder">주문 접수하기</button><p class="demo-note"><span class="demo-tag">시안</span>실제로 접수되지 않아요</p></div>
      </div><a class="link-arrow pd-more" href="#/phone/${p.id}">조건 바꾸기${H.icon("arrow")}</a></aside>`;
    var body = `<div class="order-form">
      <div class="demo-tools"><span class="demo-tag">시안</span><button type="button" class="btn btn--soft btn--sm" data-act="orderSample">예시로 채우기</button></div>
      <section class="form-sec"><h2>가입하시는 분</h2><p class="desc">로그인 정보로 채웠어요. 다르면 고쳐 주세요. 개통은 <b>${H.carrierLabel(s.cc)} ${H.methodLabel(s.method)}</b>이에요.</p>
        ${field("oName", "name", "이름", { err: "이름을 적어 주세요", attrs: 'autocomplete="name"' })}
        ${field("oBirth", "birth", "생년월일", { err: "예) 19990101 처럼 8자리로 적어 주세요", attrs: 'inputmode="numeric" maxlength="8" placeholder="예) 19990101"' })}
        ${field("oPhone", "phone", "휴대폰 번호", { err: "휴대폰 번호를 끝까지 적어 주세요", attrs: 'inputmode="tel" autocomplete="tel" placeholder="010-0000-0000"' })}
        ${field("oPhone2", "phone2", "비상 연락처", { err: "비상 연락처를 적어 주세요", help: "본인 연락이 안 될 때 · 미성년자는 법정대리인 번호", attrs: 'inputmode="tel" placeholder="010-0000-0000"' })}
      </section>
      <section class="form-sec"><h2>받으실 곳</h2>
        <div class="field"><label for="oAddr">주소<span class="req">*</span></label>
          <div class="field-row"><input id="oAddr" class="input${f.tried && !f.addr ? " bad" : ""}" value="${H.esc(f.addr)}" placeholder="주소를 찾아 주세요" readonly data-act="addrSheet"><button type="button" class="btn btn--line" data-act="addrSheet">주소 찾기</button></div>
          ${f.tried && !f.addr ? '<p class="err-t">주소를 찾아 주세요</p>' : ""}</div>
        ${field("oAddr2", "addr2", "상세 주소", { err: "동 · 호수를 적어 주세요", attrs: 'placeholder="동 · 호수"' })}
        <p class="help-t">택배비는 무료예요. ${s.method === "move" ? "번호이동은 유심비 7,700원이 따로 들어요." : "기기변경은 쓰던 유심을 그대로 써요."}</p>
      </section>
      <section class="form-sec"><h2>같이 볼까요</h2>
        ${H.askCard("net", "인터넷도 같이 상담받을게요", "같은 통신사면 결합 할인 · 사은품까지 담당자가 따로 알려드려요.")}
        ${H.askCard("rent", "정수기도 같이 볼게요", "렌탈 조건은 상담으로 안내해요. 휴대폰 가격은 그대로예요.")}
      </section>
      <section class="form-sec"><h2>마일리지</h2>
        <div class="point-row"><span>보유 마일리지 <b class="num">${H.num(H.mileageLeft())}P</b> 쓰기</span><button type="button" class="switch" role="switch" aria-checked="${f.usePoint}" aria-label="마일리지 쓰기" data-act="togglePoint"></button></div>
      </section>
      <section class="form-sec"><h2>약관 동의</h2>
        <div class="agree">
          <label class="all"><input type="checkbox" id="agAll" data-change="agreeAll"${all ? " checked" : ""}><span class="box">${H.icon("check")}</span>모두 동의하기</label>
          ${AGREE.map(function (a, i) {
            return `<label><input type="checkbox" id="ag${i}" data-change="agree" data-i="${i}"${f.agree[i] ? " checked" : ""}><span class="box">${H.icon("check")}</span><span>[필수] ${a}</span><button type="button" class="view" data-act="toast" data-msg="시안: 약관 전문은 지금 사이트 것을 그대로 써요">전문보기</button></label>`;
          }).join("")}
        </div>${f.tried && !all ? '<p class="err-t">필수 약관에 모두 동의해 주세요</p>' : ""}
      </section>
    </div>`;
    return {
      title: "주문서", tab: false,
      bar: `<div class="bar__price"><small class="num">${p.name} · 실구매가 ${H.won(r.principal)}</small><b class="num">월 ${H.won(r.monthlyTotal)}</b></div><button type="button" class="btn btn--mg" data-act="submitOrder">주문 접수하기</button>`,
      html: `<div class="wrap">
        <a class="back" href="#/phone/${p.id}">${H.icon("chev-l")}${p.name}</a>
        <header class="ph ph--tight"><h1>주문서</h1><p>3분이면 끝나요. 전화 없이 개통까지 이어져요.</p></header>
        <p class="flow">${flow}</p>
        <div class="order">${side}${body}</div>
      </div>`
    };
  };
  H.inputs.orderField = function (el) {
    var f = form(), k = el.dataset.f;
    f[k] = el.value;
    if (f.tried) {
      var ok = valid(k, el.value), err = el.parentNode.querySelector(".err-t");
      el.classList.toggle("bad", !ok);
      if (err && ok) err.remove();
    }
  };
  H.inputs.agreeAll = function (el) {
    var f = form();
    f.agree = f.agree.map(function () { return el.checked; });
    H.$$('[data-change="agree"]').forEach(function (c) { c.checked = el.checked; });
  };
  H.inputs.agree = function (el) {
    var f = form(), all = H.$("#agAll");
    f.agree[Number(el.dataset.i)] = el.checked;
    if (all) all.checked = f.agree.every(Boolean);
  };
  H.acts.orderSample = function () { H.fillOrderSample(); H.rerender(); H.toast("예시 값으로 채웠어요"); };
  H.acts.togglePoint = function (el) { form().usePoint = !form().usePoint; H.rerender(el); };
  H.acts.addrSheet = function (el) {
    var target = (el && el.dataset.target) || "order";
    H.openSheet({
      title: "주소 찾기",
      body: `<div class="srch__box">${H.icon("search")}<input id="addrQ" placeholder="도로명, 건물명, 지번으로 찾기" aria-label="주소 검색어" data-focus></div>
        <p class="help-t">실제 사이트에서는 카카오 주소 찾기가 열려요. 시안에서는 예시 주소 중에서 골라 주세요.</p>
        <div>${H.SAMPLE_ADDR.map(function (a) { return `<button type="button" class="res-row res-row--btn" data-act="pickAddr" data-target="${target}" data-v="${H.esc(a)}"><span class="th">${H.icon("home")}</span><span><b>${a}</b><small>예시 주소</small></span></button>`; }).join("")}</div>`
    });
  };
  H.acts.pickAddr = function (el) {
    if (el.dataset.target === "order") form().addr = el.dataset.v;
    else if (H.pickAddrFor) H.pickAddrFor(el.dataset.target, el.dataset.v);
    H.closeSheet(true);
    H.rerender();
  };
  H.acts.submitOrder = function () {
    var f = form(), d = H.state.draft, p = d && H.prod(d.pid);
    if (!p) return;
    if (!H.state.loggedIn) { H.acts.login(null, "#/order"); return; }
    f.tried = true;
    var ok = ["name", "birth", "phone", "phone2", "addr", "addr2"].every(function (k) { return valid(k, f[k]); }) && f.agree.every(Boolean);
    if (!ok) {
      H.rerender();
      var first = H.$(".input.bad") || H.$("#agAll");
      if (first) { first.scrollIntoView({ block: "center", behavior: "smooth" }); if (first.tagName === "INPUT" && !first.readOnly && first.type !== "checkbox") first.focus({ preventScroll: true }); }
      H.toast("빠진 칸을 채워 주세요");
      return;
    }
    var s = H.fix(p, d.sel), r = H.price(p, s);
    var o = { id: "HS" + String(Date.now()).slice(-6), pid: p.id, sel: s, monthly: r.monthlyTotal, principal: r.principal, step: 0, date: H.today(), addr: f.addr, addr2: f.addr2, usedMileage: f.usePoint ? H.mileageLeft() : 0, courier: "CJ대한통운", trackingNo: "123456789012", netAsk: !!H.state.netAsk, rentAsk: !!H.state.rentAsk };
    H.state.orders = [o].concat(H.state.orders).slice(0, 5);
    H.state.draft = null;
    H.form = null;
    H.save();
    H.go("#/done/" + o.id);
  };

  /* ---------- 접수 완료 ---------- */
  H.views.done = function (r) {
    var o = H.state.orders.find(function (x) { return x.id === r.parts[1]; });
    if (!o) return { title: "접수 완료", html: `<div class="wrap"><div class="empty">주문을 찾을 수 없어요.<br><br><a class="btn btn--ink btn--sm" href="#/my">내 노선에서 보기</a></div></div>` };
    var p = H.prod(o.pid), formDone = o.step > 0, s = o.sel, pr = H.price(p, s);
    return {
      title: "접수 완료", tab: false,
      html: `<div class="wrap"><div class="done">
  <div class="done__ic">${H.icon("check")}</div>
  <h1>${formDone ? "신청서까지 받았어요" : "접수됐어요.<br>이제 신청서만 쓰면 끝이에요"}</h1>
  <p class="lead">${formDone ? "담당자가 확인하고 카카오톡으로 가입내역을 보내드려요. «확인했습니다»라고 답해 주시면 개통을 진행해요. 진행 상황은 마이페이지 «내 노선»에서 볼 수 있어요." : p.name + " 주문을 받았어요. 온라인 신청서를 써 주시면 담당자가 확인하고 개통을 준비해요."}</p>
  ${H.tracker(o.step)}
  <p class="next-st">${H.icon("train")}<span>다음 정차역 <b>${H.nextStation(o.step)}</b></span></p>
  ${formDone ? "" : `<section class="next-card"><small>지금 할 일</small><h2>온라인 신청서 작성하기</h2><p>${H.carrierLabel(s.cc)} 가입에 필요한 신청서예요. 3분이면 충분해요. 같은 링크를 카카오톡으로도 보내드렸어요.</p>
    <button type="button" class="btn btn--mg btn--block" data-act="writeForm" data-id="${o.id}">온라인 신청서 작성하기</button>
    <a class="later" href="#/my">나중에 마이페이지에서 쓸게요</a></section>`}
  <div class="sum">
    <div class="sum__prod"><div class="sum__th"><img src="${H.img(p, s.color)}" alt=""></div><div><b>${p.name}</b><small class="num">신청번호 ${o.id} · ${o.date}</small></div></div>
    <dl class="kv"><div><dt>통신사</dt><dd>${H.carrierLabel(s.cc)} ${H.methodLabel(s.method)}</dd></div><div><dt>기기</dt><dd>${p.vols[s.vol][0]} · ${p.colors[s.color][0]}</dd></div><div><dt>할인</dt><dd>${H.discountLabel(s.discount)} · ${pr.plan.name}</dd></div><div><dt>월 납부 금액</dt><dd class="num">${H.won(o.monthly)}</dd></div>${o.netAsk || o.rentAsk ? `<div><dt>같이 상담</dt><dd>${[o.netAsk ? "인터넷" : "", o.rentAsk ? "정수기" : ""].filter(Boolean).join(" · ")} — 담당자가 따로 연락드려요</dd></div>` : ""}</dl>
  </div>
  <div class="done__acts"><a class="btn btn--soft btn--sm" href="#/my/order/${o.id}">신청내역 상세 보기</a><button type="button" class="btn btn--line btn--sm" data-act="kakao">${H.icon("kakao", "ic--fill")}카카오톡으로 물어보기</button><a class="btn btn--soft btn--sm" href="#/">첫 화면으로</a></div>
</div></div>`
    };
  };
  H.acts.writeForm = function (el) {
    var o = H.state.orders.find(function (x) { return x.id === el.dataset.id; }), cc = o ? H.carrierLabel(o.sel.cc) : "통신사";
    H.openSheet({
      title: "온라인 신청서",
      body: `<p class="a-note">${H.icon("info")}<span>실제 사이트에서는 여기서 <b>${cc} 온라인 신청서(인증 URL)</b>가 열려요. 거래처마다 주소가 달라 자비스웹 «거래처별 인증 URL» 표에서 자동으로 골라요. 시안에서는 작성을 마친 것으로 넘어가요.</span></p>
        <ol class="how3"><li><i>1</i><div><b>본인 인증</b><span>휴대폰 본인확인 한 번</span></div></li><li><i>2</i><div><b>가입 정보 확인</b><span>요금제 · 색상은 임의로 골라도 돼요. 개통은 주문한 대로 진행돼요</span></div></li><li><i>3</i><div><b>제출</b><span>담당자에게 «작성완료» 알림이 가요</span></div></li></ol>`,
      foot: `<button type="button" class="btn btn--mg btn--block" data-act="formDone" data-id="${el.dataset.id}" data-focus>작성을 마친 것으로 보기</button>`
    });
  };
  H.acts.formDone = function (el) {
    var o = H.state.orders.find(function (x) { return x.id === el.dataset.id; });
    if (o && o.step < 1) o.step = 1;
    H.save();
    H.closeSheet(true);
    H.rerender();
    H.toast("신청서를 받았어요. 확인되면 카카오톡으로 알려드려요");
  };
})();
