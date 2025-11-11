export default class BookmarkPresenter {
  #view;
  #model;
  #allStories = [];

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

      this.#allStories = stories;
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

  /**
   * Mem-filter dan menampilkan story berdasarkan query
   */
  searchStories(query) {
    const lowerCaseQuery = query.toLowerCase();

    const filteredStories = this.#allStories.filter((story) => {
      const nameMatch = story.name.toLowerCase().includes(lowerCaseQuery);
      const descMatch = story.description
        .toLowerCase()
        .includes(lowerCaseQuery);
      return nameMatch || descMatch;
    });

    if (filteredStories.length === 0) {
      if (lowerCaseQuery !== "" && this.#allStories.length > 0) {
        this.#view.showEmptySearchResults();
      } else if (this.#allStories.length === 0) {
        this.#view.showEmptyStories();
      } else {
        this.#view.populateStoriesList(this.#allStories);
      }
    } else {
      this.#view.populateStoriesList(filteredStories);
    }
  }
}
