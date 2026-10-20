/* ============================================================
   Service Worker - Portal Escolar Abel (PWA)
   Estratégia:
   - Precache dos arquivos essenciais na instalação
   - Navegação: network-first com fallback para o cache (offline)
   - Estáticos: cache-first com atualização em segundo plano
   Caminhos relativos (./) para funcionar no GitHub Pages em subpasta.
   ============================================================ */

const CACHE_VERSION = "portal-abel-v1";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon.svg"
];

/* Instalação: baixa e guarda os arquivos essenciais */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* Ativação: remove caches antigos de versões anteriores */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* Intercepta requisições */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Apenas requisições GET do próprio escopo são tratadas
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação (documento HTML): network-first, com fallback offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  // Demais arquivos: cache-first, atualizando o cache em segundo plano
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});

/* Permite que a página force a atualização do service worker */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
