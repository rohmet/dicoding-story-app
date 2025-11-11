// src/sw.js

// Event listener untuk 'push'
self.addEventListener("push", (event) => {
  console.log("[Service worker] Menerima push...");

  let data;
  try {
    // event.data.json() akan mem-parsing data JSON dari backend
    data = event.data.json();
  } catch (e) {
    console.error("Push event data tidak valid:", e);
    data = {
      title: "Notifikasi Gagal Dimuat",
      options: {
        body: "Data notifikasi tidak bisa di-parsing.",
        icon: "favicon.png",
      },
    };
  }

  const notificationTitle = "Story Baru Ditambahkan!";
  const notificationOptions = data.options;

  // Menampilkan notifikasi
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});
