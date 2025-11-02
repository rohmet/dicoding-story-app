import RegisterPresenter from "./register-presenter.js";
import * as DicodingStoryApi from "../../data/api.js";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="container">
        <h1>Register Page</h1>
        
        <form id="register-form">
          <div>
            <label for="name-input">Name</label>
            <input type="text" id="name-input" name="name" required>
          </div>
          <div>
            <label for="email-input">Email</label>
            <input type="email" id="email-input" name="email" required>
          </div>
          <div>
            <label for="password-input">Password</label>
            <input type="password" id="password-input" name="password" minlength="8" required>
          </div>
          <button type="submit" id="register-submit-button">Register</button>
        </form>
        
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: DicodingStoryApi,
    });

    this.#setupForm();
  }

  /**
   * Fungsi privat untuk setup event listener form.
   */
  #setupForm() {
    const registerForm = document.querySelector("#register-form");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = event.target.elements.name.value;
      const email = event.target.elements.email.value;
      const password = event.target.elements.password.value;

      await this.#presenter.doRegister({ name, email, password });
    });
  }

  // --- Metode-metode ini dipanggil oleh Presenter ---

  /**
   * Dipanggil oleh Presenter jika registrasi berhasil.
   */
  registerSuccess() {
    alert("Registrasi berhasil! Silakan login.");
    window.location.hash = "#/login"; // Pindahkan ke halaman login
  }

  /**
   * Dipanggil oleh Presenter jika registrasi gagal.
   */
  registerFailed(message) {
    console.error("Error during registration:", message);
    alert(`Terjadi kesalahan saat registrasi: ${message}`);
  }

  /**
   * Dipanggil oleh Presenter untuk menampilkan status loading di tombol.
   */
  showLoading() {
    const button = document.querySelector("#register-submit-button");
    button.disabled = true;
    button.innerHTML = "Loading...";
  }

  /**
   * Dipanggil oleh Presenter untuk menyembunyikan status loading di tombol.
   */
  hideLoading() {
    const button = document.querySelector("#register-submit-button");
    button.disabled = false;
    button.innerHTML = "Register";
  }
}
