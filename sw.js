/* =========================================================
   DOUBLEU Kit Builder — service worker

   Strategia: SEMPRE prima la rete, la copia locale solo come
   ripiego. Online si vede quindi sempre l'ultimo deploy: la
   cache non può servire una versione vecchia, che è il motivo
   per cui in index.html ci sono i meta tag anti-cache.
   Offline si vede l'ultima versione scaricata.
   ========================================================= */

// Da tenere allineato a BUILD in index.html: cambiando nome, l'activate qui
// sotto elimina la cache precedente e la copia locale viene riscaricata.
const CACHE = "doubleu-kit-v55";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-1254.png",
];

// La libreria Supabase arriva da CDN a ogni avvio: senza una copia locale,
// niente rete significa non superare nemmeno la schermata di accesso.
const VENDOR = [
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js",
  "https://unpkg.com/@supabase/supabase-js@2.49.4/dist/umd/supabase.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Lo shell deve esserci: se fallisce, l'installazione fallisce.
    await cache.addAll(SHELL);
    // Il vendor è best effort: se un CDN non risponde non blocchiamo l'installazione.
    await Promise.all(VENDOR.map(async (url) => {
      try {
        const res = await fetch(url, { mode: "cors", cache: "reload" });
        if (res && res.ok) await cache.put(url, res);
      } catch (_) { /* riproveremo al prossimo avvio online */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }

  // Le chiamate all'API Supabase devono sempre andare in rete: una risposta
  // dalla cache significherebbe mostrare kit o margini non aggiornati.
  if (url.hostname.endsWith(".supabase.co")) return;
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok && (url.origin === self.location.origin || VENDOR.includes(req.url))) {
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) return cached;
      // Navigazione senza rete: serviamo comunque l'app.
      if (req.mode === "navigate") {
        const shell = await caches.match("./index.html");
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
