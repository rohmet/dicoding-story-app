import HomePresenter from "./home-presenter.js";

// Impor API sebagai "model"
// Gunakan "import * as" untuk memperbaiki warning dari refaktor api.js
import * as DicodingStoryApi from "../../data/api.js";

// Impor Leaflet (tetap di sini, karena ini adalah urusan View)
import L from "leaflet";

export default class HomePage {
  // Tambahkan properti privat untuk menyimpan instance Presenter
  #presenter = null;

  async render() {
    return `
      <section class="container">
        <h2>Daftar Story</h2>
        
        <div id="map-container" style="height: 400px; width: 100%; margin-bottom: 20px;"></div>
        
        <div id="loader-container"></div>
        
        <div id="story-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    // 1. Inisialisasi Presenter dan "suntikkan" dependencies (View, Model)
    this.#presenter = new HomePresenter({
      view: this,
      model: DicodingStoryApi,
    });

    // 2. View HANYA mendelegasikan tugas ke Presenter.
    await this.#presenter.displayStoriesAndMap();
  }

  // --- Metode-metode ini dipanggil oleh Presenter ---

  /**
   * Dipanggil oleh Presenter untuk menampilkan data di list dan peta.
   */
  populateStoriesAndMap(stories) {
    const storyListContainer = document.querySelector("#story-list");
    storyListContainer.innerHTML = ""; // Kosongkan

    // Inisialisasi Peta Leaflet
    const map = L.map("map-container").setView([-2.5489, 118.0149], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Iterasi data untuk ditampilkan di List dan Peta
    stories.forEach((story) => {
      // --- Bagian 1: Render List Story ---
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
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(`
          <b>${story.name}</b><br>
          ${story.description.substring(0, 30)}...
        `);
      }
    });
  }

  /**
   * Dipanggil oleh Presenter jika tidak ada data.
   */
  showEmptyStories() {
    document.querySelector("#story-list").innerHTML =
      "<p>Tidak ada story untuk ditampilkan.</p>";
  }

  /**
   * Dipanggil oleh Presenter jika terjadi error.
   */
  showError(message) {
    document.querySelector(
      "#story-list"
    ).innerHTML = `<p>Gagal memuat data. Silakan login kembali. (Error: ${message})</p>`;
  }

  /**
   * Dipanggil oleh Presenter untuk menampilkan status loading.
   */
  showLoading() {
    document.querySelector("#loader-container").innerHTML =
      "<p>Memuat data story...</p>";
  }

  /**
   * Dipanggil oleh Presenter untuk menyembunyikan status loading.
   */
  hideLoading() {
    document.querySelector("#loader-container").innerHTML = "";
  }
}
