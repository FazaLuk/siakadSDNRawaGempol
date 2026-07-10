/* =========================
   GLOBAL COMPONENTS
========================== */

import "./components/sidebar.js";
import "./components/navbarDate.js";
import {
  initAuthControls,
  requireAuth,
  enforceRoleAccess,
  resolveWaliKelasClassId,
  getRole,
} from "./modules/auth.js";
import { loadGuruData } from "./modules/guru.js";
import { loadKelasData } from "./modules/kelas.js";

requireAuth();

try {
  await loadGuruData();
  await loadKelasData();

  if (getRole() === "wali_kelas") {
    resolveWaliKelasClassId();
  }

  enforceRoleAccess();
  initAuthControls();
} catch (error) {
  console.error("Gagal memuat data global", error);
  enforceRoleAccess();
  initAuthControls();
}

console.log("Global app connected");
