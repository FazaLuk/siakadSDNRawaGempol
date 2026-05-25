import {
  isAuthenticated,
  login,
  loginAsGuruUser,
  resolveClassIdForGuru,
} from "../modules/auth.js";
import { getGuruByUsername, isHomeroomGuru } from "../modules/guru.js";
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

  if (!isHomeroomGuru(guru)) {
    return "Akun guru ini bukan wali kelas. Periksa role/jenis guru di Data Guru.";
  }

  if (!String(guru.username || "").trim()) {
    return "Username login belum diisi pada data guru.";
  }

  return "Login gagal. Pastikan guru sudah di-assign sebagai wali di Data Kelas.";
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const role = roleSelect.value;

  let loginSuccess = false;

  if (role === "wali_kelas") {
    const guru = getGuruByUsername(username);

    if (
      guru &&
      String(guru.password || "").trim() === password &&
      isHomeroomGuru(guru) &&
      String(guru.username || "").trim()
    ) {
      const classId = resolveClassIdForGuru(guru);

      loginSuccess = loginAsGuruUser(guru.id, guru.name, "wali_kelas", classId);
    }

    if (!loginSuccess) {
      showToast({
        type: "warning",
        title: "Login gagal",
        message: getLoginErrorMessage(role, username, password, guru),
      });
      return;
    }
  } else {
    loginSuccess = login(username, password, role);
  }

  if (loginSuccess) {
    window.location.href = "./index.html";
    return;
  }

  showToast({
    type: "warning",
    title: "Login gagal",
    message: getLoginErrorMessage(role, username, password, null),
  });
});
