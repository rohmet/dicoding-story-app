export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Fungsi untuk menangani logika upload story.
   * Dipanggil oleh View.
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
