const ACCESS_TOKEN_KEY = "authToken";

/**
 * Mengambil Access Token dari localStorage.
 * Dibungkus try...catch untuk keamanan.
 */
export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken === "null" || accessToken === "undefined") {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error("getAccessToken: error:", error);
    return null;
  }
}

/**
 * Menyimpan Access Token ke localStorage.
 * Dibungkus try...catch untuk keamanan.
 */
export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("putAccessToken: error:", error);
    return false;
  }
}

/**
 * Menghapus Access Token dari localStorage.
 * Dibungkus try...catch untuk keamanan.
 */
export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error("removeAccessToken: error:", error);
    return false;
  }
}

/**
 * Fungsi helper untuk proses logout.
 */
export function getLogout() {
  removeAccessToken();
}

/**
 * Memeriksa apakah pengguna sudah login.
 * Ini adalah pengganti 'isUserLoggedIn()'
 */
export function isUserLoggedIn() {
  return !!getAccessToken();
}

const unauthenticatedRoutesOnly = ["#/login", "#/register"];

/**
 * Penjaga rute: Hanya untuk halaman yang tidak terautentikasi.
 * Jika pengguna sudah login dan mencoba mengakses /login,
 * mereka akan dilempar ke halaman utama.
 */
export function checkUnauthenticatedRouteOnly(page) {
  const url = window.location.hash;
  const isLogin = isUserLoggedIn();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = "/";
    return null;
  }

  return page;
}

/**
 * Penjaga rute: Hanya untuk halaman yang terautentikasi.
 * Jika pengguna belum login dan mencoba mengakses halaman yang dilindungi,
 * mereka akan dilempar ke halaman /login.
 */
export function checkAuthenticatedRoute(page) {
  const isLogin = isUserLoggedIn();

  if (!isLogin) {
    location.hash = "/login";
    return null;
  }

  return page;
}
