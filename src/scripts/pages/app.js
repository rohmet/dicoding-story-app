import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import * as AuthHelper from "../utils/auth-helper.js";
import { transitionHelper } from "../utils/index.js";
// import { subscribe } from "../utils/notification-helper";
import {
  subscribe,
  unsubscribe,
  isCurrentPushSubscriptionAvailable,
} from "../utils/notification-helper";

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

    const navList = document.createElement("ul");
    navList.id = "nav-list";
    navList.className = "nav-list";

    if (isLoggedIn) {
      navList.innerHTML = `
        <li><a href="#/">Home</a></li>
        <li><a href="#/add-story">Tambah Story</a></li>
        <li><a href="#/bookmarks">Bookmarks</a></li> 
        <li><a href="#" id="logout-button">Logout</a></li>
      `;
    } else {
      navList.innerHTML = `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Register</a></li>
      `;
    }

    this.#navigationDrawer.innerHTML = "";
    this.#navigationDrawer.appendChild(navList);

    const logoutButton = this.#navigationDrawer.querySelector("#logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        AuthHelper.getLogout();
        window.location.hash = "#/login";

        this._updateNavigationLinks();
      });
    }
  }

  /**
   * Mengatur tombol push notification
   */
  async #setupPushNotificationToggleButton() {
    const isLoggedIn = AuthHelper.isUserLoggedIn();
    if (isLoggedIn) {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      this.#renderPushNotificationButton(isSubscribed);
    } else {
      // Kosongkan tombol jika tidak login
      const buttonContainer = document.getElementById(
        "push-notification-tools"
      );
      buttonContainer.innerHTML = "";
    }
  }

  /**
   * Merender tombol berdasarkan status subskripsi
   */
  #renderPushNotificationButton(isSubscribed) {
    const buttonContainer = document.getElementById("push-notification-tools");

    if (isSubscribed) {
      buttonContainer.innerHTML = `
        <button id="unsubscribe-button" class="btn btn-danger" aria-label="Berhenti berlangganan notifikasi">
          <i class="fa-solid fa-bell-slash"></i> Unsubscribe
        </button>
      `;
      buttonContainer
        .querySelector("#unsubscribe-button")
        .addEventListener("click", this.#onUnsubscribeButtonClick.bind(this));
    } else {
      buttonContainer.innerHTML = `
        <button id="subscribe-button" class="btn" aria-label="Berlangganan notifikasi">
          <i class="fa-solid fa-bell"></i> Subscribe
        </button>
      `;
      buttonContainer
        .querySelector("#subscribe-button")
        .addEventListener("click", this.#onSubscribeButtonClick.bind(this));
    }
  }

  /**
   * Handler untuk tombol subscribe
   */
  async #onSubscribeButtonClick(event) {
    event.target.disabled = true; // Nonaktifkan tombol sementara
    event.target.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';

    await subscribe();

    // Render ulang tombol dengan status baru
    await this.#setupPushNotificationToggleButton();
  }

  /**
   * Handler untuk tombol unsubscribe
   */
  async #onUnsubscribeButtonClick(event) {
    event.target.disabled = true; // Nonaktifkan tombol sementara
    event.target.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';

    await unsubscribe();

    // Render ulang tombol dengan status baru
    await this.#setupPushNotificationToggleButton();
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
    await this.#setupPushNotificationToggleButton();

    // this.#content.innerHTML = await page.render();
    // await page.afterRender();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      },
    });

    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
    });
  }
}

export default App;
