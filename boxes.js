// Cloudflare Pages Function
// Requiere un KV Namespace ligado con el binding "EMPAQUE_KV" en la configuración
// del proyecto de Cloudflare Pages (Settings -> Functions -> KV namespace bindings).
//
// Guarda dos listas bajo llaves fijas:
//   perfume:list   -> catálogo de cajas de perfume del usuario
//   shipping:list  -> catálogo de cajas de envío (precargado + ediciones)
//
// API:
//   GET    /api/boxes?type=perfume|shipping        -> lista completa
//   POST   /api/boxes?type=perfume|shipping         body: caja (sin id -> se genera)
//   DELETE /api/boxes?type=perfume|shipping&id=XXX  -> elimina una caja

function keyFor(type) {
  if (type !== "perfume" && type !== "shipping") return null;
  return `${type}:list`;
}

async function readList(kv, type) {
  const raw = await kv.get(keyFor(type));
  return raw ? JSON.parse(raw) : [];
}

async function writeList(kv, type, list) {
  await kv.put(keyFor(type), JSON.stringify(list));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  if (!keyFor(type)) {
    return new Response(JSON.stringify({ error: "type debe ser 'perfume' o 'shipping'" }), { status: 400 });
  }
  const list = await readList(env.EMPAQUE_KV, type);
  return new Response(JSON.stringify(list), {
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  if (!keyFor(type)) {
    return new Response(JSON.stringify({ error: "type debe ser 'perfume' o 'shipping'" }), { status: 400 });
  }
  const body = await request.json();
  const list = await readList(env.EMPAQUE_KV, type);
  const item = { ...body, id: body.id || crypto.randomUUID() };
  const idx = list.findIndex((b) => b.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  await writeList(env.EMPAQUE_KV, type, list);
  return new Response(JSON.stringify(item), {
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");
  if (!keyFor(type) || !id) {
    return new Response(JSON.stringify({ error: "type e id son requeridos" }), { status: 400 });
  }
  const list = await readList(env.EMPAQUE_KV, type);
  const next = list.filter((b) => b.id !== id);
  await writeList(env.EMPAQUE_KV, type, next);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
}
