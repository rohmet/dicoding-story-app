export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  /**
   * Fungsi Orkestrasi untuk memuat Peta
   * Dipanggil secara internal oleh displayStoriesAndMap
   */
  async #showStoriesMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showStoriesMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  /**
   * Fungsi Orkestrasi Utama
   * Dipanggil oleh View saat afterRender.
   */
  async displayStoriesAndMap() {
    this.#view.showLoading();

    this.#showStoriesMap();

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
}
