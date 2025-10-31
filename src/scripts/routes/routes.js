import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/login/login-page.js";
import RegisterPage from "../pages/register/register-page.js";
import AddStoryPage from "../pages/add-story/add-story-page.js";

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add-story": new AddStoryPage(),
};

export default routes;
