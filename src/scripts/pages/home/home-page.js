import DicodingStoryApi from "../../data/api.js";
import L from "leaflet";

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h2>Daftar Story</h2>
        
        <div id="map-container" style="height: 400px; width: 100%; margin-bottom: 20px;"></div>
        
        <div id="story-list" class="story-list">
          <p>Memuat data story...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Ambil data stories
    const { error, data } = await DicodingStoryApi.getAllStories();

    if (error || !data) {
      document.querySelector("#story-list").innerHTML =
        "<p>Gagal memuat data. Silakan login kembali.</p>";
      return;
    }

    const storyListContainer = document.querySelector("#story-list");
    storyListContainer.innerHTML = ""; // Kosongkan "Memuat data..."

    // Inisialisasi Peta Leaflet
    // Tentukan koordinat tengah (misal: Indonesia)
    const map = L.map("map-container").setView([-2.5489, 118.0149], 5);

    // Tambahkan Tile Layer (misal: OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Iterasi data untuk ditampilkan di List dan Peta
    data.forEach((story) => {
      // --- Bagian 1: Render List Story ---
      // Kriteria 2 Basic: minimal gambar dan 3 text
      // Kita akan tampilkan: photoUrl, name, description, createdAt
      const storyElement = document.createElement("div");
      storyElement.classList.add("story-item");
      storyElement.innerHTML = `
        <img src="${story.photoUrl}" alt="Story oleh ${story.name}">
        <h3>${story.name}</h3>
        <p class="story-date">${new Date(
          story.createdAt
        ).toLocaleDateString()}</p>
        <p>${story.description}</p>
      `;
      storyListContainer.appendChild(storyElement);

      // --- Bagian 2: Render Marker dan Popup di Peta ---
      if (story.lat && story.lon) {
        // Kriteria 2 Basic: marker dan pop-up
        const marker = L.marker([story.lat, story.lon]).addTo(map);

        // Popup menampilkan minimal info
        marker.bindPopup(`
          <b>${story.name}</b><br>
          ${story.description.substring(0, 30)}...
        `);
      }
    });
  }
}
