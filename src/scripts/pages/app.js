import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import * as AuthHelper from "../utils/auth-helper.js";

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

    this.#content.innerHTML = await page.render();
    await page.afterRender();
  }
}

export default App;
