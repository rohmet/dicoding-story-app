import L from "leaflet";
import DicodingStoryApi from "../../data/api.js";

export default class AddStoryPage {
  #map;
  #marker;

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
          
          <button type="submit">Upload Story</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // 1. Inisialisasi Peta
    this.#map = L.map("map-picker").setView([-2.5489, 118.0149], 5); // Center di Indonesia

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // 2. Tambahkan Event Listener Klik pada Peta (Kriteria 3 Basic)
    this.#map.on("click", (e) => this._onMapClick(e));

    // 3. Tambahkan Event Listener Submit Form
    const addStoryForm = document.querySelector("#add-story-form");
    addStoryForm.addEventListener("submit", (event) => this._onSubmit(event));
  }

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

  async _onSubmit(event) {
    event.preventDefault();

    const description = event.target.elements.description.value;
    const photo = event.target.elements.photo.files[0];
    const lat = event.target.elements.lat.value;
    const lon = event.target.elements.lon.value;

    // Validasi sederhana
    if (!description || !photo) {
      alert("Deskripsi dan Gambar tidak boleh kosong!");
      return;
    }
    if (photo.size > 1000000) {
      // 1MB
      alert("Ukuran gambar terlalu besar! Maksimal 1MB.");
      return;
    }

    // Cek jika lat/lon belum diisi (opsional tapi disarankan)
    if (!lat || !lon) {
      alert("Silakan pilih lokasi di peta terlebih dahulu.");
      return;
    }

    try {
      const { error } = await DicodingStoryApi.addNewStory({
        description,
        photo,
        lat: parseFloat(lat), // Pastikan tipe datanya float
        lon: parseFloat(lon), // Pastikan tipe datanya float
      });

      if (!error) {
        alert("Story berhasil ditambahkan!");
        window.location.hash = "#/"; // Kembali ke Halaman Home
      }
    } catch (error) {
      console.error("Error adding story:", error);
      alert("Terjadi kesalahan saat mengupload story.");
    }
  }
}
