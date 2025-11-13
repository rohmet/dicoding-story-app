import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
// import CONFIG from "./scripts/config";

precacheAndRoute(self.__WB_MANIFEST);
const BASE_URL = "https://story-api.dicoding.dev/v1";

// Caching untuk Google Fonts
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

// Caching untuk Font Awesome
registerRoute(
  ({ url }) => url.origin === "https://cdnjs.cloudflare.com",
  new CacheFirst({
    cacheName: "fontawesome",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

// Caching untuk API (StaleWhileRevalidate)
registerRoute(
  ({ url }) => url.href.startsWith(BASE_URL),
  new StaleWhileRevalidate({
    cacheName: "story-api",
  })
);

self.addEventListener("push", (event) => {
  console.log("[Service worker] Menerima push...");

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    console.error(
      "Push event data tidak valid, gunakan text sebagai fallback:",
      e
    );
    data.title = "Notifikasi";
    data.options = {
      body: event.data.text(),
    };
  }

  const notificationTitle = data.title;
  const notificationOptions = {
    body: data.options.body,
    icon: data.options.icon || "favicon.png",
    data: data.options.data,
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("[Service worker] Notifikasi diklik.");
  event.notification.close();

  const storyId = event.notification.data.storyId;

  if (!storyId) {
    event.waitUntil(clients.openWindow("/#/"));
    return;
  }

  const urlToOpen = `/#/story/${storyId}`;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.endsWith(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
