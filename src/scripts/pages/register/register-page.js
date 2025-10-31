export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h2>Register Page</h2>
        <p>Ini adalah halaman register.</p>
        </section>
    `;
  }

  async afterRender() {
    // Fungsi ini akan dipanggil setelah render()
  }
}
