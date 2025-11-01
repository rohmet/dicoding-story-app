import AddStoryPresenter from "./add-story-presenter.js";
import * as DicodingStoryApi from "../../data/api.js";

import L from "leaflet";

export default class AddStoryPage {
  #map;
  #marker;

  #presenter = null;

  async render() {
    return `
      <section class="container">
        <h2>Tambah Story Baru</h2>
        
        <form id="add-story-form">
          <div>
            <label for="description-input">Deskripsi:</label>
            <textarea id="description-input" name="description" rows="5" required></textarea>
          </div>
          
          <div>
            <label for="photo-input">Upload Gambar (Max 1MB):</label>
            <input type="file" id="photo-input" name="photo" accept="image/*" required>
          </div>
          
          <div>
            <label>Pilih Lokasi (Klik Peta):</label>
            <div id="map-picker" style="height: 300px; width: 100%;"></div>
          </div>
          
          <input type="hidden" id="lat-input" name="lat">
          <input type="hidden" id="lon-input" name="lon">
          
          <button type="submit" id="upload-submit-button">Upload Story</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // 1. Inisialisasi Presenter dan "suntikkan" dependencies (View, Model)
    this.#presenter = new AddStoryPresenter({
      view: this,
      model: DicodingStoryApi,
    });

    // 2. Inisialisasi Peta
    this.#map = L.map("map-picker").setView([-2.5489, 118.0149], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", (e) => this._onMapClick(e));

    const addStoryForm = document.querySelector("#add-story-form");
    addStoryForm.addEventListener("submit", (event) => this._onSubmit(event));
  }

  /**
   * Event handler untuk klik peta.
   * Ini murni logika View, jadi tetap di sini.
   */
  _onMapClick(e) {
    const { lat, lng } = e.latlng;

    document.querySelector("#lat-input").value = lat;
    document.querySelector("#lon-input").value = lng;

    if (this.#marker) {
      this.#marker.setLatLng(e.latlng);
    } else {
      this.#marker = L.marker(e.latlng).addTo(this.#map);
    }

    this.#marker
      .bindPopup(`Lokasi dipilih: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      .openPopup();
  }

  /**
   * Event handler untuk submit form.
   * Sekarang hanya mengambil data dan mendelegasikan ke Presenter.
   */
  async _onSubmit(event) {
    event.preventDefault();

    const data = {
      description: event.target.elements.description.value,
      photo: event.target.elements.photo.files[0],
      lat: event.target.elements.lat.value,
      lon: event.target.elements.lon.value,
    };

    await this.#presenter.uploadStory(data);
  }

  // --- Metode-metode ini dipanggil oleh Presenter ---

  /**
   * Dipanggil oleh Presenter jika upload berhasil.
   */
  uploadSuccess() {
    alert("Story berhasil ditambahkan!");
    window.location.hash = "#/"; // Kembali ke Halaman Home
  }

  /**
   * Dipanggil oleh Presenter jika terjadi error (validasi atau API).
   */
  showError(message) {
    alert(message); // Tampilkan pesan error
  }

  /**
   * Dipanggil oleh Presenter untuk menampilkan status loading di tombol.
   */
  showLoading() {
    const button = document.querySelector("#upload-submit-button");
    button.disabled = true;
    button.innerHTML = "Uploading...";
  }

  /**
   * Dipanggil oleh Presenter untuk menyembunyikan status loading di tombol.
   */
  hideLoading() {
    const button = document.querySelector("#upload-submit-button");
    button.disabled = false;
    button.innerHTML = "Upload Story";
  }
}
