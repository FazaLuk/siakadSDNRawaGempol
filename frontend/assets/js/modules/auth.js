/* =========================
   SIMPLE AUTH SESSION
========================== */

import { getKelasIdByGuruId, linkGuruToKelasByName } from "./kelas.js";
import { getGuruById } from "./guru.js";

export const AUTH_STORAGE_KEY = "siakad_auth";
export const ROLE_STORAGE_KEY = "siakad_role";
export const LEGACY_ROLE_STORAGE_KEY = "role";
export const HOMEROOM_CLASS_STORAGE_KEY = "siakad_homeroom_class";
export const LEGACY_HOMEROOM_CLASS_STORAGE_KEY = "kelas_id";
export const GURU_ID_STORAGE_KEY = "siakad_guru_id";
export const GURU_NAME_STORAGE_KEY = "siakad_guru_name";
export const LEGACY_GURU_NAME_STORAGE_KEY = "guru_nama";

const AUTH_SESSION_VALUE = "logged_in";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

function getLoginPath() {
  return window.location.pathname.includes("/pages/")
    ? "../login.html"
    : "./login.html";
}

export function isAuthenticated() {
  return localStorage.getItem(AUTH_STORAGE_KEY) === AUTH_SESSION_VALUE;
}

export function getRole() {
  const role = localStorage.getItem(ROLE_STORAGE_KEY);
  if (role) return role;

  const legacyRole = localStorage.getItem(LEGACY_ROLE_STORAGE_KEY);
  if (legacyRole) {
    localStorage.setItem(ROLE_STORAGE_KEY, legacyRole);
    return legacyRole;
  }

  return "admin";
}

export function setRole(role) {
  localStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function getWaliKelasClassId() {
  const storedClassId = Number(
    localStorage.getItem(HOMEROOM_CLASS_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_HOMEROOM_CLASS_STORAGE_KEY),
  );

  if (Number.isFinite(storedClassId) && storedClassId > 0) {
    if (!localStorage.getItem(HOMEROOM_CLASS_STORAGE_KEY)) {
      localStorage.setItem(HOMEROOM_CLASS_STORAGE_KEY, String(storedClassId));
    }
    return storedClassId;
  }

  return null;
}

export function setWaliKelasClassId(classId) {
  if (!classId) return;

  localStorage.setItem(HOMEROOM_CLASS_STORAGE_KEY, String(classId));
  localStorage.setItem(LEGACY_HOMEROOM_CLASS_STORAGE_KEY, String(classId));
}

export { getKelasIdByGuruId };

export function resolveClassIdForGuru(guru) {
  if (!guru) return null;

  return (
    getKelasIdByGuruId(guru.id) ||
    linkGuruToKelasByName(guru) ||
    getWaliKelasClassId()
  );
}

export function resolveWaliKelasClassId() {
  if (getRole() !== "wali_kelas") return null;

  const { guruId } = getGuruInfo();
  const guru = getGuruById(guruId);
  const classFromGuru =
    getKelasIdByGuruId(guruId) ||
    (guru ? linkGuruToKelasByName(guru) : null);
  const classId = classFromGuru || getWaliKelasClassId();

  if (classId) {
    setWaliKelasClassId(classId);
  }

  return classId || null;
}

export function isWaliKelasUser() {
  return getRole() === "wali_kelas" && Boolean(resolveWaliKelasClassId());
}

export function login(username, password, role = "admin") {
  let isValidCredential = false;

  if (role === "admin") {
    isValidCredential =
      username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  }

  if (!isValidCredential) return false;

  localStorage.setItem(AUTH_STORAGE_KEY, AUTH_SESSION_VALUE);
  setRole(role);

  return true;
}

export function loginAsGuruUser(guruId, guruName, guruRole, classId = null) {
  if (!guruRole || guruRole === "guru") return false;

  localStorage.setItem(AUTH_STORAGE_KEY, AUTH_SESSION_VALUE);
  setRole(guruRole);
  setGuruInfo(guruId, guruName);

  if (guruRole === "wali_kelas" && classId) {
    setWaliKelasClassId(classId);
  }

  return true;
}

export function setGuruInfo(guruId, guruName) {
  if (guruId) {
    localStorage.setItem(GURU_ID_STORAGE_KEY, String(guruId));
  }
  if (guruName) {
    localStorage.setItem(GURU_NAME_STORAGE_KEY, guruName);
    localStorage.setItem(LEGACY_GURU_NAME_STORAGE_KEY, guruName);
  }
}

export function getGuruInfo() {
  const guruId = Number(localStorage.getItem(GURU_ID_STORAGE_KEY)) || null;
  const guruName =
    localStorage.getItem(GURU_NAME_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_GURU_NAME_STORAGE_KEY) ||
    null;

  return { guruId, guruName };
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
  localStorage.removeItem(HOMEROOM_CLASS_STORAGE_KEY);
  localStorage.removeItem(LEGACY_HOMEROOM_CLASS_STORAGE_KEY);
  localStorage.removeItem(GURU_ID_STORAGE_KEY);
  localStorage.removeItem(GURU_NAME_STORAGE_KEY);
  localStorage.removeItem(LEGACY_GURU_NAME_STORAGE_KEY);
  window.location.href = getLoginPath();
}

export function requireAuth() {
  if (isAuthenticated()) return;

  window.location.href = getLoginPath();
}

export function enforceRoleAccess() {
  const role = getRole();
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const allowedPages = [
    "index.html",
    "siswa.html",
    "nilai.html",
    "kehadiran.html",
    "spk-bantuan.html",
    "laporan.html",
    "",
  ];

  if (role !== "wali_kelas") return;

  if (!allowedPages.includes(currentFile)) {
    const redirectPath = window.location.pathname.includes("/pages/")
      ? "../index.html"
      : "./index.html";
    window.location.href = redirectPath;
  }
}

export function initAuthControls() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", logout);
  });
}
