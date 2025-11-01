import Config from "../config";
import AuthHelper from "../utils/auth-helper.js";

// Mengganti nama menjadi ENDPOINTS agar konsisten dengan api-2.js
const ENDPOINTS = {
  REGISTER: `${Config.BASE_URL}/register`,
  LOGIN: `${Config.BASE_URL}/login`,
  GET_ALL_STORIES: `${Config.BASE_URL}/stories`,
  ADD_NEW_STORY: `${Config.BASE_URL}/stories`,
};

/**
 * Fungsi untuk melakukan registrasi pengguna baru.
 * Akan melempar Error jika registrasi gagal.
 */
export async function register({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const responseJson = await response.json();

  // Jika respons tidak ok (HTTP status BUKAN 2xx) atau ada 'error' di body
  if (!response.ok || responseJson.error) {
    // Melempar error agar bisa ditangkap oleh try...catch di UI
    throw new Error(responseJson.message || "Registrasi gagal.");
  }

  // Registrasi sukses, kembalikan respons (mungkin berisi pesan sukses)
  return responseJson;
}

/**
 * Fungsi untuk login pengguna.
 * Mengembalikan data 'loginResult' jika sukses.
 * Akan melempar Error jika login gagal.
 */
export async function login({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const responseJson = await response.json();

  if (!response.ok || responseJson.error) {
    throw new Error(responseJson.message || "Login gagal.");
  }

  // Sukses, kembalikan hanya data yang relevan
  return responseJson.loginResult;
}

/**
 * Fungsi untuk mendapatkan semua stories.
 * Membutuhkan token autentikasi.
 * Mengembalikan array 'listStory' jika sukses.
 * Akan melempar Error jika gagal (termasuk jika token tidak valid).
 */
export async function getAllStories() {
  const token = AuthHelper.getAuthToken();

  // Biarkan server yang memvalidasi token.
  // Jika token null atau tidak valid, server akan merespons 401,
  // yang akan ditangkap oleh '!response.ok'.
  const response = await fetch(ENDPOINTS.GET_ALL_STORIES, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseJson = await response.json();

  if (!response.ok || responseJson.error) {
    throw new Error(responseJson.message || "Gagal mengambil data stories.");
  }

  // Sukses, kembalikan hanya data yang relevan
  return responseJson.listStory;
}

/**
 * Fungsi untuk menambah story baru.
 * Membutuhkan token autentikasi.
 * Akan melempar Error jika gagal.
 */
export async function addNewStory({ description, photo, lat, lon }) {
  const token = AuthHelper.getAuthToken();

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  // Pastikan lat dan lon dikirim jika API memerlukannya (meski kosong)
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);

  const response = await fetch(ENDPOINTS.ADD_NEW_STORY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type': 'multipart/form-data' JANGAN DITAMBAHKAN
    },
    body: formData,
  });

  const responseJson = await response.json();

  if (!response.ok || responseJson.error) {
    throw new Error(responseJson.message || "Gagal menambah story baru.");
  }

  // Sukses, kembalikan respons (mungkin berisi pesan sukses)
  return responseJson;
}
