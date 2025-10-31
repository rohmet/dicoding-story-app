export default class AddStoryPage {
  async render() {
    return `
      <section class="container">
        <h2>Add New Story</h2>
        <p>Ini adalah halaman untuk menambah story baru.</p>
        </section>
    `;
  }

  async afterRender() {
    // Fungsi ini akan dipanggil setelah render()
  }
}
