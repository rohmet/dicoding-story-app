import DicodingStoryApi from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";

export default class LoginPage {
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
          <button type="submit">Login</button>
        </form>
        
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.querySelector("#login-form");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = event.target.elements.email.value;
      const password = event.target.elements.password.value;

      try {
        const { error, data } = await DicodingStoryApi.login({
          email,
          password,
        });

        if (!error) {
          AuthHelper.setAuthToken(data.token); // Simpan token
          alert("Login berhasil!");
          window.location.hash = "#/"; // Pindahkan ke Halaman Home
          window.location.reload(); // Reload untuk refresh state (navigasi, dll)
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("Terjadi kesalahan saat login.");
      }
    });
  }
}
