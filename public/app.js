(() => {
"use strict";

/* ================= Config ================= */
const USERS = [
  { id: "pablo",   name: "Pablo" },
  { id: "raul",    name: "Raúl" },
  { id: "alberto", name: "Alberto" },
];
const API = "/api/state";
const UC = (id) => `var(--u-${id})`;
const TEAMS = window.MK_TEAMS;
const SECTIONS = window.MK_SECTIONS;
const SEC = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
const SEC_ORDER = Object.fromEntries(SECTIONS.map((s, i) => [s.id, i]));
const GROUPS = ["Equipos", "Especiales", "Power", "Stars on 25", "Special One", "2ª edición", "Limitadas y firmas", "Añadidas"];

/* ================= Utils ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9.\-]/g, "");
const fold = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const userName = (id) => USERS.find((u) => u.id === id)?.name || id;

/* ================= State ================= */
const emptyData = () => ({ pablo: { cards: {} }, raul: { cards: {} }, alberto: { cards: {} }, custom: { cards: [] } });
let data = Object.assign(emptyData(), LS.get("mk:data", {}));
let pending = LS.get("mk:pending", {});            // { user: { cardId: count } }
let pendingCustom = LS.get("mk:pendingCustom", []); // [{op, card|id}]
let ui = Object.assign({ user: "pablo", tab: "album", group: "all", team: null, view: "all", q: "", includeExtra: false, friend: null }, LS.get("mk:ui", {}));
ui.q = "";
let pin = LS.get("mk:pin", "");
let lastPack = null;

const saveUI = () => LS.set("mk:ui", { ...ui, q: "" });
const saveLocal = () => { LS.set("mk:data", data); LS.set("mk:pending", pending); LS.set("mk:pendingCustom", pendingCustom); };

/* ================= Catalog ================= */
const BASE = (() => {
  const out = [];
  let sec = null, team = null;
  for (const raw of window.MK_RAW.split("\n")) {
    const l = raw.trim();
    if (!l) continue;
    if (l[0] === "#") { const [a, b] = l.slice(1).split(":"); sec = a; team = b || null; continue; }
    const [code, name, t] = l.split("|");
    const bis = /bis$/i.test(code);
    out.push({ id: norm(code), code, name, team: t || team, sec, ed: bis || SEC[sec]?.ed === 2 ? 2 : 1 });
  }
  for (const s of SECTIONS.filter((x) => x.from)) {
    out.filter((c) => c.sec === s.from && (!s.only || s.only.includes(c.code)))
      .forEach((c) => out.push({ id: norm(c.code + "P"), code: c.code + "P", name: c.name, team: c.team, sec: s.id, ed: 1 }));
  }
  return out.map((c, i) => ({ ...c, i })).sort((a, b) => SEC_ORDER[a.sec] - SEC_ORDER[b.sec] || a.i - b.i);
})();

let CARDS = [], BYID = {}, LOOKUP = {};
function rebuildCatalog() {
  const custom = (data.custom?.cards || []).map((c) => ({ ...c, sec: "custom", ed: 3 }));
  CARDS = [...BASE, ...custom];
  BYID = Object.fromEntries(CARDS.map((c) => [c.id, c]));
  LOOKUP = {};
  for (const c of CARDS) {
    LOOKUP[c.id] = c;
    LOOKUP[norm(c.code)] = c;
    const m = c.code.match(/^(\d+)\s*Bis$/i);
    if (m) LOOKUP[m[1] + "b"] = c;
  }
}
rebuildCatalog();

const counts = (c) => !SEC[c.sec].extra || ui.includeExtra;
const groupOf = (c) => SEC[c.sec].group;
const sectionKey = (c) => (c.sec === "team" ? "team:" + c.team : c.sec);
const sectionTitle = (key) => (key.startsWith("team:") ? TEAMS[key.slice(5)].name : SEC[key].name);

function count(user, id) {
  const p = pending[user];
  if (p && id in p) return p[id];
  return data[user]?.cards?.[id] || 0;
}
function stats(user, list) {
  let have = 0, reps = 0;
  for (const c of list) { const n = count(user, c.id); if (n > 0) have++; if (n > 1) reps += n - 1; }
  return { have, total: list.length, reps, missing: list.length - have };
}

/* ================= Sync ================= */
let inflight = false, flushTimer = null;
function setSync(s, title) {
  const el = $("#sync");
  el.dataset.s = s;
  el.title = title || { ok: "Sincronizado", busy: "Guardando…", off: "Sin conexión: guardado en este dispositivo, se subirá al volver" }[s] || "";
}
const hasPending = () => pendingCustom.length > 0 || Object.values(pending).some((o) => Object.keys(o).length);

async function api(method, body) {
  const r = await fetch(API, {
    method,
    headers: { "content-type": "application/json", ...(pin ? { "x-app-pin": pin } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (r.status === 401) { askPin(); throw new Error("pin"); }
  if (!r.ok) throw new Error("http " + r.status);
  return r.json();
}

async function pull(force) {
  if (inflight || (!force && hasPending())) return;
  try {
    setSync("busy");
    const d = await api("GET");
    const before = JSON.stringify(data);
    for (const u of USERS) data[u.id] = d[u.id] || { cards: {} };
    data.custom = d.custom || { cards: [] };
    saveLocal();
    setSync(hasPending() ? "busy" : "ok");
    if (JSON.stringify(data) !== before) { rebuildCatalog(); softRender(); }
  } catch (e) { if (e.message !== "pin") setSync("off"); }
}

function schedule(ms = 450) { clearTimeout(flushTimer); flushTimer = setTimeout(flush, ms); }
async function flush() {
  if (inflight) return schedule();
  if (!hasPending()) return;
  inflight = true; setSync("busy");
  try {
    while (pendingCustom.length) {
      const op = pendingCustom[0];
      data.custom = await api("POST", { key: "custom", ...op });
      pendingCustom.shift();
    }
    for (const u of Object.keys(pending)) {
      const sent = { ...pending[u] };
      if (!Object.keys(sent).length) continue;
      data[u] = await api("POST", { key: u, set: sent });
      for (const [id, n] of Object.entries(sent)) if (pending[u][id] === n) delete pending[u][id];
    }
    saveLocal();
    setSync(hasPending() ? "busy" : "ok");
    if (hasPending()) schedule(100);
  } catch (e) {
    saveLocal();
    if (e.message !== "pin") { setSync("off"); schedule(8000); }
  } finally { inflight = false; }
}

function setCount(user, id, n) {
  n = Math.max(0, Math.min(999, n | 0));
  (pending[user] ||= {})[id] = n;
  saveLocal(); schedule();
}

/* ================= Toast & sheet ================= */
let toastTimer;
function toast(msg, undo) {
  const t = $("#toast");
  t.innerHTML = esc(msg) + (undo ? ' <button type="button">Deshacer</button>' : "");
  t.classList.add("show");
  t.style.pointerEvents = undo ? "auto" : "none";
  if (undo) $("button", t).onclick = () => { undo(); t.classList.remove("show"); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), undo ? 5000 : 2400);
}
function openSheet(html, onMount) {
  const s = $("#sheet");
  s.innerHTML = '<div class="grab"></div>' + html;
  s.classList.add("open"); $("#scrim").classList.add("open");
  onMount && onMount(s);
}
function closeSheet() { $("#sheet").classList.remove("open"); $("#scrim").classList.remove("open"); }
$("#scrim").onclick = closeSheet;
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

function askPin() {
  openSheet(`<h3 style="font-family:var(--display);font-size:1.6rem;margin:0 0 6px">Código del grupo</h3>
    <p class="muted" style="margin:0 0 12px">Esta colección está protegida. Escribe el código que configurasteis en Netlify.</p>
    <div class="row"><input class="search" id="pinIn" type="password" inputmode="numeric" autocomplete="off" placeholder="Código">
    <button class="btn" id="pinOk">Entrar</button></div>`, (s) => {
    const go = () => { pin = $("#pinIn", s).value.trim(); LS.set("mk:pin", pin); closeSheet(); pull(true).then(flush); };
    $("#pinOk", s).onclick = go;
    $("#pinIn", s).onkeydown = (e) => e.key === "Enter" && go();
    setTimeout(() => $("#pinIn", s).focus(), 50);
  });
}

async function share(text, title) {
  if (navigator.share && matchMedia("(pointer:coarse)").matches) {
    try { await navigator.share({ title, text }); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(text); toast("Lista copiada. Pégala en WhatsApp."); }
  catch { openSheet(`<h3>Copia la lista</h3><textarea style="width:100%;height:50vh" readonly>${esc(text)}</textarea>`); }
}

/* ================= Card rendering ================= */
function splitCode(code) {
  let m = code.match(/^(\d+)\s*Bis$/i); if (m) return [m[1], "bis", false];
  m = code.match(/^(\d+)P$/); if (m) return [m[1], "P", false];
  if (/^\d+$/.test(code)) return [code, "", false];
  return [code, "", true];
}
function cardHTML(c, user = ui.user, opts = {}) {
  const n = count(user, c.id);
  const r = n > 1 ? Math.min(2, n - 1) : 0;
  const t = TEAMS[c.team] || TEAMS.LEG;
  const tier = SEC[c.sec].tier;
  const [num, suf, long] = splitCode(c.code);
  const friends = n === 0 ? USERS.filter((u) => u.id !== user && count(u.id, c.id) > 1) : [];
  const showTag = tier !== "base" && tier !== "custom";
  const label = `${c.code} ${c.name}, ${t.name}. ${n === 0 ? "No la tienes" : n === 1 ? "La tienes" : `La tienes y ${n - 1} repetida${n > 2 ? "s" : ""}`}`;
  return `<div class="card" role="button" tabindex="0" data-id="${c.id}" data-c="${n}"${r ? ` data-r="${r}"` : ""} data-t="${tier}" style="--c1:${t.c1};--c2:${t.c2};--uc:${UC(user)}" aria-label="${esc(label)}">
    <span class="face">${tier === "base" || tier === "custom" ? `<span class="stripe"></span><span class="wm" aria-hidden="true">${esc(c.team)}</span>` : ""}
      ${showTag ? `<span class="tier-tag">${esc(SEC[c.sec].name)}</span>` : ""}
      ${c.ed === 2 ? '<span class="ed">2ª</span>' : c.ed === 3 ? '<span class="ed">Nueva</span>' : ""}
      <span class="no"${long ? ' style="font-size:1.25rem"' : ""}>${esc(num)}${suf ? `<small>${suf}</small>` : ""}</span>
      <span class="nm">${esc(c.name)}</span><span class="tm">${esc(t.name)}</span>
    </span>
    ${n > 1 ? `<span class="badge">+${n - 1}</span>` : ""}
    ${opts.noMinus ? "" : '<button class="minus" type="button" tabindex="-1" aria-label="Quitar una">−</button>'}
    ${friends.length ? `<span class="friends">${friends.map((f) => `<i style="--fc:${UC(f.id)}" title="${f.name} la tiene repetida"></i>`).join("")}</span>` : ""}
  </div>`;
}

function refreshCard(id) {
  const c = BYID[id];
  $$(`#main .card[data-id="${CSS.escape(id)}"]`).forEach((el) => {
    const noMinus = !el.querySelector(".minus");
    el.outerHTML = cardHTML(c, ui.user, { noMinus });
  });
  const el = $(`#main .card[data-id="${CSS.escape(id)}"]`);
  if (el) { el.classList.add("bump"); setTimeout(() => el.classList.remove("bump"), 300); }
}

function bumpCard(id, delta, user = ui.user) {
  const c = BYID[id]; if (!c) return;
  const before = count(user, id);
  const after = Math.max(0, before + delta);
  if (after === before) return;
  setCount(user, id, after);
  refreshCard(id);
  updateSecHead(sectionKey(c));
  renderHead();
  if (delta > 0 && before === 0) {
    const key = sectionKey(c);
    const list = CARDS.filter((x) => sectionKey(x) === key);
    if (list.every((x) => count(user, x.id) > 0)) toast(`¡${sectionTitle(key)} completa!`);
  } else if (delta < 0) {
    toast(`${c.code} ${c.name}: ${after === 0 ? "quitada" : after - 1 + " repes"}`, () => { setCount(user, id, before); refreshCard(id); updateSecHead(sectionKey(BYID[id])); renderHead(); });
  }
}

/* long-press + click delegation for cards */
let pressTimer = null, pressed = false;
document.addEventListener("pointerdown", (e) => {
  const card = e.target.closest("#main .card");
  if (!card || e.target.closest(".minus")) return;
  pressed = false;
  pressTimer = setTimeout(() => { pressed = true; openDetail(card.dataset.id); navigator.vibrate?.(15); }, 480);
});
["pointerup", "pointercancel", "pointerleave", "scroll"].forEach((ev) => document.addEventListener(ev, () => clearTimeout(pressTimer), true));
document.addEventListener("contextmenu", (e) => { const card = e.target.closest("#main .card"); if (card) { e.preventDefault(); clearTimeout(pressTimer); if (!pressed) openDetail(card.dataset.id); pressed = true; } });
document.addEventListener("click", (e) => {
  const minus = e.target.closest("#main .minus");
  if (minus) { e.stopPropagation(); bumpCard(minus.closest(".card").dataset.id, -1); return; }
  const card = e.target.closest("#main .card");
  if (!card || card.closest(".reveal")) return;
  if (pressed) { pressed = false; return; }
  bumpCard(card.dataset.id, +1);
});
document.addEventListener("keydown", (e) => {
  const card = e.target.closest?.("#main .card");
  if (!card || (e.key !== "Enter" && e.key !== " ")) return;
  e.preventDefault();
  if (e.shiftKey) openDetail(card.dataset.id); else bumpCard(card.dataset.id, +1);
});

function openDetail(id) {
  const c = BYID[id]; if (!c) return;
  const t = TEAMS[c.team] || TEAMS.LEG;
  const rows = USERS.map((u) => {
    const n = count(u.id, id);
    const txt = n === 0 ? "No la tiene" : n === 1 ? "La tiene" : `La tiene, ${n - 1} repe${n > 2 ? "s" : ""}`;
    return `<div class="li" style="grid-template-columns:36px 1fr auto">
      <span class="user" style="--uc:${UC(u.id)};border:0;padding:0;background:none"><span class="av">${u.name[0]}</span></span>
      <span class="who">${u.name}<small>${txt}</small></span>
      <span class="step" data-u="${u.id}"><button data-d="-1" aria-label="Quitar">−</button><b>${n}</b><button data-d="1" aria-label="Sumar">+</button></span></div>`;
  }).join("");
  openSheet(`<div style="display:grid;grid-template-columns:110px 1fr;gap:16px;align-items:center">
      <div style="pointer-events:none">${cardHTML(c, ui.user, { noMinus: true })}</div>
      <div><div style="font-family:var(--display);font-weight:900;font-size:2rem;line-height:1">${esc(c.code)}</div>
      <div style="font-weight:700;font-size:1.15rem">${esc(c.name)}</div>
      <div class="muted">${esc(t.name)}</div>
      <div class="row" style="margin-top:8px"><span class="tag">${esc(SEC[c.sec].name)}</span><span class="tag">${c.ed === 3 ? "Añadida" : c.ed + "ª edición"}</span></div></div></div>
    <div class="list" style="margin-top:14px">${rows}</div>`, (s) => {
    $$(".step button", s).forEach((b) => b.onclick = () => {
      const u = b.parentElement.dataset.u;
      setCount(u, id, count(u, id) + +b.dataset.d);
      openDetail(id); refreshCard(id); updateSecHead(sectionKey(BYID[id])); renderHead();
    });
  });
}

/* ================= Top bar & tabs ================= */
const ICONS = {
  album: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="7" height="9" rx="1.5"/><rect x="14" y="4" width="7" height="9" rx="1.5"/><rect x="3" y="15" width="18" height="5" rx="1.5"/></svg>',
  sobre: '<svg viewBox="0 0 24 24"><path d="M5 3h14l-1 18H6z"/><path d="M5 7h14"/><path d="M9 12l2 2 4-4"/></svg>',
  repes: '<svg viewBox="0 0 24 24"><rect x="7" y="3" width="12" height="16" rx="2"/><path d="M5 7v12a2 2 0 0 0 2 2h9"/></svg>',
  cambios: '<svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/></svg>',
  ranking: '<svg viewBox="0 0 24 24"><path d="M8 21V10H4v11"/><path d="M14 21V4h-4v17"/><path d="M20 21v-7h-4v7"/></svg>',
};
const TABS = [["album", "Álbum"], ["sobre", "Sobre"], ["repes", "Repes"], ["cambios", "Cambios"], ["ranking", "Ranking"]];

function renderTop() {
  document.documentElement.style.setProperty("--uc", UC(ui.user));
  $("#users").innerHTML = USERS.map((u) =>
    `<button class="user" style="--uc:${UC(u.id)}" aria-pressed="${u.id === ui.user}" data-u="${u.id}"><span class="av">${u.name[0]}</span><span class="nm">${u.name}</span></button>`).join("");
  $$("#users .user").forEach((b) => b.onclick = () => { ui.user = b.dataset.u; if (ui.friend === ui.user) ui.friend = null; saveUI(); render(); });
  const reps = stats(ui.user, CARDS).reps;
  $("#tabs").innerHTML = TABS.map(([id, label]) =>
    `<button data-tab="${id}" ${ui.tab === id ? 'aria-current="page"' : ""}>${ICONS[id]}<span>${label}</span>${id === "repes" && reps ? `<span class="cnt">${reps}</span>` : ""}</button>`).join("");
  $$("#tabs button").forEach((b) => b.onclick = () => { ui.tab = b.dataset.tab; saveUI(); render(); scrollTo({ top: 0 }); });
}

/* ================= Álbum ================= */
function filtered() {
  const q = fold(ui.q.trim());
  return CARDS.filter((c) => {
    if (ui.group !== "all" && groupOf(c) !== ui.group) return false;
    if (ui.group === "Equipos" && ui.team && c.team !== ui.team) return false;
    if (q) {
      const hay = fold(`${c.code} ${c.name} ${(TEAMS[c.team] || {}).name || ""} ${SEC[c.sec].name}`);
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    const n = count(ui.user, c.id);
    if (ui.view === "missing" && n > 0) return false;
    if (ui.view === "have" && n === 0) return false;
    if (ui.view === "reps" && n < 2) return false;
    return true;
  });
}

function heroHTML() {
  const list = CARDS.filter(counts);
  const s = stats(ui.user, list);
  const p = pct(s.have, s.total);
  return `<section class="hero" style="--uc:${UC(ui.user)}">
    <div class="big">${p}<span>%</span></div>
    <div class="hero-meta"><strong>${s.have} de ${s.total}</strong>
      <p>${s.missing ? `Te faltan ${s.missing}` : "¡Colección completa!"}${s.reps ? `, tienes ${s.reps} repes` : ""}${ui.includeExtra ? "" : ". Sin contar firmas ni limitadas"}</p></div>
    <div class="bar" aria-hidden="true"><i style="width:${p}%"></i></div>
  </section>`;
}

function chipsHTML() {
  const present = GROUPS.filter((g) => CARDS.some((c) => groupOf(c) === g));
  const chip = (g, label) => {
    const list = g === "all" ? CARDS.filter(counts) : CARDS.filter((c) => groupOf(c) === g);
    const s = stats(ui.user, list);
    return `<button class="chip" data-g="${esc(g)}" aria-pressed="${ui.group === g}">${esc(label)}<em>${s.have}/${s.total}</em></button>`;
  };
  let html = `<div class="scroller" role="group" aria-label="Subcolecciones">${chip("all", "Todo")}${present.map((g) => chip(g, g)).join("")}</div>`;
  if (ui.group === "Equipos") {
    const teams = [...new Set(BASE.filter((c) => c.sec === "team").map((c) => c.team))];
    html += `<div class="scroller" role="group" aria-label="Equipos">
      <button class="crest" data-team="" aria-pressed="${!ui.team}" style="--c1:var(--ink);--c2:var(--muted)"><b data-a="ALL"></b>Todos</button>
      ${teams.map((t) => {
        const s = stats(ui.user, CARDS.filter((c) => c.sec === "team" && c.team === t));
        return `<button class="crest" data-team="${t}" aria-pressed="${ui.team === t}" style="--c1:${TEAMS[t].c1};--c2:${TEAMS[t].c2}" title="${esc(TEAMS[t].name)}"><b data-a="${t}"></b><span class="pc">${s.have}/${s.total}</span></button>`;
      }).join("")}</div>`;
  }
  return html;
}

function renderHead() {
  if (ui.tab !== "album") { renderTop(); return; }
  const h = $("#albumHead"); if (!h) return;
  const sx = [...$$(".scroller", h)].map((el) => el.scrollLeft);
  h.innerHTML = heroHTML() + `<div class="filters">${chipsHTML()}</div>`;
  $$(".scroller", h).forEach((el, i) => (el.scrollLeft = sx[i] || 0));
  $$(".chip", h).forEach((b) => b.onclick = () => { ui.group = b.dataset.g; ui.team = null; saveUI(); renderHead(); renderAlbumBody(); });
  $$(".crest", h).forEach((b) => b.onclick = () => { ui.team = b.dataset.team || null; saveUI(); renderHead(); renderAlbumBody(); });
  renderTop();
}

function secHeadInner(key) {
  const s = stats(ui.user, CARDS.filter((c) => sectionKey(c) === key));
  return `<h2>${esc(sectionTitle(key))}</h2><span class="n">${s.have}/${s.total}</span>${s.have === s.total ? '<span class="done">Completa</span>' : ""}`;
}
function updateSecHead(key) {
  const el = $(`#main .sec-h[data-key="${CSS.escape(key)}"]`);
  if (el) el.innerHTML = secHeadInner(key);
}

function renderAlbumBody() {
  const body = $("#albumBody"); if (!body) return;
  const list = filtered();
  if (!list.length) {
    const msg = ui.view === "missing" ? ["Nada que buscar aquí", "Tienes todas las cartas de este filtro."]
      : ui.view === "reps" ? ["Sin repes en este filtro", "Cuando una carta salga dos veces aparecerá aquí."]
      : ui.q ? ["Ninguna carta coincide", "Prueba con el número, el apellido o el equipo."]
      : ["Todavía no hay cartas", "Abre un sobre o toca cualquier hueco del álbum para marcarla."];
    body.innerHTML = `<div class="empty"><b>${msg[0]}</b>${msg[1]}</div>`;
    return;
  }
  let html = "", key = null, buf = [];
  const flushSec = () => {
    if (!buf.length) return;
    const all = CARDS.filter((c) => sectionKey(c) === key);
    const s = stats(ui.user, all);
    html += `<div class="sec-h" data-key="${esc(key)}">${secHeadInner(key)}</div>
      <div class="grid">${buf.map((c) => cardHTML(c)).join("")}</div>`;
    buf = [];
  };
  for (const c of list) { const k = sectionKey(c); if (k !== key) { flushSec(); key = k; } buf.push(c); }
  flushSec();
  body.innerHTML = html;
}

function renderAlbum(main) {
  main.innerHTML = `<div id="albumHead"></div>
    <div class="row" style="margin-bottom:6px">
      <input class="search" id="q" type="search" placeholder="Buscar: Pedri, 47 bis, Betis…" value="${esc(ui.q)}" aria-label="Buscar carta">
      <div class="seg" role="group" aria-label="Mostrar">
        ${[["all", "Todas"], ["missing", "Faltan"], ["have", "Tengo"], ["reps", "Repes"]].map(([v, l]) => `<button data-v="${v}" aria-pressed="${ui.view === v}">${l}</button>`).join("")}
      </div>
    </div>
    <p class="muted" style="margin:4px 0 0;font-size:.9rem">Toca una carta para sumarla, el botón − para restar. Mantén pulsado para ver quién la tiene. Los puntos de color indican qué amigo la tiene repetida.</p>
    <div id="albumBody"></div>`;
  $("#q").oninput = (e) => { ui.q = e.target.value; renderAlbumBody(); };
  $$(".seg button", main).forEach((b) => b.onclick = () => { ui.view = b.dataset.v; saveUI(); $$(".seg button", main).forEach((x) => x.setAttribute("aria-pressed", x === b)); renderAlbumBody(); });
  renderHead(); renderAlbumBody();
}

/* ================= Sobre ================= */
function parseCodes(text) {
  const raw = text.replace(/[,;\n]+/g, " ").split(/\s+/).filter(Boolean);
  const toks = [];
  for (const t of raw) {
    if (/^bis$/i.test(t) && toks.length) toks[toks.length - 1] += "bis";
    else if (/^p$/i.test(t) && toks.length && /^\d+$/.test(toks[toks.length - 1])) toks[toks.length - 1] += "p";
    else toks.push(t);
  }
  return toks.map((t) => ({ raw: t, card: LOOKUP[norm(t)] || LOOKUP[norm(t).replace(/^0+/, "")] || null }));
}

function renderSobre(main) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Bis", "P", "SOB", "SOG", "EDL", "␣", "⌫", "Abrir"];
  main.innerHTML = `<section class="hero" style="--uc:${UC(ui.user)}">
      <div class="big" style="font-size:clamp(2.6rem,9vw,4.2rem)">Abrir sobre</div>
      <div class="hero-meta"></div></section>
    <div class="panel">
      <p class="muted" style="margin:0 0 10px">Escribe los números de las cartas que te han salido, separados por espacios. Vale <b>47 bis</b>, <b>3P</b> para las Power o <b>SOB1</b>. Se suman a ${userName(ui.user)}.</p>
      <div class="pack-in"><input id="packIn" autocomplete="off" autocapitalize="characters" placeholder="12 47 bis 3P 233 SOG2" aria-label="Cartas del sobre"><button class="btn" id="packGo">Abrir sobre</button></div>
      <div class="keys" aria-label="Teclado rápido">${keys.map((k) => `<button type="button" class="${k.length > 1 ? "w" : ""}" data-k="${k}">${k === "␣" ? "Separar" : k === "⌫" ? "Borrar" : k}</button>`).join("")}</div>
      <div id="reveal"></div>
    </div>`;
  const inp = $("#packIn");
  const go = () => openPack(inp.value, inp);
  $("#packGo").onclick = go;
  inp.onkeydown = (e) => e.key === "Enter" && go();
  $$(".keys button", main).forEach((b) => b.onclick = () => {
    const k = b.dataset.k;
    if (k === "Abrir") return go();
    if (k === "⌫") inp.value = inp.value.slice(0, -1);
    else if (k === "␣") inp.value = inp.value.replace(/\s*$/, " ");
    else if (k === "Bis") inp.value = inp.value.replace(/\s*$/, " bis ");
    else if (k === "P") inp.value += "P ";
    else inp.value += k;
  });
  if (lastPack?.user === ui.user && lastPack.html) { $("#reveal").innerHTML = lastPack.html; bindUndo(); }
}

function openPack(text, inp) {
  const items = parseCodes(text);
  if (!items.length) { toast("Escribe al menos un número de carta"); return; }
  const user = ui.user, undo = [];
  let nuevas = 0, repes = 0, err = 0;
  const seen = {};
  const slots = items.map((it, i) => {
    if (!it.card) { err++; return `<div class="slot" style="--i:${i}"><div class="card" data-c="0" style="--i:${i}"><span class="face"><span class="no" style="font-size:1.3rem">${esc(it.raw)}</span><span class="nm">No existe</span></span></div><div class="verdict err" style="--i:${i}">Revisa el número</div></div>`; }
    const id = it.card.id;
    const before = count(user, id);
    if (!(id in seen)) seen[id] = before;
    setCount(user, id, before + 1);
    undo.push(id);
    const isNew = before === 0;
    isNew ? nuevas++ : repes++;
    return `<div class="slot ${isNew ? "new" : ""}" style="--i:${i}">${cardHTML(it.card, user, { noMinus: true })}<div class="verdict ${isNew ? "new" : "rep"}" style="--i:${i}">${isNew ? "¡Nueva!" : `Repe (+${before})`}</div></div>`;
  });
  const html = `<div class="summary">${nuevas} nueva${nuevas !== 1 ? "s" : ""}, ${repes} repe${repes !== 1 ? "s" : ""}${err ? `, ${err} sin reconocer` : ""}</div>
    <div class="reveal">${slots.join("")}</div>
    <div class="row" style="margin-top:14px"><button class="btn ghost sm" id="undoPack">Deshacer este sobre</button></div>`;
  lastPack = { user, before: seen, html };
  $("#reveal").innerHTML = html;
  bindUndo();
  inp.value = ""; inp.focus();
  renderTop();
  if (nuevas) navigator.vibrate?.([20, 40, 20]);
}
function bindUndo() {
  const b = $("#undoPack"); if (!b) return;
  b.onclick = () => {
    if (!lastPack) return;
    for (const [id, n] of Object.entries(lastPack.before)) setCount(lastPack.user, id, n);
    lastPack = null; $("#reveal").innerHTML = ""; toast("Sobre deshecho"); renderTop();
  };
}

/* ================= Repes ================= */
function listText(user, kind) {
  const list = CARDS.filter((c) => (kind === "reps" ? count(user, c.id) > 1 : count(user, c.id) === 0 && counts(c)));
  const byKey = {};
  for (const c of list) (byKey[sectionKey(c)] ||= []).push(kind === "reps" && count(user, c.id) > 2 ? `${c.code} (x${count(user, c.id) - 1})` : c.code);
  const head = kind === "reps" ? `Repes de ${userName(user)} (Megacracks 26/27)` : `Me faltan, ${userName(user)} (Megacracks 26/27): ${list.length}`;
  return head + "\n" + Object.entries(byKey).map(([k, v]) => `${sectionTitle(k)}: ${v.join(", ")}`).join("\n");
}

function renderRepes(main) {
  const list = CARDS.filter((c) => count(ui.user, c.id) > 1);
  const total = list.reduce((a, c) => a + count(ui.user, c.id) - 1, 0);
  let rows = "", key = null;
  for (const c of list) {
    const k = sectionKey(c);
    if (k !== key) { rows += `<h3 style="margin:16px 0 4px">${esc(sectionTitle(k))}</h3>`; key = k; }
    const t = TEAMS[c.team] || TEAMS.LEG;
    rows += `<div class="li"><span class="code">${esc(c.code)}</span><span class="who">${esc(c.name)}<small>${esc(t.name)}</small></span>
      <span class="step" data-id="${c.id}"><button data-d="-1" aria-label="Una repe menos">−</button><b>${count(ui.user, c.id) - 1}</b><button data-d="1" aria-label="Una repe más">+</button></span></div>`;
  }
  main.innerHTML = `<section class="hero" style="--uc:${UC(ui.user)}">
      <div class="big">${total}</div>
      <div class="hero-meta"><strong>repes de ${userName(ui.user)}</strong><p>${list.length} cartas distintas para cambiar</p></div></section>
    <div class="row" style="margin-bottom:14px">
      <button class="btn" id="cpR" ${list.length ? "" : "disabled"}>Compartir mis repes</button>
      <button class="btn ghost" id="cpF">Compartir mis faltas</button>
    </div>
    <div class="panel">${list.length ? `<div class="list">${rows}</div>` : `<div class="empty"><b>Aún no tienes repes</b>Cuando una carta te salga por segunda vez aparecerá aquí lista para cambiar.</div>`}</div>`;
  $("#cpR").onclick = () => share(listText(ui.user, "reps"), "Mis repes");
  $("#cpF").onclick = () => share(listText(ui.user, "missing"), "Mis faltas");
  $$(".step", main).forEach((s) => $$("button", s).forEach((b) => b.onclick = () => {
    const id = s.dataset.id; setCount(ui.user, id, count(ui.user, id) + +b.dataset.d); renderRepes(main); renderTop();
  }));
}

/* ================= Cambios ================= */
function renderCambios(main) {
  const others = USERS.filter((u) => u.id !== ui.user);
  const friend = others.find((u) => u.id === ui.friend) || others[0];
  ui.friend = friend.id;
  const me = ui.user, fr = friend.id;
  const give = CARDS.filter((c) => count(fr, c.id) > 1 && count(me, c.id) === 0); // friend → me
  const take = CARDS.filter((c) => count(me, c.id) > 1 && count(fr, c.id) === 0); // me → friend
  const fair = Math.min(give.length, take.length);
  const row = (c, from, to) => {
    const t = TEAMS[c.team] || TEAMS.LEG;
    return `<div class="li" style="--tc:${t.c1 === "#FFFFFF" || t.c1 === "#F4F4F4" ? t.c2 : t.c1}"><span class="code">${esc(c.code)}</span><span class="who">${esc(c.name)}<small>${esc(t.name)}, ${esc(SEC[c.sec].name)}</small></span>
      <button class="btn sm" data-id="${c.id}" data-from="${from}" data-to="${to}">Cambiado</button></div>`;
  };
  main.innerHTML = `<section class="hero" style="--uc:${UC(me)}">
      <div class="big">${fair}</div>
      <div class="hero-meta"><strong>cambios uno por uno con ${friend.name}</strong><p>${friend.name} te puede dar ${give.length} y tú le puedes dar ${take.length}</p></div></section>
    <div class="row" style="margin-bottom:14px">
      <div class="seg" role="group" aria-label="Amigo">${others.map((u) => `<button data-f="${u.id}" aria-pressed="${u.id === fr}">Con ${u.name}</button>`).join("")}</div>
      <button class="btn ghost" id="cpT" ${give.length + take.length ? "" : "disabled"}>Compartir propuesta</button>
    </div>
    <div class="two">
      <div class="panel" style="border-top:4px solid ${UC(fr)}"><h3>${friend.name} te puede dar</h3>
        ${give.length ? `<div class="list">${give.map((c) => row(c, fr, me)).join("")}</div>` : `<p class="muted">${friend.name} no tiene repes que te falten.</p>`}</div>
      <div class="panel" style="border-top:4px solid ${UC(me)}"><h3>Tú le puedes dar</h3>
        ${take.length ? `<div class="list">${take.map((c) => row(c, me, fr)).join("")}</div>` : `<p class="muted">No tienes repes que le falten a ${friend.name}.</p>`}</div>
    </div>
    <p class="muted" style="font-size:.9rem;margin-top:12px">Al pulsar <b>Cambiado</b> se resta la repe de uno y se suma la carta al otro.</p>`;
  $$(".seg button", main).forEach((b) => b.onclick = () => { ui.friend = b.dataset.f; saveUI(); renderCambios(main); });
  $$("button[data-from]", main).forEach((b) => b.onclick = () => {
    const { id, from, to } = b.dataset;
    const bf = count(from, id), bt = count(to, id);
    setCount(from, id, bf - 1); setCount(to, id, bt + 1);
    renderCambios(main); renderTop();
    toast(`${BYID[id].code} ${BYID[id].name}: de ${userName(from)} a ${userName(to)}`, () => { setCount(from, id, bf); setCount(to, id, bt); renderCambios(main); renderTop(); });
  });
  $("#cpT").onclick = () => share(
    `Cambio Megacracks ${userName(me)} y ${friend.name}\n${friend.name} → ${userName(me)}: ${give.map((c) => c.code).join(", ") || "nada"}\n${userName(me)} → ${friend.name}: ${take.map((c) => c.code).join(", ") || "nada"}`,
    "Propuesta de cambio");
}

/* ================= Ranking + ajustes ================= */
function renderRanking(main) {
  const list = CARDS.filter(counts);
  const special = CARDS.filter((c) => c.sec !== "team" && counts(c));
  const board = USERS.map((u) => ({ u, s: stats(u.id, list), sp: stats(u.id, special) })).sort((a, b) => b.s.have - a.s.have);
  const keys = [...new Set(CARDS.map(sectionKey))];
  const secRows = keys.map((k) => {
    const cl = CARDS.filter((c) => sectionKey(c) === k);
    return `<tr><th scope="row">${esc(sectionTitle(k))}</th>${USERS.map((u) => {
      const s = stats(u.id, cl); const p = pct(s.have, s.total);
      return `<td class="u" style="--uc:${UC(u.id)}"><span class="mini-l">${s.have}/${s.total}</span><div class="mini"><i style="width:${p}%"></i></div></td>`;
    }).join("")}</tr>`;
  }).join("");
  const custom = data.custom?.cards || [];
  const teamOpts = Object.entries(TEAMS).map(([k, t]) => `<option value="${k}">${esc(t.name)}</option>`).join("");

  main.innerHTML = `<section class="hero" style="--uc:${UC(board[0].u.id)}">
      <div class="big" style="font-size:clamp(2.6rem,9vw,4.2rem)">${board[0].s.have ? `Manda ${board[0].u.name}` : "Ranking"}</div>
      <div class="hero-meta"></div></section>
    <div class="podium">${board.map(({ u, s, sp }, i) => `<div class="pl" style="--uc:${UC(u.id)}">
        <div class="pos">${i + 1}º</div><div class="nm">${u.name}</div><div class="pct">${pct(s.have, s.total)}%</div>
        <dl><dt>Tiene</dt><dd>${s.have}</dd><dt>Le faltan</dt><dd>${s.missing}</dd><dt>Repes</dt><dd>${s.reps}</dd><dt>Especiales</dt><dd>${sp.have}/${sp.total}</dd></dl></div>`).join("")}</div>

    <div class="panel" style="margin-top:14px;overflow-x:auto"><h3>Por subcolección</h3>
      <table class="secs"><thead><tr><th></th>${USERS.map((u) => `<th style="color:${UC(u.id)}">${u.name}</th>`).join("")}</tr></thead><tbody>${secRows}</tbody></table></div>

    <div class="panel"><h3>Ajustes</h3>
      <div class="stack">
        <label class="switch"><input type="checkbox" id="optExtra" ${ui.includeExtra ? "checked" : ""}> Contar autógrafos y ediciones limitadas en el progreso</label>
        <div class="row"><button class="btn ghost sm" id="syncNow">Sincronizar ahora</button><button class="btn ghost sm" id="export">Descargar copia de seguridad</button></div>
      </div></div>

    <div class="panel"><h3>Añadir carta nueva</h3>
      <p class="muted" style="margin-top:0">Para la 3ª edición, las Last Moment o cualquier carta que salga después. Aparecerá para los tres.</p>
      <div class="stack">
        <div class="grid-f"><label class="f">Número<input id="nCode" placeholder="490"></label><label class="f">Jugador<input id="nName" placeholder="Nombre"></label></div>
        <label class="f">Equipo<select id="nTeam">${teamOpts}</select></label>
        <div><button class="btn" id="nAdd">Añadir carta</button></div>
      </div>
      ${custom.length ? `<div class="list" style="margin-top:12px">${custom.map((c) => `<div class="li"><span class="code">${esc(c.code)}</span><span class="who">${esc(c.name)}<small>${esc((TEAMS[c.team] || TEAMS.LEG).name)}</small></span><button class="btn ghost sm" data-del="${c.id}">Quitar</button></div>`).join("")}</div>` : ""}
    </div>
    <p class="muted" style="font-size:.85rem;margin:16px 4px">Listado: 1ª y 2ª edición (actualizado a 21/09/2026). Fuentes: De Cromos con JR y owacgames. Esta app no está afiliada a Panini.</p>`;

  $("#optExtra").onchange = (e) => { ui.includeExtra = e.target.checked; saveUI(); renderRanking(main); };
  $("#syncNow").onclick = () => flush().then(() => pull(true)).then(() => toast("Sincronizado"));
  $("#export").onclick = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data, pending }, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `megacracks-2627-${new Date().toISOString().slice(0, 10)}.json` });
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $("#nAdd").onclick = () => {
    const code = $("#nCode").value.trim(), name = $("#nName").value.trim(), team = $("#nTeam").value;
    if (!code || !name) { toast("Pon número y jugador"); return; }
    const id = "x-" + norm(code);
    if (BYID[id] || LOOKUP[norm(code)]) { toast(`La ${code} ya existe`); return; }
    const card = { id, code, name, team };
    data.custom = { cards: [...(data.custom?.cards || []), card] };
    pendingCustom.push({ op: "add", card });
    saveLocal(); schedule(); rebuildCatalog(); renderRanking(main);
    toast(`Carta ${code} añadida`);
  };
  $$("[data-del]", main).forEach((b) => b.onclick = () => {
    const id = b.dataset.del;
    data.custom = { cards: (data.custom?.cards || []).filter((c) => c.id !== id) };
    pendingCustom.push({ op: "remove", id });
    saveLocal(); schedule(); rebuildCatalog(); renderRanking(main);
  });
}

/* ================= Render root ================= */
function render() {
  renderTop();
  const main = $("#main");
  ({ album: renderAlbum, sobre: renderSobre, repes: renderRepes, cambios: renderCambios, ranking: renderRanking }[ui.tab] || renderAlbum)(main);
}
function softRender() {
  // Remote update: avoid wiping what the user is typing.
  if (ui.tab === "album") { renderHead(); renderAlbumBody(); }
  else if (ui.tab === "sobre") renderTop();
  else render();
}

/* ================= Boot ================= */
render();
setSync(hasPending() ? "busy" : "off", "Conectando…");
pull(true).then(flush);
setInterval(() => { if (document.visibilityState === "visible") { if (hasPending()) flush(); else pull(); } }, 20000);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") flush().then(() => pull()); });
addEventListener("online", () => flush());
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("/sw.js").catch(() => {});
})();
