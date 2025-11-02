import AddStoryPresenter from "./add-story-presenter.js";
import * as DicodingStoryApi from "../../data/api.js";
import Map from "../../utils/map.js";
import "leaflet/dist/leaflet.css";
import Camera from "../../utils/camera.js";
import { convertBase64ToBlob } from "../../utils/index.js";

export default class AddStoryPage {
  #map;
  #marker;
  #presenter = null;
  #form = null;
  #camera = null;
  #isCameraOpen = false;
  #takenPictures = [];

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
          
          <div class="form-control">
            <label class="new-form__documentations__title">Dokumentasi</label>
            <div>Anda dapat menyertakan foto (file atau kamera).</div>

            <div class="new-form__documentations__container">
              <div class="new-form__documentations__buttons">
                <button id="documentations-input-button" class="btn btn-outline" type="button">
                  Upload Gambar
                </button>
                <input
                  id="documentations-input"
                  name="documentations"
                  type="file"
                  accept="image/*"
                  multiple
                  hidden="hidden"
                >
                <button id="open-camera-button" class="btn btn-outline" type="button">
                  Buka Kamera
                </button>
              </div>

              <div id="camera-container" class="new-form__camera__container">
                <video id="camera-video">Video stream not available.</video>
                <canvas id="camera-canvas" hidden></canvas>
  
                <div class="new-form__camera__tools">
                  <select id="camera-select"></select>
                  <button id="camera-take-button" class="btn" type="button">
                    Ambil Gambar
                  </button>
                </div>
              </div>

              <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
            </div>
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

    this.#takenPictures = [];
    this.#form = document.querySelector("#add-story-form");

    await this.#presenter.showFormMap();

    const addStoryForm = document.querySelector("#add-story-form");
    addStoryForm.addEventListener("submit", (event) => this._onSubmit(event));

    this.#setupFormListeners();
  }

  /**
   * FUNGSI: Menangani semua listener form
   */
  #setupFormListeners() {
    document
      .getElementById("documentations-input-button")
      .addEventListener("click", () => {
        this.#form.elements.namedItem("documentations-input").click();
      });

    document
      .getElementById("documentations-input")
      .addEventListener("change", async (event) => {
        const files = Object.values(event.target.files);
        const addingPromises = files.map((file) => this.#addTakenPicture(file));
        await Promise.all(addingPromises);

        await this.#populateTakenPictures();
      });

    const cameraContainer = document.getElementById("camera-container");
    document
      .getElementById("open-camera-button")
      .addEventListener("click", async (event) => {
        cameraContainer.classList.toggle("open");
        this.#isCameraOpen = cameraContainer.classList.contains("open");
        const button = event.currentTarget;

        if (this.#isCameraOpen) {
          button.textContent = "Tutup Kamera";
          await this.#setupCamera();
          this.#camera.launch();
        } else {
          button.textContent = "Buka Kamera";
          if (this.#camera) this.#camera.stop();
        }
      });
  }

  /**
   * FUNGSI: Inisialisasi class Camera
   */
  async #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById("camera-video"),
        cameraSelect: document.getElementById("camera-select"),
        canvas: document.getElementById("camera-canvas"),
      });
    }

    this.#camera.addCheeseButtonListener("#camera-take-button", async () => {
      const base64Image = this.#camera.takePicture();
      await this.#addTakenPicture(base64Image);
      await this.#populateTakenPictures();
    });
  }

  /**
   * FUNGSI: Menambahkan gambar ke array #takenPictures
   */
  async #addTakenPicture(image) {
    let blob;
    if (typeof image === "string") {
      blob = await convertBase64ToBlob(image.split(",")[1], "image/jpeg");
    } else {
      blob = image;
    }

    const newPicture = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    this.#takenPictures = [...this.#takenPictures, newPicture];
  }

  /**
   * FUNGSI: Menampilkan thumbnail foto yang diambil
   */
  async #populateTakenPictures() {
    const listContainer = document.getElementById("documentations-taken-list");
    listContainer.innerHTML = "";

    this.#takenPictures.forEach((picture, index) => {
      const imageUrl = URL.createObjectURL(picture.blob);
      const li = document.createElement("li");
      li.classList.add("new-form__documentations__outputs-item");
      li.innerHTML = `
        <button type="button" data-deletepictureid="${
          picture.id
        }" class="new-form__documentations__outputs-item__delete-btn">
          <img src="${imageUrl}" alt="Dokumentasi ke-${index + 1}">
        </button>
      `;
      listContainer.appendChild(li);

      li.querySelector("button").addEventListener("click", (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;
        this.#removePicture(pictureId);
        this.#populateTakenPictures();
      });
    });
  }

  /**
   * FUNGSI: Menghapus foto dari array #takenPictures
   */
  #removePicture(id) {
    this.#takenPictures = this.#takenPictures.filter((pic) => pic.id !== id);
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

    const photos = this.#takenPictures.map((pic) => pic.blob);

    const data = {
      description: this.#form.elements.namedItem("description").value,
      photo: photos[0],
      lat: this.#form.elements.namedItem("lat").value,
      lon: this.#form.elements.namedItem("lon").value,
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
