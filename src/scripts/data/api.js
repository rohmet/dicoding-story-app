import Config from "../config";

const API_ENDPOINT = {
  // API_ENDPOINT: `${CONFIG.BASE_URL}/your/endpoint/here`,
  REGISTER: `${Config.BASE_URL}/register`,
  LOGIN: `${Config.BASE_URL}/login`,
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
};

export default DicodingStoryApi;
