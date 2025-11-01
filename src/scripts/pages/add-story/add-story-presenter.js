export default class AddStoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model; // Ini akan menjadi DicodingStoryApi
  }

  /**
   * Fungsi untuk menangani logika upload story.
   * Dipanggil oleh View.
   */
  async uploadStory({ description, photo, lat, lon }) {
    // 1. Validasi Input
    // Pindahkan validasi dari View ke Presenter
    if (!description || !photo) {
      this.#view.showError("Deskripsi dan Gambar tidak boleh kosong!");
      return;
    }
    if (photo.size > 1000000) {
      // 1MB
      this.#view.showError("Ukuran gambar terlalu besar! Maksimal 1MB.");
      return;
    }
    if (!lat || !lon) {
      this.#view.showError("Silakan pilih lokasi di peta terlebih dahulu.");
      return;
    }

    // 2. Beri tahu View untuk menampilkan status loading
    this.#view.showLoading();

    try {
      // 3. Panggil API (Model)
      // Pastikan lat/lon dikirim sebagai angka
      await this.#model.addNewStory({
        description,
        photo,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      });

      // 4. Jika sukses, beri tahu View
      this.#view.uploadSuccess();
    } catch (error) {
      // 5. Jika gagal, beri tahu View
      this.#view.showError(error.message);
    } finally {
      // 6. Selalu beri tahu View untuk menyembunyikan loading
      this.#view.hideLoading();
    }
  }
}
