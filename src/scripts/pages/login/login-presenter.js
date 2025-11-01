export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model; // Ini akan menjadi { login, register, ... } dari api.js
    this.#authModel = authModel; // Ini akan menjadi AuthHelper
  }

  /**
   * Fungsi untuk menangani logika login.
   * Dipanggil oleh View.
   */
  async doLogin({ email, password }) {
    // 1. Beri tahu View untuk menampilkan status loading
    this.#view.showLoading();

    try {
      // 2. Panggil API (Model)
      // Kita menggunakan api.js yang sudah di-refaktor (melempar error)
      const loginResult = await this.#model.login({ email, password });

      // 3. Jika sukses, simpan token (AuthModel)
      this.#authModel.putAccessToken(loginResult.token);

      // 4. Beri tahu View bahwa login berhasil
      this.#view.loginSuccess();
    } catch (error) {
      // 5. Jika gagal, beri tahu View untuk menampilkan pesan error
      this.#view.loginFailed(error.message);
    } finally {
      // 6. Selalu beri tahu View untuk menyembunyikan status loading
      this.#view.hideLoading();
    }
  }
}
