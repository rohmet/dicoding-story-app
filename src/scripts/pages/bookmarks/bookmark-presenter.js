export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Mengambil dan menampilkan semua story yang disimpan
   */
  async displaySavedStories() {
    this.#view.showLoading();
    try {
      const stories = await this.#model.getAllStories();
      if (stories.length === 0) {
        this.#view.showEmptyStories();
      } else {
        this.#view.populateStoriesList(stories);
      }
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  /**
   * Menghapus story dari database
   */
  async removeStory(id) {
    try {
      await this.#model.removeStory(id);
      alert("Story berhasil dihapus.");
      await this.displaySavedStories();
    } catch (error) {
      alert(`Gagal menghapus story: ${error.message}`);
    }
  }
}
