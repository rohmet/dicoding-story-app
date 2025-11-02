import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import * as AuthHelper from "../utils/auth-helper.js";
import { transitionHelper } from "../utils/index.js";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  /**
   * FUNGSI: Memperbarui link di navigasi berdasarkan status login
   */
  _updateNavigationLinks() {
    const isLoggedIn = AuthHelper.isUserLoggedIn();

    // 1. Buat elemen <ul> baru
    const navList = document.createElement("ul");
    navList.id = "nav-list";
    navList.className = "nav-list"; // Ini adalah class PENTING yg dicari CSS

    // 2. Isi <ul> dengan <li> dan <a> yang benar
    if (isLoggedIn) {
      navList.innerHTML = `
        <li><a href="#/">Home</a></li>
        <li><a href="#/add-story">Tambah Story</a></li>
        <li><a href="#" id="logout-button">Logout</a></li>
      `;
    } else {
      navList.innerHTML = `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Register</a></li>
      `;
    }

    // 3. Kosongkan <nav> dan masukkan <ul> baru ke dalamnya
    this.#navigationDrawer.innerHTML = "";
    this.#navigationDrawer.appendChild(navList);

    // 4. Tambahkan event listener untuk tombol logout (kode Anda sebelumnya sudah benar)
    const logoutButton = this.#navigationDrawer.querySelector("#logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        AuthHelper.getLogout();
        window.location.hash = "#/login";

        // Panggil fungsi ini lagi untuk me-refresh tampilan nav
        this._updateNavigationLinks();
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    const isLoggedIn = AuthHelper.isUserLoggedIn();

    const protectedPages = ["/", "/add-story"];
    const guestPages = ["/login", "/register"];

    if (isLoggedIn && guestPages.includes(url)) {
      window.location.hash = "#/";
      return;
    }

    if (!isLoggedIn && protectedPages.includes(url)) {
      window.location.hash = "#/login";
      return;
    }

    this._updateNavigationLinks();

    this.#content.innerHTML = await page.render();
    await page.afterRender();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      },
    });

    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
      // this.#setupNavigationList();
    });
  }
}

export default App;
