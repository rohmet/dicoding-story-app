self.addEventListener("push", (event) => {
  console.log("[Service worker] Menerima push...");

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error("Push event data tidak valid:", e);
    // ... (kode fallback Anda)
    return;
  }

  const notificationTitle = data.title;

  // MODIFIKASI: Ambil data (storyId) dari payload
  const notificationOptions = {
    body: data.options.body,
    icon: data.options.icon || "favicon.png",

    // PENTING: Simpan data (termasuk ID) ke notifikasi
    // Asumsi: backend mengirim { ..., options: { ..., data: { storyId: '...' } } }
    data: data.options.data,
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// TAMBAHKAN LISTENER BARU INI:
self.addEventListener("notificationclick", (event) => {
  console.log("[Service worker] Notifikasi diklik.");

  // Tutup notifikasi
  event.notification.close();

  // Ambil storyId yang kita simpan di 'data'
  const storyId = event.notification.data.storyId;

  // Jika tidak ada ID, buka halaman utama saja
  if (!storyId) {
    console.log("Tidak ada storyId, membuka halaman utama.");
    event.waitUntil(clients.openWindow("/#/"));
    return;
  }

  // Jika ada ID, buka halaman detail story
  // Ganti rute '/#/story/' jika rute Anda berbeda
  const urlToOpen = `/#/story/${storyId}`;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Cek jika tab/jendela tersebut sudah terbuka
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.endsWith(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // Jika tidak terbuka, buka jendela baru
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
