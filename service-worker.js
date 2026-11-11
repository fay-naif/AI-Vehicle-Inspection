/**
 * Service worker – keeps the whole app available offline.
 *
 * Everything the app needs is cached on install. Requests are answered from
 * the cache first and refreshed in the background, so a new version shows up
 * on the next launch. Bump CACHE_VERSION whenever the file list changes.
 */
const CACHE_VERSION = "vehicle-ai-v1";

const APP_FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/main.css",
  "css/variables.css",
  "css/base.css",
  "css/layout.css",
  "css/components/typography.css",
  "css/components/buttons.css",
  "css/components/slide-to-start.css",
  "css/components/forms.css",
  "css/components/cards.css",
  "css/components/overlay.css",
  "css/components/toast.css",
  "css/screens/splash.css",
  "css/screens/login.css",
  "css/screens/about.css",
  "css/screens/upload.css",
  "css/screens/report.css",
  "css/rtl.css",
  "css/device-frame.css",
  "css/print.css",
  "js/generated/locales.js",
  "js/utils/dom.js",
  "js/utils/format.js",
  "js/utils/image.js",
  "js/i18n.js",
  "js/router.js",
  "js/services/storage.js",
  "js/services/auth.js",
  "js/services/image-metrics.js",
  "js/services/analysis.js",
  "js/services/sample-results.js",
  "js/services/pwa.js",
  "js/ui/toast.js",
  "js/ui/analysis-overlay.js",
  "js/ui/slide-to-start.js",
  "js/ui/install-button.js",
  "js/ui/common-actions.js",
  "js/screens/splash.js",
  "js/screens/login.js",
  "js/screens/about.js",
  "js/screens/upload.js",
  "js/screens/report.js",
  "js/app.js",
  "assets/fonts/IBMPlexSansArabic-Bold.ttf",
  "assets/fonts/IBMPlexSansArabic-Regular.ttf",
  "assets/fonts/IBMPlexSansArabic-SemiBold.ttf",
  "assets/icons/app/apple-touch-icon.png",
  "assets/icons/app/favicon-32.png",
  "assets/icons/app/icon-192.png",
  "assets/icons/app/icon-512.png",
  "assets/icons/app/icon-maskable-512.png",
  "assets/icons/bolt.svg",
  "assets/icons/brain.svg",
  "assets/icons/chart.svg",
  "assets/icons/check-green.svg",
  "assets/icons/check.svg",
  "assets/icons/chevron.svg",
  "assets/icons/close.svg",
  "assets/icons/download.svg",
  "assets/icons/globe.svg",
  "assets/icons/home.svg",
  "assets/icons/image.svg",
  "assets/icons/lock.svg",
  "assets/icons/logout.svg",
  "assets/icons/mail.svg",
  "assets/icons/plus.svg",
  "assets/icons/print.svg",
  "assets/icons/save.svg",
  "assets/icons/share.svg",
  "assets/icons/shield.svg",
  "assets/icons/upload.svg",
  "assets/icons/user.svg",
  "assets/images/favicon.svg",
  "assets/images/hero-vehicles.jpg",
  "assets/images/logo.svg",
  "assets/images/samples/sedan.jpg",
  "assets/images/samples/truck.jpg",
  "assets/images/samples/van.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
