import LoginPresenter from "./login-presenter.js";
import * as DicodingStoryApi from "../../data/api.js";
import * as AuthHelper from "../../utils/auth-helper.js";

export default class LoginPage {
  // Tambahkan properti privat untuk menyimpan instance Presenter
  #presenter = null;

  async render() {
    return `
      <section class="container">
        <h2>Login Page</h2>
        
        <form id="login-form">
          <div>
            <label for="email-input">Email</label>
            <input type="email" id="email-input" name="email" required>
          </div>
          <div>
            <label for="password-input">Password</label>
            <input type="password" id="password-input" name="password" required>
          </div>
          <button type="submit" id="login-submit-button">Login</button>
        </form>
        
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: DicodingStoryApi,
      authModel: AuthHelper,
    });

    this.#setupForm();
  }

  /**
   * Fungsi privat untuk setup event listener form.
   */
  #setupForm() {
    const loginForm = document.querySelector("#login-form");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = event.target.elements.email.value;
      const password = event.target.elements.password.value;

      await this.#presenter.doLogin({ email, password });
    });
  }

  // --- Metode-metode ini dipanggil oleh Presenter ---

  /**
   * Dipanggil oleh Presenter jika login berhasil.
   * Berisi semua logika UI untuk sukses.
   */
  loginSuccess() {
    alert("Login berhasil!");
    window.location.hash = "#/";
    window.location.reload();
  }

  /**
   * Dipanggil oleh Presenter jika login gagal.
   * Berisi semua logika UI untuk gagal.
   */
  loginFailed(message) {
    console.error("Error during login:", message);
    alert(`Terjadi kesalahan saat login: ${message}`);
  }

  /**
   * Dipanggil oleh Presenter untuk menampilkan status loading di tombol.
   */
  showLoading() {
    const button = document.querySelector("#login-submit-button");
    button.disabled = true;
    button.innerHTML = "Loading...";
  }

  /**
   * Dipanggil oleh Presenter untuk menyembunyikan status loading di tombol.
   */
  hideLoading() {
    const button = document.querySelector("#login-submit-button");
    button.disabled = false;
    button.innerHTML = "Login";
  }
}
