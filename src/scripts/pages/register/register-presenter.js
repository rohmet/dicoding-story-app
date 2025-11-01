export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model; // Ini akan menjadi DicodingStoryApi
  }

  /**
   * Fungsi untuk menangani logika registrasi.
   * Dipanggil oleh View.
   */
  async doRegister({ name, email, password }) {
    // 1. Beri tahu View untuk menampilkan status loading
    this.#view.showLoading();

    try {
      // 2. Panggil API (Model)
      // Kita menggunakan api.js yang sudah di-refaktor (melempar error)
      await this.#model.register({ name, email, password });

      // 3. Jika sukses (tidak ada error), beri tahu View
      this.#view.registerSuccess();
    } catch (error) {
      // 4. Jika gagal (API melempar error), beri tahu View
      this.#view.registerFailed(error.message);
    } finally {
      // 5. Selalu beri tahu View untuk menyembunyikan loading
      this.#view.hideLoading();
    }
  }
}
