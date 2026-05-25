console.log("Guru page connected");
import { guru, isHomeroomGuru, saveGuruData } from "../modules/guru.js";
import { kelas } from "../modules/kelas.js";
import { showToast } from "../modules/toast.js";

/* =========================
   ELEMENT
========================== */

const tableBody = document.getElementById("guruTableBody");
const searchInput = document.getElementById("searchGuru");
const filterType = document.getElementById("filterType");
const filterGender = document.getElementById("filterGender");
const pagination = document.getElementById("pagination");
const guruModal = document.getElementById("guruModal");
const guruModalTitle = document.querySelector(".student-modal-header h3");
const guruModalDescription = document.querySelector(".student-modal-header p");
const openGuruModal = document.getElementById("openGuruModal");
const closeModal = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModal = document.getElementById("cancelModal");
const guruDetailModal = document.getElementById("guruDetailModal");
const closeGuruDetailModal = document.getElementById("closeGuruDetailModal");
const closeGuruDetailModalBtn = document.getElementById(
  "closeGuruDetailModalBtn",
);
const closeGuruDetailFooterBtn = document.getElementById(
  "closeGuruDetailFooterBtn",
);
const detailGuruName = document.getElementById("detailGuruName");
const detailGuruNip = document.getElementById("detailGuruNip");
const detailGuruType = document.getElementById("detailGuruType");
const detailGuruSubject = document.getElementById("detailGuruSubject");
const detailGuruGender = document.getElementById("detailGuruGender");
const detailGuruPhone = document.getElementById("detailGuruPhone");
const guruAccountModal = document.getElementById("guruAccountModal");
const closeGuruAccountModal = document.getElementById("closeGuruAccountModal");
const closeGuruAccountModalBtn = document.getElementById(
  "closeGuruAccountModalBtn",
);
const cancelGuruAccountModal = document.getElementById(
  "cancelGuruAccountModal",
);
const accountGuruName = document.getElementById("accountGuruName");
const accountGuruRole = document.getElementById("accountGuruRole");
const accountGuruUsername = document.getElementById("accountGuruUsername");
const accountGuruPassword = document.getElementById("accountGuruPassword");
const accountGuruPasswordConfirm = document.getElementById(
  "accountGuruPasswordConfirm",
);
const saveGuruAccountBtn = document.getElementById("saveGuruAccountBtn");
const resetFilterBtn = document.querySelector(".filter-reset-btn");
const totalGuruCard = document.getElementById("totalGuruCard");
const waliKelasCard = document.getElementById("waliKelasCard");
const guruMapelCard = document.getElementById("guruMapelCard");
const totalMapelCard = document.getElementById("totalMapelCard");

let currentPage = 1;
let selectedGuruId = null;
const rowsPerPage = 5;

/* =========================
   FORM INPUT
========================== */

const guruName = document.getElementById("guruName");
const guruNip = document.getElementById("guruNip");
const guruType = document.getElementById("guruType");
const guruSubjectGroup = document.getElementById("guruSubjectGroup");
const guruSubject = document.getElementById("guruSubject");
const guruGender = document.getElementById("guruGender");
const guruPhone = document.getElementById("guruPhone");
const guruUsername = document.getElementById("guruUsername");
const guruPassword = document.getElementById("guruPassword");
const guruRole = document.getElementById("guruRole");
const saveGuruBtn = document.getElementById("saveGuruBtn");
const nipRules = {
  maxLength: 18,
  pattern: /^\d{18}$/,
};
let nipWarningTimer = null;
let lastNipWarningAt = 0;

function isSubjectTeacher(type) {
  return type === "Guru Mapel" || type === "Wali Kelas & Guru Mapel";
}

function getGuruSubject(item) {
  if (item.subject) {
    return item.subject;
  }

  return "";
}

function getGuruAssignment(item) {
  const subject = getGuruSubject(item);

  return subject || "-";
}

function hasHomeroomRole(item) {
  return isHomeroomGuru(item);
}

function getRoleBadge(role) {
  if (role === "wali_kelas") {
    return `<span class="role-badge role-wali">Wali Kelas</span>`;
  }

  if (role === "admin") {
    return `<span class="role-badge role-admin">Admin</span>`;
  }

  return `<span class="role-badge role-guru">Guru</span>`;
}

function maskPassword(password) {
  return password ? "••••••" : "-";
}

function hasSubjectRole(item) {
  return item.type === "Guru Mapel" || item.type === "Wali Kelas & Guru Mapel";
}

function renderSummaryCards() {
  const subjectSet = new Set();

  guru.forEach((item) => {
    const subject = getGuruSubject(item).trim();

    if (subject) {
      subjectSet.add(subject.toLowerCase());
    }
  });

  totalGuruCard.textContent = guru.length;
  waliKelasCard.textContent = guru.filter(
    (item) => hasHomeroomRole(item) && getKelasUsingGuru(item.id),
  ).length;
  guruMapelCard.textContent = guru.filter(hasSubjectRole).length;
  totalMapelCard.textContent = subjectSet.size;
}

function getKelasUsingGuru(guruId) {
  return kelas.find((item) => Number(item.guruId) === Number(guruId));
}

function migrateGuruClassRelationData() {
  let hasMigratedData = false;

  guru.forEach((item) => {
    if (!Object.prototype.hasOwnProperty.call(item, "homeroomClass")) return;

    delete item.homeroomClass;
    hasMigratedData = true;
  });

  if (hasMigratedData) {
    saveGuruData();
  }
}

function updateGuruFieldVisibility() {
  const showSubject = isSubjectTeacher(guruType.value);
  const isHomeroomType =
    guruType.value === "Wali Kelas" ||
    guruType.value === "Wali Kelas & Guru Mapel";

  guruSubjectGroup.hidden = !showSubject;

  if (!showSubject) {
    guruSubject.value = "";
  }

  if (isHomeroomType) {
    guruRole.value = "wali_kelas";
  } else if (guruType.value === "Guru Mapel") {
    guruRole.value = "guru";
  }
}

/* =========================
   MODAL
========================== */

openGuruModal.addEventListener("click", () => {
  selectedGuruId = null;
  setGuruModalMode("add");
  resetGuruForm();
  guruModal.classList.add("show");
});

function hideModal() {
  guruModal.classList.remove("show");
}

function hideDetailModal() {
  guruDetailModal.classList.remove("show");
}

function resetGuruForm() {
  guruName.value = "";
  guruNip.value = "";
  guruType.value = "";
  guruSubject.value = "";
  guruGender.value = "";
  guruPhone.value = "";
  guruUsername.value = "";
  guruPassword.value = "";
  guruRole.value = "guru";
  updateGuruFieldVisibility();
}

function setGuruModalMode(mode) {
  if (mode === "edit") {
    guruModalTitle.textContent = "Edit Guru";
    guruModalDescription.textContent = "Ubah data guru";
    saveGuruBtn.textContent = "Simpan Perubahan";
    return;
  }

  guruModalTitle.textContent = "Tambah Guru";
  guruModalDescription.textContent = "Tambahkan data guru baru";
  saveGuruBtn.textContent = "Simpan Guru";
}

function fillGuruForm(selectedGuru) {
  guruName.value = selectedGuru.name;
  guruNip.value = selectedGuru.nip;
  guruType.value = selectedGuru.type;
  guruSubject.value = getGuruSubject(selectedGuru);
  guruGender.value = selectedGuru.gender;
  guruPhone.value = selectedGuru.phone || "";
  guruUsername.value = selectedGuru.username || "";
  guruPassword.value = selectedGuru.password || "";
  guruRole.value = selectedGuru.role || "guru";
  updateGuruFieldVisibility();
}

closeModal.addEventListener("click", hideModal);
closeModalBtn.addEventListener("click", hideModal);
cancelModal.addEventListener("click", hideModal);
closeGuruDetailModal.addEventListener("click", hideDetailModal);
closeGuruDetailModalBtn.addEventListener("click", hideDetailModal);
closeGuruDetailFooterBtn.addEventListener("click", hideDetailModal);
closeGuruAccountModal.addEventListener("click", hideAccountModal);
closeGuruAccountModalBtn.addEventListener("click", hideAccountModal);
cancelGuruAccountModal.addEventListener("click", hideAccountModal);
guruType.addEventListener("change", updateGuruFieldVisibility);

function hideAccountModal() {
  guruAccountModal.classList.remove("show");
}

function resetAccountForm() {
  accountGuruName.value = "";
  accountGuruRole.value = "guru";
  accountGuruUsername.value = "";
  accountGuruPassword.value = "";
  accountGuruPasswordConfirm.value = "";
}

function fillAccountForm(selectedGuru) {
  accountGuruName.value = selectedGuru.name;
  accountGuruRole.value = selectedGuru.role || "guru";
  accountGuruUsername.value = selectedGuru.username || "";
  accountGuruPassword.value = "";
  accountGuruPasswordConfirm.value = "";
}

function editGuruAccount(id) {
  const selectedGuru = guru.find((item) => item.id === id);

  if (!selectedGuru) return;

  selectedGuruId = id;
  fillAccountForm(selectedGuru);
  guruAccountModal.classList.add("show");
}

saveGuruAccountBtn.addEventListener("click", () => {
  if (
    !accountGuruUsername.value.trim() ||
    !accountGuruPassword.value ||
    !accountGuruPasswordConfirm.value
  ) {
    showToast({
      type: "error",
      title: "Data belum lengkap",
      message: "Username dan password wajib diisi.",
    });

    return;
  }

  if (accountGuruPassword.value !== accountGuruPasswordConfirm.value) {
    showToast({
      type: "warning",
      title: "Password tidak cocok",
      message: "Password dan konfirmasi password harus sama.",
    });

    return;
  }

  const selectedGuru = guru.find((item) => item.id === selectedGuruId);

  if (selectedGuru) {
    selectedGuru.username = accountGuruUsername.value.trim();
    selectedGuru.password = accountGuruPassword.value;
    selectedGuru.role = hasHomeroomRole(selectedGuru)
      ? "wali_kelas"
      : accountGuruRole.value || "guru";
  }

  saveGuruData();
  filterGuru();
  hideAccountModal();
  selectedGuruId = null;
  resetAccountForm();

  showToast({
    type: "success",
    title: "Akun guru diperbarui",
    message: "Username dan password telah disimpan.",
  });
});

/* =========================
   NIP VALIDATION
========================== */

function sanitizeNip(value) {
  return value.replace(/\D/g, "").slice(0, nipRules.maxLength);
}

function isValidNip(value) {
  return nipRules.pattern.test(value);
}

function isDuplicateNip(value, ignoredId = null) {
  return guru.some((item) => item.nip === value && item.id !== ignoredId);
}

function showNipWarning(message) {
  window.clearTimeout(nipWarningTimer);

  nipWarningTimer = window.setTimeout(() => {
    const now = Date.now();

    if (now - lastNipWarningAt < 1800) return;

    lastNipWarningAt = now;

    showToast({
      type: "warning",
      title: "NIP tidak valid",
      message,
    });
  }, 350);
}

guruNip.addEventListener("beforeinput", (event) => {
  if (!event.data || /^\d+$/.test(event.data)) return;

  event.preventDefault();
  showNipWarning("NIP hanya boleh berisi angka.");
});

guruNip.addEventListener("input", () => {
  const currentValue = guruNip.value;
  const sanitizedValue = sanitizeNip(currentValue);

  guruNip.value = sanitizedValue;

  if (currentValue !== sanitizedValue) {
    showNipWarning("NIP hanya boleh berisi angka dan maksimal 18 digit.");
    return;
  }

  if (sanitizedValue && !isValidNip(sanitizedValue)) {
    showNipWarning("NIP harus tepat 18 digit.");
    return;
  }

  window.clearTimeout(nipWarningTimer);
});

/* =========================
   SAVE GURU
========================== */

saveGuruBtn.addEventListener("click", () => {
  const needsSubject = isSubjectTeacher(guruType.value);

  if (
    !guruName.value ||
    !guruNip.value ||
    !guruType.value ||
    (needsSubject && !guruSubject.value) ||
    !guruGender.value
  ) {
    showToast({
      type: "error",
      title: "Data belum lengkap",
      message:
        "Nama, NIP, jenis guru, isian sesuai jenis guru, dan jenis kelamin wajib diisi.",
    });

    return;
  }

  if (!isValidNip(guruNip.value)) {
    showToast({
      type: "warning",
      title: "NIP tidak valid",
      message: "NIP harus tepat 18 digit angka sebelum data disimpan.",
    });

    return;
  }

  if (isDuplicateNip(guruNip.value, selectedGuruId)) {
    showToast({
      type: "warning",
      title: "NIP sudah digunakan",
      message: "Gunakan NIP lain karena NIP ini sudah terdaftar.",
    });

    return;
  }

  const isEditMode = Boolean(selectedGuruId);
  const selectedGuru = isEditMode
    ? guru.find((item) => item.id === selectedGuruId)
    : null;
  const resolvedRole = hasHomeroomRole({
    type: guruType.value,
    role: guruRole.value,
  })
    ? "wali_kelas"
    : guruRole.value || "guru";

  const guruData = {
    nip: guruNip.value,
    name: guruName.value,
    type: guruType.value,
    subject: needsSubject ? guruSubject.value : "",
    gender: guruGender.value,
    phone: guruPhone.value,
    username: guruUsername.value.trim(),
    password: guruPassword.value || selectedGuru?.password || "",
    role: resolvedRole,
  };

  if (isEditMode) {
    if (selectedGuru) {
      Object.assign(selectedGuru, guruData);
      delete selectedGuru.homeroomClass;
    }
  } else {
    const newGuru = {
      id: Math.max(0, ...guru.map((item) => item.id)) + 1,
      ...guruData,
    };

    guru.unshift(newGuru);
    currentPage = 1;
  }

  saveGuruData();
  renderSummaryCards();
  filterGuru();
  hideModal();

  selectedGuruId = null;
  setGuruModalMode("add");
  resetGuruForm();

  showToast({
    type: "success",
    title: isEditMode ? "Data guru diperbarui" : "Guru berhasil ditambahkan",
    message: `${guruData.name} sudah tersimpan di tabel.`,
  });
});

/* =========================
   RENDER TABLE
========================== */

function renderGuru(data) {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="12" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((item, index) => {
    const isWaliKelas = hasHomeroomRole(item);
    const accountBtn = isWaliKelas
      ? `
      <button class="action-btn btn-account" data-id="${item.id}" type="button" title="Kelola Akun">
        <i class="bi bi-key-fill"></i>
      </button>
    `
      : "";

    tableBody.innerHTML += `
      <tr>
        <td>${start + index + 1}</td>
        <td>
          <div class="student-avatar">
            <i class="bi bi-person-badge-fill"></i>
          </div>
        </td>
        <td>${item.nip}</td>
        <td>${item.name}</td>
        <td>
          <span class="class-badge class-blue">${item.type}</span>
        </td>
        <td>${getGuruAssignment(item)}</td>
        <td>${item.username || "-"}</td>
        <td><span class="password-mask">${maskPassword(item.password)}</span></td>
        <td>${getRoleBadge(item.role || "guru")}</td>
        <td>
          <div class="gender-info">
            ${
              item.gender === "Laki-laki"
                ? `<i class="bi bi-gender-male gender-male-icon"></i>`
                : `<i class="bi bi-gender-female gender-female-icon"></i>`
            }
            ${item.gender}
          </div>
        </td>
        <td>${item.phone}</td>
        <td>
          <div class="table-action">
            <button class="action-btn btn-view" data-id="${item.id}" type="button">
              <i class="bi bi-eye-fill"></i>
            </button>
            <button class="action-btn btn-edit" data-id="${item.id}" type="button">
              <i class="bi bi-pencil-fill"></i>
            </button>
            ${accountBtn}
            <button class="action-btn btn-delete" data-id="${item.id}" type="button">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

/* =========================
   RENDER PAGINATION
========================== */

function renderPagination(data) {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(data.length / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <button
        class="pagination-btn ${currentPage === i ? "active" : ""}"
        data-page="${i}"
      >
        ${i}
      </button>
    `;
  }

  document.querySelectorAll(".pagination-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = Number(button.dataset.page);
      filterGuru();
    });
  });
}

/* =========================
   SEARCH & FILTER
========================== */

searchInput.addEventListener("keyup", () => {
  currentPage = 1;
  filterGuru();
});

filterType.addEventListener("change", () => {
  currentPage = 1;
  filterGuru();
});

filterGender.addEventListener("change", () => {
  currentPage = 1;
  filterGuru();
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterType.value = "";
  filterGender.value = "";
  currentPage = 1;
  filterGuru();
});

function filterGuru() {
  const keyword = searchInput.value.toLowerCase();
  const selectedType = filterType.value;
  const selectedGender = filterGender.value;

  const filtered = guru.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(keyword) ||
      item.nip.toLowerCase().includes(keyword) ||
      String(item.username || "").toLowerCase().includes(keyword) ||
      String(item.role || "").toLowerCase().includes(keyword) ||
      getGuruAssignment(item).toLowerCase().includes(keyword);

    const matchType = !selectedType || item.type === selectedType;
    const matchGender = !selectedGender || item.gender === selectedGender;

    return matchSearch && matchType && matchGender;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderGuru(filtered);
  renderPagination(filtered);
}

/* =========================
   ACTION
========================== */

tableBody.addEventListener("click", (event) => {
  const viewButton = event.target.closest(".btn-view");
  const editButton = event.target.closest(".btn-edit");
  const accountButton = event.target.closest(".btn-account");
  const deleteButton = event.target.closest(".btn-delete");

  if (viewButton) {
    viewGuru(Number(viewButton.dataset.id));
    return;
  }

  if (editButton) {
    editGuru(Number(editButton.dataset.id));
    return;
  }

  if (accountButton) {
    editGuruAccount(Number(accountButton.dataset.id));
    return;
  }

  if (!deleteButton) return;

  deleteGuru(Number(deleteButton.dataset.id));
});

function viewGuru(id) {
  const selectedGuru = guru.find((item) => item.id === id);

  if (!selectedGuru) return;

  detailGuruName.textContent = selectedGuru.name;
  detailGuruNip.textContent = selectedGuru.nip;
  detailGuruType.textContent = selectedGuru.type;
  detailGuruSubject.textContent = getGuruSubject(selectedGuru) || "-";
  detailGuruGender.innerHTML = `
    <div class="gender-info">
      ${
        selectedGuru.gender === "Laki-laki"
          ? `<i class="bi bi-gender-male gender-male-icon"></i>`
          : `<i class="bi bi-gender-female gender-female-icon"></i>`
      }
      ${selectedGuru.gender}
    </div>
  `;
  detailGuruPhone.textContent = selectedGuru.phone || "-";

  guruDetailModal.classList.add("show");
}

function editGuru(id) {
  const selectedGuru = guru.find((item) => item.id === id);

  if (!selectedGuru) return;

  selectedGuruId = id;
  setGuruModalMode("edit");
  fillGuruForm(selectedGuru);
  guruModal.classList.add("show");
}

function deleteGuru(id) {
  const guruIndex = guru.findIndex((item) => item.id === id);

  if (guruIndex === -1) return;

  const selectedGuru = guru[guruIndex];
  const usedKelas = getKelasUsingGuru(id);

  if (usedKelas) {
    showToast({
      type: "warning",
      title: "Guru tidak dapat dihapus",
      message: `${selectedGuru.name} masih digunakan sebagai wali kelas ${usedKelas.name}.`,
    });

    return;
  }

  showToast({
    type: "delete",
    title: "Hapus data guru?",
    message: `${selectedGuru.name} akan dihapus dari tabel.`,
    duration: 0,
    actions: [
      {
        label: "Batal",
        variant: "secondary",
      },
      {
        label: "Hapus",
        variant: "primary",
        onClick: () => {
          const currentIndex = guru.findIndex((item) => item.id === id);

          if (currentIndex === -1) return;

          const currentUsedKelas = getKelasUsingGuru(id);

          if (currentUsedKelas) {
            showToast({
              type: "warning",
              title: "Guru tidak dapat dihapus",
              message: `${selectedGuru.name} masih digunakan sebagai wali kelas ${currentUsedKelas.name}.`,
            });

            return;
          }

          guru.splice(currentIndex, 1);
          saveGuruData();
          renderSummaryCards();
          filterGuru();

          showToast({
            type: "success",
            title: "Data guru dihapus",
            message: `${selectedGuru.name} berhasil dihapus dari tabel.`,
          });
        },
      },
    ],
  });
}

migrateGuruClassRelationData();
renderSummaryCards();
filterGuru();
console.log("Guru rendered");
