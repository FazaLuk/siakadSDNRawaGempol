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

requireAuth();

if (getRole() === "wali_kelas") {
  resolveWaliKelasClassId();
}

enforceRoleAccess();
initAuthControls();

console.log("Global app connected");
