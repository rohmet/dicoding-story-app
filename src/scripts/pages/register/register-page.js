import DicodingStoryApi from "../../data/api.js";

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h2>Register Page</h2>
        
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
          <button type="submit">Register</button>
        </form>
        
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.querySelector("#register-form");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = event.target.elements.name.value;
      const email = event.target.elements.email.value;
      const password = event.target.elements.password.value;

      try {
        const { error } = await DicodingStoryApi.register({
          name,
          email,
          password,
        });

        if (!error) {
          alert("Registrasi berhasil! Silakan login.");
          window.location.hash = "#/login"; // Pindahkan ke halaman login
        }
      } catch (error) {
        console.error("Error during registration:", error);
        alert("Terjadi kesalahan saat registrasi.");
      }
    });
  }
}
