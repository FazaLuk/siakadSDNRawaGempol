import {
  isAuthenticated,
  login,
} from "../modules/auth.js";
import { findGuruByUsername } from "../services/authService.js";
import { showToast } from "../modules/toast.js";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const roleSelect = document.getElementById("roleSelect");

if (isAuthenticated()) {
  window.location.href = "./index.html";
}

function getLoginErrorMessage(role, username, password, guru) {
  if (role === "admin") {
    return "Username atau password admin salah. Gunakan admin / admin123.";
  }

  if (!username || !password) {
    return "Username dan password wajib diisi.";
  }

  if (!guru) {
    return "Username wali kelas tidak ditemukan di data guru.";
  }

  if (String(guru.password || "").trim() !== password.trim()) {
    return "Password tidak sesuai dengan data guru.";
  }

  if (guru.role !== "wali_kelas") {
    return "Akun guru ini bukan wali kelas. Periksa role/jenis guru di Data Guru.";
  }

  if (!String(guru.username || "").trim()) {
    return "Username login belum diisi pada data guru.";
  }

  return "Login gagal. Pastikan guru sudah di-assign sebagai wali di Data Kelas.";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const role = roleSelect.value;

  try {
    if (!username || !password) {
      showToast({
        type: "warning",
        title: "Login gagal",
        message: "Username dan password wajib diisi.",
      });

      return;
    }

    const guru = await findGuruByUsername(username);

    const canLogin =
      guru &&
      String(guru.password || "").trim() === password &&
      String(guru.username || "").trim() &&
      (role === "admin" ? guru.role === "admin" : guru.role === role);

    if (!canLogin) {
      showToast({
        type: "warning",
        title: "Login gagal",
        message: getLoginErrorMessage(role, username, password, guru),
      });
      return;
    }

    const loginSuccess = await login(username, password, role);

    if (loginSuccess) {
      window.location.href = "./index.html";
      return;
    }

    showToast({
      type: "warning",
      title: "Login gagal",
      message: getLoginErrorMessage(role, username, password, null),
    });
  } catch (error) {
    showToast({
      type: "error",
      title: "Login gagal",
      message: error?.message || "Terjadi kesalahan saat login.",
    });
  }
});
