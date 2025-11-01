import HomePresenter from "./home-presenter.js";
import * as DicodingStoryApi from "../../data/api.js";
import Map from "../../utils/map.js";
import "leaflet/dist/leaflet.css";

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section class="container">
        <h2>Daftar Story</h2>
        
        <div id="map-container" style="height: 400px; width: 100%; margin-bottom: 20px; position: relative;">
          <div id="map-loader-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #eee; display: flex; align-items: center; justify-content: center; z-index: 1000;">
          </div>
        </div>
        
        <div id="loader-container"></div>
        
        <div id="story-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: DicodingStoryApi,
    });

    await this.#presenter.displayStoriesAndMap();
  }

  // --- Metode-metode ini dipanggil oleh Presenter ---

  /**
   * PRESENTER COMMAND: Inisialisasi Peta
   */
  async initialMap() {
    try {
      this.#map = await Map.build("#map-container");
    } catch (error) {
      console.error("Gagal menginisialisasi peta:", error);
      // Tampilkan error di dalam map-loader-container
      document.querySelector(
        "#map-loader-container"
      ).innerHTML = `<p>Gagal memuat peta: ${error.message}</p>`;
    }
  }

  /**
   * PRESENTER COMMAND: Tampilkan List Story (dan Marker Peta)
   */
  populateStoriesList(stories) {
    const storyListContainer = document.querySelector("#story-list");
    storyListContainer.innerHTML = "";

    stories.forEach((story) => {
      // --- Bagian 1: Render List Story ---
      const storyElement = document.createElement("div");
      storyElement.classList.add("story-item");
      storyElement.innerHTML = `
        <img src="${story.photoUrl}" alt="Story oleh ${story.name}">
        <h3>${story.name}</h3>
        <p class="story-date">${new Date(
          story.createdAt
        ).toLocaleDateString()}</p>
        <p>${story.description}</p>
      `;
      storyListContainer.appendChild(storyElement);

      // --- Bagian 2: Render Marker di Peta ---
      if (this.#map && story.lat && story.lon) {
        this.#map.addMarker(
          [story.lat, story.lon],
          {},
          {
            content: `<b>${story.name}</b><br>${story.description.substring(
              0,
              30
            )}...`,
          }
        );
      }
    });
  }

  showEmptyStories() {
    document.querySelector("#story-list").innerHTML =
      "<p>Tidak ada story untuk ditampilkan.</p>";
  }

  showError(message) {
    document.querySelector(
      "#story-list"
    ).innerHTML = `<p>Gagal memuat data. (Error: ${message})</p>`;
  }

  showLoading() {
    document.querySelector("#loader-container").innerHTML =
      "<p>Memuat data story...</p>";
  }

  hideLoading() {
    document.querySelector("#loader-container").innerHTML = "";
  }

  showMapLoading() {
    document.querySelector("#map-loader-container").innerHTML =
      "<p>Memuat peta...</p>";
    document.querySelector("#map-loader-container").style.display = "flex";
  }

  hideMapLoading() {
    document.querySelector("#map-loader-container").style.display = "none";
  }
}
