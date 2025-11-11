// src/sw.js

// Event listener untuk 'push'
self.addEventListener("push", (event) => {
  console.log("[Service worker] Menerima push...");

  // Data notifikasi (masih statis untuk level basic)
  const notificationTitle = "Story Baru Ditambahkan!";
  const notificationOptions = {
    body: "Ada cerita baru yang menarik untuk dilihat.",
    icon: "favicon.png", // Anda bisa ganti dengan ikon notifikasi
  };

  // Menampilkan notifikasi
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});
