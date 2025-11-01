import Config from "../config";
import AuthHelper from "../utils/auth-helper.js";

const API_ENDPOINT = {
  // API_ENDPOINT: `${CONFIG.BASE_URL}/your/endpoint/here`,
  REGISTER: `${Config.BASE_URL}/register`,
  LOGIN: `${Config.BASE_URL}/login`,
  GET_ALL_STORIES: `${Config.BASE_URL}/stories`,
  ADD_NEW_STORY: `${Config.BASE_URL}/stories`,
};

// export async function getData() {
//   const fetchResponse = await fetch(ENDPOINTS.ENDPOINT);
//   return await fetchResponse.json();
// }

const DicodingStoryApi = {
  async register({ name, email, password }) {
    const response = await fetch(API_ENDPOINT.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const responseJson = await response.json();

    if (responseJson.error) {
      alert(responseJson.message);
      return { error: true };
    }

    return { error: false };
  },

  async login({ email, password }) {
    const response = await fetch(API_ENDPOINT.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const responseJson = await response.json();

    if (responseJson.error) {
      alert(responseJson.message);
      return { error: true, data: null };
    }

    return { error: false, data: responseJson.loginResult };
  },

  async getAllStories() {
    const token = AuthHelper.getAuthToken(); // Ambil token
    if (!token) {
      alert("Anda harus login untuk melihat data.");
      window.location.hash = "#/login";
      return null;
    }

    const response = await fetch(API_ENDPOINT.GET_ALL_STORIES, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Sertakan token di header
      },
    });

    const responseJson = await response.json();

    if (responseJson.error) {
      alert(responseJson.message);
      return { error: true, data: [] };
    }

    return { error: false, data: responseJson.listStory };
  },

  async addNewStory({ description, photo, lat, lon }) {
    const token = AuthHelper.getAuthToken();
    if (!token) {
      alert("Anda harus login untuk menambah story.");
      return { error: true, message: "Token tidak ditemukan" };
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    formData.append("lat", lat);
    formData.append("lon", lon);

    const response = await fetch(API_ENDPOINT.ADD_NEW_STORY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type': 'multipart/form-data' JANGAN DITAMBAHKAN
        // Biarkan browser yang mengaturnya secara otomatis
        // agar 'boundary' ter-generate dengan benar.
      },
      body: formData,
    });

    const responseJson = await response.json();

    if (responseJson.error) {
      alert(responseJson.message);
      return { error: true };
    }

    return { error: false };
  },
};

export default DicodingStoryApi;
