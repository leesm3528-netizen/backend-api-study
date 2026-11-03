// ===== 저장소 (브라우저 localStorage, 실패해도 동작) =====
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ===== 테마 =====
const savedTheme = store.get("theme", null);
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
$("#themeBtn").onclick = () => {
  const cur = document.documentElement.dataset.theme ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  store.set("theme", next);
};

// ===== 탭 =====
function showView(name) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === name));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
  if (name === "notes") renderNotes();
  window.scrollTo({ top: 0 });
}
document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => showView(t.dataset.view)));

// ===== 개념 학습 =====
$("#toc").innerHTML = LESSONS.map((l, i) => `<a href="#l-${l.id}">${i + 1}. ${l.title}</a>`).join("");
$("#lessons").innerHTML = LESSONS.map((l, i) => `
  <article class="card lesson" id="l-${l.id}">
    <h2><span class="num">${i + 1}</span>${l.title}</h2>
    ${l.html}
  </article>`).join("");

// ===== 단어 카드 =====
const catOptions = `<option value="all">전체</option>` + CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join("");
$("#cardFilter").innerHTML = catOptions;
$("#quizCat").innerHTML = catOptions;

let known = new Set(store.get("knownCards", []));
let deck = [], idx = 0;

function buildDeck(doShuffle) {
  const cat = $("#cardFilter").value;
  const hide = $("#hideKnown").checked;
  deck = CARDS.filter((c) => (cat === "all" || c.cat === cat) && !(hide && known.has(c.term)));
  if (doShuffle) deck = shuffle(deck);
  idx = 0;
  renderCard();
}
function renderCard() {
  const flash = $("#flash");
  flash.classList.remove("flipped");
  const pool = CARDS.filter((c) => $("#cardFilter").value === "all" || c.cat === $("#cardFilter").value);
  const knownCnt = pool.filter((c) => known.has(c.term)).length;
  $("#cardProgressBar").style.width = (pool.length ? (knownCnt / pool.length) * 100 : 0) + "%";
  $("#cardProgressText").textContent = `외운 단어 ${knownCnt} / ${pool.length}` + (deck.length ? ` · 카드 ${idx + 1} / ${deck.length}` : "");

  if (!deck.length) {
    $("#cardCat").textContent = "완료";
    $("#cardTerm").textContent = "🎉 모두 외웠어요!";
    $("#cardDef").textContent = "'외운 카드 숨기기'를 끄거나 '외움 초기화'로 다시 복습하세요.";
    $("#cardEx").textContent = "";
    return;
  }
  const c = deck[idx];
  // 뒤집힌 상태에서 내용이 먼저 바뀌어 보이지 않도록 약간 지연
  setTimeout(() => {
    $("#cardCat").innerHTML = esc(c.cat) + (known.has(c.term) ? ` <span class="known-mark">✓ 외움</span>` : "");
    $("#cardTerm").textContent = c.term;
    $("#cardDef").textContent = c.def;
    $("#cardEx").textContent = c.ex || "";
  }, 120);
}
function move(d) { if (!deck.length) return; idx = (idx + d + deck.length) % deck.length; renderCard(); }
function markKnown(isKnown) {
  if (!deck.length) return;
  const c = deck[idx];
  isKnown ? known.add(c.term) : known.delete(c.term);
  store.set("knownCards", [...known]);
  if ($("#hideKnown").checked && isKnown) {
    deck.splice(idx, 1);
    if (idx >= deck.length) idx = 0;
    renderCard();
  } else move(1);
}
$("#flash").onclick = () => $("#flash").classList.toggle("flipped");
$("#prevCard").onclick = () => move(-1);
$("#nextCard").onclick = () => move(1);
$("#knowCard").onclick = () => markKnown(true);
$("#againCard").onclick = () => markKnown(false);
$("#shuffleCards").onclick = () => buildDeck(true);
$("#resetKnown").onclick = () => { known.clear(); store.set("knownCards", []); buildDeck(false); };
$("#cardFilter").onchange = () => buildDeck(false);
$("#hideKnown").onchange = () => buildDeck(false);
document.addEventListener("keydown", (e) => {
  if (!$("#view-cards").classList.contains("active") || e.target.tagName === "SELECT") return;
  if (e.key === "ArrowRight") move(1);
  else if (e.key === "ArrowLeft") move(-1);
  else if (e.key === " ") { e.preventDefault(); $("#flash").classList.toggle("flipped"); }
  else if (e.key.toLowerCase() === "k") markKnown(true);
});
buildDeck(false);

// ===== 퀴즈 =====
let wrongNotes = store.get("wrongNotes", {}); // key: 문제 텍스트
let qList = [], qi = 0, score = 0, lastSetup = null;

function updateBadge() { $("#noteBadge").textContent = Object.keys(wrongNotes).length; }
function showBest() {
  const b = store.get("bestScore", null);
  $("#bestScore").textContent = b ? `최고 기록: ${b}%` : "";
}

function startQuiz(questions) {
  lastSetup = questions;
  qList = shuffle(questions).map((q) => {
    const order = shuffle(q.o.map((_, i) => i));
    return { ...q, opts: order.map((i) => q.o[i]), ans: order.indexOf(q.a) };
  });
  qi = 0; score = 0;
  $("#quizStart").classList.add("hidden");
  $("#quizResult").classList.add("hidden");
  $("#quizBox").classList.remove("hidden");
  renderQ();
}
function renderQ() {
  const q = qList[qi];
  $("#quizNum").textContent = `${qi + 1} / ${qList.length}`;
  $("#quizTag").textContent = q.cat;
  $("#quizScore").textContent = `정답 ${score}`;
  $("#quizBar").style.width = (qi / qList.length) * 100 + "%";
  $("#quizQ").textContent = q.q;
  $("#quizCode").classList.toggle("hidden", !q.code);
  $("#quizCode").textContent = q.code || "";
  $("#quizExplain").className = "explain hidden";
  $("#nextQ").classList.add("hidden");
  $("#quizOpts").innerHTML = q.opts.map((o, i) =>
    `<button class="opt" data-i="${i}"><span class="k">${i + 1}</span><span>${esc(o)}</span></button>`).join("");
  $("#quizOpts").querySelectorAll(".opt").forEach((b) => (b.onclick = () => answer(+b.dataset.i)));
}
function answer(i) {
  const q = qList[qi];
  const btns = $("#quizOpts").querySelectorAll(".opt");
  if (btns[0].disabled) return;
  btns.forEach((b) => (b.disabled = true));
  btns[q.ans].classList.add("correct");
  const ok = i === q.ans;
  const ex = $("#quizExplain");
  if (ok) {
    score++;
    ex.className = "explain good";
    ex.innerHTML = `<b>⭕ 정답!</b><br>${esc(q.e)}`;
    if (wrongNotes[q.q]) wrongNotes[q.q].solvedStreak = (wrongNotes[q.q].solvedStreak || 0) + 1;
  } else {
    btns[i].classList.add("wrong");
    ex.className = "explain bad";
    ex.innerHTML = `<b>❌ 오답</b> — 정답: <b>${esc(q.opts[q.ans])}</b><br>${esc(q.e)}<br><span class="small muted">오답노트에 저장되었습니다.</span>`;
    const prev = wrongNotes[q.q];
    wrongNotes[q.q] = {
      cat: q.cat, q: q.q, code: q.code || "", mine: q.opts[i], answer: q.opts[q.ans], e: q.e,
      count: (prev ? prev.count : 0) + 1, solvedStreak: 0, date: new Date().toLocaleDateString("ko-KR")
    };
  }
  store.set("wrongNotes", wrongNotes);
  updateBadge();
  $("#quizScore").textContent = `정답 ${score}`;
  const nb = $("#nextQ");
  nb.textContent = qi === qList.length - 1 ? "결과 보기 →" : "다음 문제 →";
  nb.classList.remove("hidden");
  nb.focus();
}
$("#nextQ").onclick = () => { qi++; qi < qList.length ? renderQ() : showResult(); };
document.addEventListener("keydown", (e) => {
  if (!$("#view-quiz").classList.contains("active") || $("#quizBox").classList.contains("hidden")) return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 4) answer(n - 1);
});

function showResult() {
  $("#quizBox").classList.add("hidden");
  $("#quizResult").classList.remove("hidden");
  const pct = Math.round((score / qList.length) * 100);
  const color = pct >= 80 ? "var(--ok)" : pct >= 50 ? "var(--warn)" : "var(--bad)";
  const ring = $("#scoreRing");
  ring.style.background = `conic-gradient(${color} ${pct * 3.6}deg, var(--surface-2) 0)`;
  ring.innerHTML = `<div style="width:110px;height:110px;border-radius:50%;background:var(--surface);display:grid;place-items:center;color:${color}">${pct}%</div>`;
  $("#resultMsg").innerHTML = `${qList.length}문제 중 <b>${score}문제</b> 정답! ` +
    (pct === 100 ? "완벽해요 🎉" : pct >= 80 ? "아주 좋아요 👍" : pct >= 50 ? "조금만 더! 오답노트로 복습하세요." : "개념 학습을 다시 읽어보고 도전해요 💪");
  const best = store.get("bestScore", 0);
  if (pct > best) store.set("bestScore", pct);
  showBest();
}

$("#startQuiz").onclick = () => {
  const cat = $("#quizCat").value;
  const n = +$("#quizCount").value;
  const pool = QUIZ.filter((q) => cat === "all" || q.cat === cat);
  startQuiz(shuffle(pool).slice(0, n));
};
$("#retryQuiz").onclick = () => {
  $("#quizResult").classList.add("hidden");
  $("#quizStart").classList.remove("hidden");
};
$("#goNotes").onclick = () => showView("notes");

// ===== 오답노트 =====
function renderNotes() {
  const list = Object.values(wrongNotes).sort((a, b) => b.count - a.count);
  $("#retryWrong").disabled = !list.length;
  if (!list.length) {
    $("#notesList").innerHTML = `<div class="card empty">📭 오답노트가 비어 있어요.<br>퀴즈에서 틀린 문제가 여기에 모입니다.</div>`;
    return;
  }
  $("#notesList").innerHTML = list.map((n) => `
    <div class="card note">
      <div class="note-head">
        <span><span class="tag">${esc(n.cat)}</span> <span class="cnt">틀린 횟수 ${n.count}회 · ${esc(n.date)}${n.solvedStreak ? ` · 이후 ${n.solvedStreak}회 맞힘` : ""}</span></span>
        <button class="btn ghost small" data-del="${esc(n.q)}">✔ 이해했어요 (삭제)</button>
      </div>
      <h3>${esc(n.q)}</h3>
      ${n.code ? `<pre class="code">${esc(n.code)}</pre>` : ""}
      <p class="ans mine">내 답: ${esc(n.mine)}</p>
      <p class="ans right-a">정답: ${esc(n.answer)}</p>
      <div class="explain">${esc(n.e)}</div>
    </div>`).join("");
  $("#notesList").querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => {
    delete wrongNotes[b.dataset.del];
    store.set("wrongNotes", wrongNotes);
    updateBadge(); renderNotes();
  }));
}
$("#retryWrong").onclick = () => {
  const keys = Object.keys(wrongNotes);
  const qs = QUIZ.filter((q) => keys.includes(q.q));
  if (!qs.length) return;
  showView("quiz");
  startQuiz(qs);
};
$("#clearNotes").onclick = () => {
  if (!Object.keys(wrongNotes).length) return;
  wrongNotes = {};
  store.set("wrongNotes", wrongNotes);
  updateBadge(); renderNotes();
};

updateBadge();
showBest();
