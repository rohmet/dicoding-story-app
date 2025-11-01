export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Fungsi utama untuk mengambil dan menampilkan data.
   * Dipanggil oleh View.
   */
  async displayStoriesAndMap() {
    this.#view.showLoading();

    try {
      const stories = await this.#model.getAllStories();

      if (stories.length === 0) {
        this.#view.showEmptyStories();
      } else {
        this.#view.populateStoriesAndMap(stories);
      }
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
