export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Fungsi Orkestrasi untuk memuat Peta
   * Dipanggil oleh View saat afterRender.
   */
  async showFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showFormMap: error:", error);
      this.#view.showError(`Gagal memuat peta: ${error.message}`);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  /**
   * Fungsi untuk menangani logika upload story.
   * (Fungsi ini tidak berubah)
   */
  async uploadStory({ description, photo, lat, lon }) {
    if (!description || !photo) {
      this.#view.showError("Deskripsi dan Gambar tidak boleh kosong!");
      return;
    }
    if (photo.size > 1000000) {
      this.#view.showError("Ukuran gambar terlalu besar! Maksimal 1MB.");
      return;
    }
    if (!lat || !lon) {
      this.#view.showError("Silakan pilih lokasi di peta terlebih dahulu.");
      return;
    }

    this.#view.showLoading();

    try {
      await this.#model.addNewStory({
        description,
        photo,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      });

      this.#view.uploadSuccess();
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
