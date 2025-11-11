import BookmarkPresenter from "./bookmark-presenter.js";
import Database from "../../data/database.js";

export default class BookmarkPage {
  #presenter = null;

  async render() {
    return `
      <section class="container">
        <h1>Bookmarks</h1>
        <p>Daftar story yang Anda simpan secara offline.</p>
        
        <div class="search-container">
          <input id="search-input" type="search" placeholder="Cari berdasarkan nama atau deskripsi...">
        </div>
        
        <div id="loader-container" style="display: none;"></div>
        <div id="story-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });

    await this.#presenter.displaySavedStories();

    const searchInput = document.querySelector("#search-input");
    searchInput.addEventListener("keyup", (event) => {
      const query = event.target.value;
      this.#presenter.searchStories(query);
    });
  }

  /**
   * PRESENTER COMMAND: Tampilkan List Story (dan Tombol Delete)
   */
  populateStoriesList(stories) {
    const storyListContainer = document.querySelector("#story-list");
    storyListContainer.innerHTML = "";

    stories.forEach((story) => {
      const storyElement = document.createElement("div");
      storyElement.classList.add("story-item");

      // Render HTML, mirip home-page.js tapi dengan tombol HAPUS
      storyElement.innerHTML = `
        <img src="${story.photoUrl}" alt="Story oleh ${story.name}">
        <h3>${story.name}</h3>
        <p class="story-date">${new Date(
          story.createdAt
        ).toLocaleDateString()}</p>
        <p>${story.description}</p>
        <button class="btn btn-danger delete-button" data-id="${story.id}">
          <i class="fa-solid fa-trash"></i> Hapus
        </button>
      `;
      storyListContainer.appendChild(storyElement);
    });

    // Tambahkan event listener untuk semua tombol hapus
    storyListContainer.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation(); // Hentikan event agar tidak memicu klik lain
        const storyId = event.target.dataset.id;
        this.#presenter.removeStory(storyId);
      });
    });
  }

  // --- Metode helper lainnya ---
  showEmptyStories() {
    document.querySelector("#story-list").innerHTML =
      "<p>Tidak ada story yang Anda simpan.</p>";
  }

  showEmptySearchResults() {
    document.querySelector("#story-list").innerHTML =
      "<p>Tidak ada story yang cocok dengan pencarian Anda.</p>";
  }

  showError(message) {
    document.querySelector(
      "#story-list"
    ).innerHTML = `<p>Gagal memuat data. (Error: ${message})</p>`;
  }

  showLoading() {
    document.querySelector("#loader-container").style.display = "flex";
  }

  hideLoading() {
    document.querySelector("#loader-container").style.display = "none";
  }
}
