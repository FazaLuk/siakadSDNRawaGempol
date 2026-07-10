console.log("Kelas page connected");
import {
  kelas,
  saveKelasData,
  getActiveKelasData,
  createKelasData,
  deleteKelasData,
  loadKelasData,
  updateKelasData,
} from "../modules/kelas.js";
import { getHomeroomGuruData, loadGuruData } from "../modules/guru.js";
import {
  students,
  saveStudentData,
  STUDENT_DATA_CHANGED_EVENT,
  countStudentsByClassId,
  getStudentClassId,
  migrateStudentClassIds,
  syncStudentData,
  loadStudentData,
} from "../modules/students.js";
import { showToast } from "../modules/toast.js";

/* =========================
   ELEMENT
========================== */

const tableBody = document.getElementById("kelasTableBody");
const searchInput = document.getElementById("searchKelas");
const filterLevel = document.getElementById("filterLevel");
const filterStatus = document.getElementById("filterStatus");
const resetFilterBtn = document.querySelector(".filter-reset-btn");
const pagination = document.getElementById("pagination");
const kelasModal = document.getElementById("kelasModal");
const kelasModalTitle = kelasModal.querySelector(".student-modal-header h3");
const kelasModalDescription = kelasModal.querySelector(
  ".student-modal-header p",
);
const openKelasModal = document.getElementById("openKelasModal");
const closeModal = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModal = document.getElementById("cancelModal");

const kelasName = document.getElementById("kelasName");
const kelasLevel = document.getElementById("kelasLevel");
const kelasLabel = document.getElementById("kelasLabel");
const kelasGuruId = document.getElementById("kelasGuruId");
const kelasStatus = document.getElementById("kelasStatus");
const saveKelasBtn = document.getElementById("saveKelasBtn");
const totalKelasCard = document.getElementById("totalKelasCard");
const kelasAktifCard = document.getElementById("kelasAktifCard");
const totalSiswaKelasCard = document.getElementById("totalSiswaKelasCard");
const rataSiswaKelasCard = document.getElementById("rataSiswaKelasCard");

let currentPage = 1;
let selectedKelasId = null;
const rowsPerPage = 5;
let homeroomGuru = [];

/* =========================
   HELPER
========================== */

function normalizeText(value) {
  return value.trim().toLowerCase();
}

function isDuplicateKelasName(value, ignoredId = null) {
  const normalizedValue = normalizeText(value);

  return kelas.some(
    (item) =>
      item.id !== ignoredId && normalizeText(item.name) === normalizedValue,
  );
}

function getStatusBadgeClass(status) {
  return status === "Aktif" ? "badge-success" : "badge-warning";
}

function getGuruNameById(guruId, fallback = "-") {
  const selectedGuru = homeroomGuru.find((item) => item.id === Number(guruId));

  return selectedGuru ? selectedGuru.name : fallback;
}

function getKelasHomeroomTeacherName(item) {
  return getGuruNameById(item.guruId, item.homeroomTeacher || "-");
}

function getStudentCountByClassId(classId) {
  return countStudentsByClassId(students, kelas, classId);
}

function renderSummaryCards() {
  const activeKelas = getActiveKelasData();
  const averageStudents = activeKelas.length
    ? Math.round((students.length / activeKelas.length) * 10) / 10
    : 0;

  totalKelasCard.textContent = kelas.length;
  kelasAktifCard.textContent = activeKelas.length;
  totalSiswaKelasCard.textContent = students.length;
  rataSiswaKelasCard.textContent = averageStudents;
}

function getStudentUsingKelas(kelasId) {
  return students.find(
    (student) => getStudentClassId(student, kelas) === Number(kelasId),
  );
}

function migrateLegacyHomeroomTeacherData() {
  let hasMigratedData = false;

  kelas.forEach((item) => {
    if (Object.prototype.hasOwnProperty.call(item, "studentCount")) {
      delete item.studentCount;
      hasMigratedData = true;
    }

    if (item.guruId || !item.homeroomTeacher) return;

    const selectedGuru = homeroomGuru.find(
      (guruItem) => guruItem.name === item.homeroomTeacher,
    );

    if (
      !selectedGuru ||
      isGuruAssignedToAnotherKelas(selectedGuru.id, item.id)
    ) {
      return;
    }

    item.guruId = selectedGuru.id;
    delete item.homeroomTeacher;
    hasMigratedData = true;
  });

  if (hasMigratedData) {
    saveKelasData();
  }
}

function migrateLegacyStudentClassData() {
  if (migrateStudentClassIds(students, kelas)) {
    saveStudentData();
  }
}

function isGuruAssignedToAnotherKelas(guruId, ignoredId = null) {
  if (!guruId) return false;

  return kelas.some(
    (item) => item.id !== ignoredId && Number(item.guruId) === Number(guruId),
  );
}

function getAvailableHomeroomGuru(ignoredId = null) {
  return homeroomGuru.filter(
    (item) => !isGuruAssignedToAnotherKelas(item.id, ignoredId),
  );
}

function renderHomeroomGuruOptions(ignoredId = null) {
  const availableGuru = getAvailableHomeroomGuru(ignoredId);

  if (!availableGuru.length) {
    kelasGuruId.innerHTML = `
      <option value="">Belum ada guru wali tersedia</option>
    `;
    kelasGuruId.disabled = true;
    saveKelasBtn.disabled = true;

    return;
  }

  kelasGuruId.disabled = false;
  saveKelasBtn.disabled = false;
  kelasGuruId.innerHTML = `
    <option value="">Pilih wali kelas</option>
    ${availableGuru
      .map((item) => `<option value="${item.id}">${item.name}</option>`)
      .join("")}
  `;
}

/* =========================
   MODAL
========================== */

openKelasModal.addEventListener("click", () => {
  selectedKelasId = null;
  setKelasModalMode("add");
  resetKelasForm();
  renderHomeroomGuruOptions();
  kelasModal.classList.add("show");
});

function hideModal() {
  kelasModal.classList.remove("show");
}

function resetKelasForm() {
  kelasName.value = "";
  kelasLevel.value = "";
  kelasLabel.value = "";
  kelasGuruId.value = "";
  kelasStatus.value = "Aktif";
}

function setKelasModalMode(mode) {
  if (mode === "edit") {
    kelasModalTitle.textContent = "Edit Kelas";
    kelasModalDescription.textContent = "Ubah data kelas";
    saveKelasBtn.textContent = "Simpan Perubahan";
    return;
  }

  kelasModalTitle.textContent = "Tambah Kelas";
  kelasModalDescription.textContent = "Tambahkan data kelas baru";
  saveKelasBtn.textContent = "Simpan Kelas";
}

function fillKelasForm(selectedKelas) {
  kelasName.value = selectedKelas.name;
  kelasLevel.value = selectedKelas.level;
  kelasLabel.value = selectedKelas.label;
  renderHomeroomGuruOptions(selectedKelas.id);
  kelasGuruId.value = selectedKelas.guruId || "";
  kelasStatus.value = selectedKelas.status;
}

closeModal.addEventListener("click", hideModal);
closeModalBtn.addEventListener("click", hideModal);
cancelModal.addEventListener("click", hideModal);

/* =========================
   SAVE KELAS
========================== */

saveKelasBtn.addEventListener("click", async () => {
  if (
    !kelasName.value.trim() ||
    !kelasLevel.value ||
    !kelasLabel.value.trim() ||
    !kelasGuruId.value ||
    !kelasStatus.value
  ) {
    showToast({
      type: "error",
      title: "Data belum lengkap",
      message:
        "Nama kelas, tingkat, label, wali kelas, dan status wajib diisi.",
    });

    return;
  }

  if (isDuplicateKelasName(kelasName.value, selectedKelasId)) {
    showToast({
      type: "warning",
      title: "Nama kelas sudah digunakan",
      message: "Gunakan nama kelas lain karena nama ini sudah terdaftar.",
    });

    return;
  }

  if (isGuruAssignedToAnotherKelas(kelasGuruId.value, selectedKelasId)) {
    showToast({
      type: "warning",
      title: "Wali kelas sudah digunakan",
      message: "Guru ini sudah menjadi wali kelas di kelas lain.",
    });

    return;
  }

  const kelasData = {
    name: kelasName.value.trim(),
    level: kelasLevel.value,
    label: kelasLabel.value.trim().toUpperCase(),
    guruId: Number(kelasGuruId.value),
    status: kelasStatus.value,
  };

  const isEditMode = Boolean(selectedKelasId);

  try {
    if (isEditMode) {
      await updateKelasData(selectedKelasId, kelasData);
    } else {
      await createKelasData(kelasData);
      currentPage = 1;
    }
  } catch (error) {
    showToast({
      type: "error",
      title: "Gagal menyimpan data kelas",
      message:
        error?.message ||
        "Terjadi kesalahan saat menyimpan data kelas ke server.",
    });
    return;
  }

  renderSummaryCards();
  filterKelas();
  hideModal();

  selectedKelasId = null;
  setKelasModalMode("add");
  resetKelasForm();

  showToast({
    type: "success",
    title: isEditMode ? "Data kelas diperbarui" : "Kelas berhasil ditambahkan",
    message: `${kelasData.name} sudah tersimpan di tabel.`,
  });
});

/* =========================
   RENDER TABLE
========================== */

function renderKelas(data) {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((item, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${start + index + 1}</td>
        <td>
          <div class="student-avatar">
            <i class="bi bi-building-fill"></i>
          </div>
        </td>
        <td>${item.name}</td>
        <td>
          <span class="class-badge class-blue">${item.level}</span>
        </td>
        <td>${item.label}</td>
        <td>${getKelasHomeroomTeacherName(item)}</td>
        <td>${getStudentCountByClassId(item.id)} siswa</td>
        <td>
          <span class="status-badge ${getStatusBadgeClass(item.status)}">
            ${item.status}
          </span>
        </td>
        <td>
          <div class="table-action">
            <button class="action-btn btn-edit" data-id="${item.id}" type="button">
              <i class="bi bi-pencil-fill"></i>
            </button>
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
      filterKelas();
    });
  });
}

/* =========================
   SEARCH & FILTER
========================== */

searchInput.addEventListener("keyup", () => {
  currentPage = 1;
  filterKelas();
});

filterLevel.addEventListener("change", () => {
  currentPage = 1;
  filterKelas();
});

filterStatus.addEventListener("change", () => {
  currentPage = 1;
  filterKelas();
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterLevel.value = "";
  filterStatus.value = "";
  currentPage = 1;
  filterKelas();
});

function getFilteredKelasData() {
  const keyword = searchInput.value.toLowerCase();
  const selectedLevel = filterLevel.value;
  const selectedStatus = filterStatus.value;

  return kelas.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(keyword) ||
      item.level.toLowerCase().includes(keyword) ||
      item.label.toLowerCase().includes(keyword) ||
      getKelasHomeroomTeacherName(item).toLowerCase().includes(keyword);

    const matchLevel = !selectedLevel || item.level === selectedLevel;
    const matchStatus = !selectedStatus || item.status === selectedStatus;

    return matchSearch && matchLevel && matchStatus;
  });
}

function renderCurrentKelasTable() {
  renderKelas(getFilteredKelasData());
}

function filterKelas() {
  const filtered = getFilteredKelasData();

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderKelas(filtered);
  renderPagination(filtered);
}

function handleStudentDataChange(nextStudents) {
  syncStudentData(nextStudents);
  renderSummaryCards();
  renderCurrentKelasTable();
}

window.addEventListener(STUDENT_DATA_CHANGED_EVENT, (event) => {
  handleStudentDataChange(event.detail?.students);
});

/* =========================
   ACTION
========================== */

tableBody.addEventListener("click", (event) => {
  const editButton = event.target.closest(".btn-edit");
  const deleteButton = event.target.closest(".btn-delete");

  if (editButton) {
    editKelas(Number(editButton.dataset.id));
    return;
  }

  if (!deleteButton) return;

  deleteKelas(Number(deleteButton.dataset.id));
});

function editKelas(id) {
  const selectedKelas = kelas.find((item) => item.id === id);

  if (!selectedKelas) return;

  selectedKelasId = id;
  setKelasModalMode("edit");
  fillKelasForm(selectedKelas);
  kelasModal.classList.add("show");
}

function deleteKelas(id) {
  const kelasIndex = kelas.findIndex((item) => item.id === id);

  if (kelasIndex === -1) return;

  const selectedKelas = kelas[kelasIndex];
  const usedStudent = getStudentUsingKelas(selectedKelas.id);

  if (usedStudent) {
    showToast({
      type: "warning",
      title: "Kelas tidak dapat dihapus",
      message: `${selectedKelas.name} masih digunakan oleh data siswa.`,
    });

    return;
  }

  showToast({
    type: "delete",
    title: "Hapus data kelas?",
    message: `${selectedKelas.name} akan dihapus dari tabel.`,
    duration: 0,
    actions: [
      {
        label: "Batal",
        variant: "secondary",
      },
      {
        label: "Hapus",
        variant: "primary",
        onClick: async () => {
          const currentIndex = kelas.findIndex((item) => item.id === id);

          if (currentIndex === -1) return;

          const currentUsedStudent = getStudentUsingKelas(selectedKelas.id);

          if (currentUsedStudent) {
            showToast({
              type: "warning",
              title: "Kelas tidak dapat dihapus",
              message: `${selectedKelas.name} masih digunakan oleh data siswa.`,
            });

            return;
          }

          try {
            await deleteKelasData(id);
            renderSummaryCards();
            filterKelas();
          } catch (error) {
            showToast({
              type: "error",
              title: "Gagal menghapus data kelas",
              message:
                error?.message ||
                "Terjadi kesalahan saat menghapus data kelas dari server.",
            });
            return;
          }

          showToast({
            type: "success",
            title: "Data kelas dihapus",
            message: `${selectedKelas.name} berhasil dihapus dari tabel.`,
          });
        },
      },
    ],
  });
}

async function initKelasPage() {
  await loadGuruData();
  await loadKelasData();
  await loadStudentData();

  homeroomGuru = getHomeroomGuruData();
  migrateLegacyHomeroomTeacherData();
  migrateLegacyStudentClassData();
  renderSummaryCards();
  filterKelas();
  console.log("Kelas rendered");
}

initKelasPage().catch((error) => {
  console.error("Gagal memuat halaman kelas", error);
  showToast({
    type: "error",
    title: "Gagal memuat data kelas",
    message: error?.message || "Data kelas gagal dimuat dari server.",
  });
});
