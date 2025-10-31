export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <h2>Login Page</h2>
        <p>Ini adalah halaman login.</p>
        </section>
    `;
  }

  async afterRender() {
    // Fungsi ini akan dipanggil setelah render()
    // Kita akan tambahkan event listener form di sini nanti
  }
}
