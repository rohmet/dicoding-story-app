import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import AuthHelper from "../utils/auth-helper.js";

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

  async renderPage() {
    // Dapatkan URL aktif dulu
    const url = getActiveRoute();
    const page = routes[url];

    // Cek status login
    const isLoggedIn = AuthHelper.isUserLoggedIn();

    // Halaman yang perlu login dan untuk guest
    const protectedPages = ["/", "/add-story"];
    const guestPages = ["/login", "/register"];

    // Redirect logic
    if (isLoggedIn && guestPages.includes(url)) {
      // Sudah login tapi akses login/register → pindah ke home
      window.location.hash = "#/";
      return;
    }

    if (!isLoggedIn && protectedPages.includes(url)) {
      // Belum login tapi akses home/add → pindah ke login
      window.location.hash = "#/login";
      return;
    }

    // Kalau lolos semua, baru render halaman
    this.#content.innerHTML = await page.render();
    await page.afterRender();
  }
}

export default App;
