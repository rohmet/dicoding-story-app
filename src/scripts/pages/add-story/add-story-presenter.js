export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Fungsi Orkestrasi untuk memuat Peta
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
   */
  async uploadStory({ description, photo, lat, lon }) {
    const errors = {};

    if (!description) {
      errors.description = "Deskripsi tidak boleh kosong!";
    }

    if (!photo) {
      errors.photo = "Gambar tidak boleh kosong!";
    } else if (photo.size > 1000000) {
      // 1MB
      errors.photo = "Ukuran gambar terlalu besar! Maksimal 1MB.";
    }

    if (!lat || !lon) {
      errors.location = "Silakan pilih lokasi di peta terlebih dahulu.";
    }

    if (Object.keys(errors).length > 0) {
      this.#view.showValidationErrors(errors);
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
