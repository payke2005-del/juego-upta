// ==========================================================================
// SERVICE WORKER - PIXEL VOCACIONAL (PWA OFFLINE)
// Estrategia: Cache First -> Network -> Fallback a index.html
// Las APIs/CDNs externas NUNCA se cachean (siempre van directo a la red).
// ==========================================================================

// Nombre del cache: al cambiar la versión, el 'activate' borra los viejos
const CACHE_NAME = 'pixel-vocacional-v1.0.0';

// Archivos esenciales de la app que se guardan en la primera visita
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/questions.js',
  './js/auth.js',
  './js/fichas.js',
  './js/progress.js',
  './js/ranking.js',
  './js/sounds.js',
  './js/share.js',
  './js/achievements.js',
  './js/app.js',
  './js/chatbot.js',
  './manifest.json'
];

// Hosts externos (CDNs / APIs) que NUNCA deben guardarse en el cache:
// imágenes de postimg, fuentes de Google, IA del chatbot, emails de EmailJS.
const EXTERNAL_HOSTS = [
  'postimg.cc',
  'fonts.google.com',
  'fonts.gstatic.com',
  'generativelanguage.googleapis.com',
  'openrouter.ai',
  'api.emailjs.com'
];

// ¿La URL pertenece a un CDN/API externo?
function isExternal(url) {
  return EXTERNAL_HOSTS.some(host => url.hostname === host || url.hostname.endsWith('.' + host));
}

// --- INSTALACIÓN: precachea todos los archivos de la app ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // activa el SW nuevo de inmediato
  );
});

// --- ACTIVACIÓN: limpia caches de versiones anteriores ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim()) // toma control de las pestañas abiertas
  );
});

// --- FETCH: sirve offline con estrategia Cache First ---
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Solo interceptamos peticiones GET
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  // Ignorar esquemas que no son web (chrome-extension:, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // CDNs y APIs externas: pasan directo a la red, sin cache
  if (isExternal(url)) return;

  event.respondWith(
    // 1) Intentar responder desde el cache
    caches.match(request).then(cached => {
      if (cached) return cached;

      // 2) No estaba en cache: ir a la red
      return fetch(request).then(response => {
        // Guardar en cache las respuestas válidas del mismo origen
        // (así los avatares locales y otros assets quedan disponibles offline)
        if (response && response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // 3) La red falló (sin conexión): devolver index.html como fallback
        return caches.match('./index.html');
      });
    })
  );
});