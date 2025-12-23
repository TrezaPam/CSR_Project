import axios from "axios";

// URL dasar untuk endpoint otentikasi di backend Anda
const API_URL = "http://localhost:5000/api/auth/";

/**
 * Class ini mengelola semua logika otentikasi: login, logout, dan data pengguna.
 */
class AuthService {
  /**
   * Mengirim kredensial ke backend untuk login.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<object>} Data pengguna dan token jika berhasil.
   */
  async login(username, password) {
    try {
      const response = await axios.post(API_URL + "login", {
        username,
        password,
      });

      // Jika backend memberikan token, simpan di Local Storage
      if (response.data.token) {
        localStorage.setItem("admin_token", response.data.token);
        localStorage.setItem("admin_user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      // Lemparkan pesan error dari backend agar bisa ditampilkan di halaman login
      throw error.response?.data || new Error("Terjadi kesalahan pada server");
    }
  }

  /**
   * Menghapus data sesi dari Local Storage.
   */
  logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }

  /**
   * Mengambil data pengguna yang tersimpan di Local Storage.
   * @returns {object|null} Objek data pengguna atau null jika tidak ada.
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("admin_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      // Jika data user rusak, hapus data sesi yang salah
      this.logout();
      return null;
    }
  }
}

// Ekspor sebagai instance tunggal agar bisa digunakan di seluruh aplikasi
export default new AuthService();
