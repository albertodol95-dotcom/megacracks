// API de la app: guarda el estado de cada coleccionista en Netlify Blobs.
// GET  /api/state                          -> { pablo, raul, alberto, custom }
// POST /api/state {key:"pablo", set:{id:n}} -> fusiona por carta (no pisa cambios de otros dispositivos)
// POST /api/state {key:"custom", op:"add", card} | {key:"custom", op:"remove", id}
import { getStore } from "@netlify/blobs";

const USERS = ["pablo", "raul", "alberto"];
const ID = /^[a-z0-9.\-]{1,48}$/;
const json = (d, status = 200) =>
  new Response(JSON.stringify(d), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const clean = (s, max) => String(s ?? "").replace(/[<>]/g, "").trim().slice(0, max);

export default async (req) => {
  const pin = globalThis.Netlify?.env?.get?.("APP_PIN") ?? process.env.APP_PIN;
  if (pin && req.headers.get("x-app-pin") !== pin) return json({ error: "pin" }, 401);

  const store = getStore({ name: "megacracks-2627", consistency: "strong" });

  if (req.method === "GET") {
    const keys = [...USERS, "custom"];
    const vals = await Promise.all(keys.map((k) => store.get(k, { type: "json" })));
    return json(Object.fromEntries(keys.map((k, i) => [k, vals[i] || (k === "custom" ? { cards: [] } : { cards: {} })])));
  }

  if (req.method !== "POST") return json({ error: "method" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "json" }, 400); }

  if (USERS.includes(body.key)) {
    const cur = (await store.get(body.key, { type: "json" })) || { cards: {} };
    for (const [id, n] of Object.entries(body.set || {})) {
      if (!ID.test(id)) continue;
      const v = Math.max(0, Math.min(999, parseInt(n, 10) || 0));
      if (v === 0) delete cur.cards[id]; else cur.cards[id] = v;
    }
    cur.updatedAt = Date.now();
    await store.setJSON(body.key, cur);
    return json(cur);
  }

  if (body.key === "custom") {
    const cur = (await store.get("custom", { type: "json" })) || { cards: [] };
    if (body.op === "add" && body.card && ID.test(body.card.id) && !cur.cards.some((c) => c.id === body.card.id)) {
      if (cur.cards.length < 300) cur.cards.push({ id: body.card.id, code: clean(body.card.code, 16), name: clean(body.card.name, 60), team: clean(body.card.team, 4) });
    } else if (body.op === "remove") {
      cur.cards = cur.cards.filter((c) => c.id !== body.id);
    }
    await store.setJSON("custom", cur);
    return json(cur);
  }

  return json({ error: "key" }, 400);
};

export const config = { path: "/api/state" };
