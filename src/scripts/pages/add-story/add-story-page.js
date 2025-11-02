import AddStoryPresenter from "./add-story-presenter.js";
import * as DicodingStoryApi from "../../data/api.js";
import Map from "../../utils/map.js";
import "leaflet/dist/leaflet.css";

export default class AddStoryPage {
  #map;
  #marker;
  #presenter = null;

  async render() {
    return `
      <section class="container">
        <h2>Tambah Story Baru</h2>
        
        <form id="add-story-form">
          <div id="form-status-message"></div>
          
          <div>
            <label for="description-input">Deskripsi:</label>
            <textarea id="description-input" name="description" rows="5" required></textarea>
            <span id="description-error" class="error-message"></span>
          </div>
          
          <div>
            <label for="photo-input">Upload Gambar (Max 1MB):</label>
            <input type="file" id="photo-input" name="photo" accept="image/*" required>
            <span id="photo-error" class="error-message"></span>
          </div>
          
          <div>
            <label>Pilih Lokasi (Klik Peta):</label>
            <div id="map-picker" style="height: 300px; width: 100%; position: relative;">
              <div id="map-loader-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #eee; display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <p>Memuat peta...</p>
              </div>
            </div>
            <span id="location-error" class="error-message"></span>
          </div>
          
          <input type="hidden" id="lat-input" name="lat">
          <input type="hidden" id="lon-input" name="lon">
          
          <button type="submit" id="upload-submit-button">Upload Story</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddStoryPresenter({
      view: this,
      model: DicodingStoryApi,
    });

    await this.#presenter.showFormMap();

    const addStoryForm = document.querySelector("#add-story-form");
    addStoryForm.addEventListener("submit", (event) => this._onSubmit(event));
  }

  /**
   * PRESENTER COMMAND: Inisialisasi Peta
   * Dipanggil oleh Presenter.
   */
  async initialMap() {
    // 'locate: true' akan meminta lokasi pengguna
    this.#map = await Map.build("#map-picker", { locate: true });

    // Setelah peta siap, View setup listener internalnya
    this.#map.addMapEventListener("click", (e) => this._onMapClick(e));
  }

  /**
   * Event handler untuk klik peta.
   */
  _onMapClick(e) {
    const { lat, lng } = e.latlng;
    document.querySelector("#lat-input").value = lat;
    document.querySelector("#lon-input").value = lng;
    if (this.#marker) {
      this.#marker.remove();
    }
    this.#marker = this.#map.addMarker(
      [lat, lng],
      {},
      {
        content: `Lokasi dipilih: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }
    );
    this.#marker.openPopup();
    document.querySelector("#location-error").textContent = "";
  }

  /**
   * Event handler untuk submit form.
   */
  async _onSubmit(event) {
    event.preventDefault();

    this.#clearValidationErrors();

    const data = {
      description: event.target.elements.description.value,
      photo: event.target.elements.photo.files[0],
      lat: event.target.elements.lat.value,
      lon: event.target.elements.lon.value,
    };
    await this.#presenter.uploadStory(data);
  }

  /**
   * FUNGSI: Membersihkan semua pesan error
   */
  #clearValidationErrors() {
    document.querySelector("#description-error").textContent = "";
    document.querySelector("#photo-error").textContent = "";
    document.querySelector("#location-error").textContent = "";

    const statusContainer = document.querySelector("#form-status-message");
    statusContainer.textContent = "";
    statusContainer.className = "";
  }

  // --- Metode-metode ini dipanggil oleh Presenter ---

  /**
   * FUNGSI: Menampilkan error validasi inline
   */
  showValidationErrors(errors) {
    if (errors.description) {
      document.querySelector("#description-error").textContent =
        errors.description;
    }
    if (errors.photo) {
      document.querySelector("#photo-error").textContent = errors.photo;
    }
    if (errors.location) {
      document.querySelector("#location-error").textContent = errors.location;
    }
  }

  /**
   * Dipanggil oleh Presenter jika upload berhasil.
   */
  uploadSuccess() {
    const statusContainer = document.querySelector("#form-status-message");
    statusContainer.textContent = "Story berhasil ditambahkan!";
    statusContainer.className = "status-success";

    document.querySelector("#add-story-form").reset();
    if (this.#marker) this.#marker.remove();

    setTimeout(() => {
      window.location.hash = "#/";
    }, 2000);
  }

  /**
   * Dipanggil oleh Presenter jika terjadi error (validasi atau API).
   */
  showError(message) {
    const statusContainer = document.querySelector("#form-status-message");
    statusContainer.textContent = `Terjadi kesalahan: ${message}`;
    statusContainer.className = "status-error";
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

  showMapLoading() {
    document.querySelector("#map-loader-container").style.display = "flex";
  }

  hideMapLoading() {
    document.querySelector("#map-loader-container").style.display = "none";
  }
}
