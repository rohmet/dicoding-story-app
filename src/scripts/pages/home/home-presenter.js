export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model; // Ini akan menjadi DicodingStoryApi
  }

  /**
   * Fungsi utama untuk mengambil dan menampilkan data.
   * Dipanggil oleh View.
   */
  async displayStoriesAndMap() {
    // 1. Beri tahu View untuk menampilkan status loading
    this.#view.showLoading();

    try {
      // 2. Panggil API (Model)
      // Kita menggunakan api.js yang sudah di-refaktor (melempar error)
      const stories = await this.#model.getAllStories();

      // 3. Cek apakah datanya kosong
      if (stories.length === 0) {
        this.#view.showEmptyStories();
      } else {
        // 4. Jika ada data, kirim ke View untuk ditampilkan
        this.#view.populateStoriesAndMap(stories);
      }
    } catch (error) {
      // 5. Jika gagal (API melempar error), beri tahu View
      this.#view.showError(error.message);
    } finally {
      // 6. Selalu beri tahu View untuk menyembunyikan loading
      this.#view.hideLoading();
    }
  }
}
