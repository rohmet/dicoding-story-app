export default class RegisterPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Fungsi untuk menangani logika registrasi.
   * Dipanggil oleh View.
   */
  async doRegister({ name, email, password }) {
    this.#view.showLoading();

    try {
      await this.#model.register({ name, email, password });

      this.#view.registerSuccess();
    } catch (error) {
      this.#view.registerFailed(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
