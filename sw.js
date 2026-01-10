const CACHE_NAME = "editor-html-v1";

const CORE_ASSETS = [

  "/",

  "/index.html",

  "/manifest.webmanifest",

  "/sw.js",

  "/icons/icon-192.png",

  "/icons/icon-512.png"

  // Se você fizer self-host: adicione aqui seus /vendor/... também

];

self.addEventListener("install", (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))

  );

  self.skipWaiting();

});

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys().then((keys) =>

      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))

    )

  );

  self.clients.claim();

});

// Cache-first para arquivos do app; network-first pode ser melhor pra conteúdo dinâmico,

// mas aqui é um editor local, então cache-first é OK.

self.addEventListener("fetch", (event) => {

  const req = event.request;

  if (req.method !== "GET") return;

  event.respondWith(

    caches.match(req).then((cached) => {

      if (cached) return cached;

      return fetch(req).then((res) => {

        const copy = res.clone();

        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));

        return res;

      }).catch(() => caches.match("/index.html"));

    })

  );

});