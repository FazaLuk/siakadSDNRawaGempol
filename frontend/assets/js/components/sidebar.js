import { getGuruInfo, getRole, resolveWaliKelasClassId } from "../modules/auth.js";
import { kelas, KELAS_DATA_CHANGED_EVENT } from "../modules/kelas.js";

const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".sidebar-overlay");
const toggleBtn = document.querySelector(".toggle-sidebar-btn");
const menuLinks = document.querySelectorAll(".sidebar-menu a");
const closeBtn = document.querySelector(".sidebar-close-btn");

const role = getRole();
const allowedPathsForWaliKelas = [
  "index.html",
  "siswa.html",
  "nilai.html",
  "kehadiran.html",
  "spk-bantuan.html",
  "laporan.html",
  "#",
];

const mobileSidebarQuery = window.matchMedia("(max-width: 992px)");

function isMobileSidebar() {
  return mobileSidebarQuery.matches;
}

function applyRoleMenuRules() {
  const profileName = document.querySelector(".sidebar-profile h5");
  const profileRole = document.querySelector(".sidebar-profile p");
  const sidebarHeader = document.querySelector(".sidebar-header h4");

  if (role !== "wali_kelas") {
    return;
  }

  menuLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const target = href.split("/").pop().split("?")[0];

    if (href.trim() === "#" || allowedPathsForWaliKelas.includes(target)) {
      return;
    }

    const listItem = link.closest("li");
    if (listItem) {
      listItem.style.display = "none";
    }
  });

  const { guruName } = getGuruInfo();
  const classId = resolveWaliKelasClassId();
  const className =
    kelas.find((item) => Number(item.id) === Number(classId))?.name || "";

  if (profileName) {
    profileName.textContent = guruName || "Wali Kelas";
  }

  if (profileRole) {
    profileRole.textContent = className ? `Wali ${className}` : "Wali Kelas";
  }

  if (sidebarHeader) {
    sidebarHeader.textContent = "SIAKAD Wali";
  }
}

function openSidebar() {
  if (!sidebar) return;

  if (isMobileSidebar()) {
    sidebar.classList.add("active");
    overlay?.classList.add("active");
    return;
  }

  document.body.classList.remove("sidebar-collapsed");
}

function closeSidebar() {
  if (!sidebar) return;

  if (isMobileSidebar()) {
    sidebar.classList.remove("active");
    overlay?.classList.remove("active");
    return;
  }

  document.body.classList.add("sidebar-collapsed");
}

function toggleSidebar() {
  if (!sidebar) return;

  if (isMobileSidebar()) {
    const willOpen = !sidebar.classList.contains("active");

    if (willOpen) {
      openSidebar();
      return;
    }

    closeSidebar();
    return;
  }

  document.body.classList.toggle("sidebar-collapsed");
}

if (sidebar && toggleBtn) {
  toggleBtn.addEventListener("click", toggleSidebar);

  overlay?.addEventListener("click", closeSidebar);

  closeBtn?.addEventListener("click", closeSidebar);

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (!isMobileSidebar()) return;

      closeSidebar();
    });
  });

  mobileSidebarQuery.addEventListener("change", () => {
    sidebar.classList.remove("active");
    overlay?.classList.remove("active");
    document.body.classList.remove("sidebar-collapsed");
  });

  applyRoleMenuRules();
  window.addEventListener(KELAS_DATA_CHANGED_EVENT, applyRoleMenuRules);
}
