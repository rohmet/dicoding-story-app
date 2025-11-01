import AddStoryPresenter from "./add-story-presenter.js";

// Impor API sebagai "model"
// Gunakan "import * as" untuk memperbaiki warning dari refaktor api.js
import * as DicodingStoryApi from "../../data/api.js";

// Impor Leaflet (tetap di sini, karena ini adalah urusan View)
import L from "leaflet";

export default class AddStoryPage {
  #map;
  #marker;

  // Tambahkan properti privat untuk menyimpan instance Presenter
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
    this.#map = L.map("map-picker").setView([-2.5489, 118.0149], 5); // Center di Indonesia
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // 3. Tambahkan Event Listener Klik pada Peta
    this.#map.on("click", (e) => this._onMapClick(e));

    // 4. Tambahkan Event Listener Submit Form
    const addStoryForm = document.querySelector("#add-story-form");
    addStoryForm.addEventListener("submit", (event) => this._onSubmit(event));
  }

  /**
   * Event handler untuk klik peta.
   * Ini murni logika View, jadi tetap di sini.
   */
  _onMapClick(e) {
    const { lat, lng } = e.latlng;

    // Simpan koordinat ke input tersembunyi
    document.querySelector("#lat-input").value = lat;
    document.querySelector("#lon-input").value = lng;

    // Tampilkan/Pindahkan marker
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

    // View HANYA mendelegasikan tugas ke Presenter
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
