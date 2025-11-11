import Config from "../config";
import * as AuthHelper from "../utils/auth-helper.js";

const ENDPOINTS = {
  REGISTER: `${Config.BASE_URL}/register`,
  LOGIN: `${Config.BASE_URL}/login`,
  GET_ALL_STORIES: `${Config.BASE_URL}/stories`,
  ADD_NEW_STORY: `${Config.BASE_URL}/stories`,

  SUBSCRIBE: `${Config.BASE_URL}/notifications/subscribe`,
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

  if (!response.ok || responseJson.error) {
    throw new Error(responseJson.message || "Registrasi gagal.");
  }

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

  return responseJson.loginResult;
}

/**
 * Fungsi untuk mendapatkan semua stories.
 * Membutuhkan token autentikasi.
 * Mengembalikan array 'listStory' jika sukses.
 * Akan melempar Error jika gagal (termasuk jika token tidak valid).
 */
export async function getAllStories() {
  const token = AuthHelper.getAccessToken();

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

  return responseJson.listStory;
}

/**
 * Fungsi untuk menambah story baru.
 * Membutuhkan token autentikasi.
 * Akan melempar Error jika gagal.
 */
export async function addNewStory({ description, photo, lat, lon }) {
  const token = AuthHelper.getAccessToken();

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);

  const response = await fetch(ENDPOINTS.ADD_NEW_STORY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const responseJson = await response.json();

  if (!response.ok || responseJson.error) {
    throw new Error(responseJson.message || "Gagal menambah story baru.");
  }

  return responseJson;
}

/**
 * Mengirim data subskripsi ke backend
 *
 */
export async function subscribePushNotification({ endpoint, keys }) {
  const token = AuthHelper.getAccessToken();
  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint, keys }),
  });
  return response;
}

/**
 * Menghapus data subskripsi di backend
 */
export async function unsubscribePushNotification({ endpoint }) {
  const token = AuthHelper.getAccessToken();
  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint }),
  });
  return response;
}
