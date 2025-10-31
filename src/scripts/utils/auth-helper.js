const AuthHelper = {
  // Simpan token ke sessionStorage
  setAuthToken(token) {
    sessionStorage.setItem("authToken", token);
  },

  // Ambil token dari sessionStorage
  getAuthToken() {
    return sessionStorage.getItem("authToken");
  },

  // Hapus token (untuk logout)
  removeAuthToken() {
    sessionStorage.removeItem("authToken");
  },

  // Cek apakah pengguna sudah login
  isUserLoggedIn() {
    return !!this.getAuthToken();
  },
};

export default AuthHelper;
