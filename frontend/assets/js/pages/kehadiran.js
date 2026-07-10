console.log("Kehadiran page connected");

import {
  kehadiran,
  loadKehadiranData,
  createKehadiranData,
  updateKehadiranData,
  deleteKehadiranData,
} from "../modules/kehadiran.js";
import {
  students,
  getStudentClassId,
  migrateStudentClassIds,
  saveStudentData,
  loadStudentData,
} from "../modules/students.js";
import { kelas, loadKelasData } from "../modules/kelas.js";
import { showToast } from "../modules/toast.js";
import {
  isWaliKelasUser,
  resolveWaliKelasClassId,
} from "../modules/auth.js";

/* =========================
   ELEMENT
========================== */

const tableBody = document.getElementById("kehadiranTableBody");
const searchInput = document.getElementById("searchKehadiran");
const filterClass = document.getElementById("filterClass");
const filterStatus = document.getElementById("filterStatus");
const resetFilterBtn = document.querySelector(".filter-reset-btn");
const pagination = document.getElementById("pagination");
const kehadiranModal = document.getElementById("kehadiranModal");
const kehadiranModalTitle = kehadiranModal.querySelector(
  ".student-modal-header h3",
);
const kehadiranModalDescription = kehadiranModal.querySelector(
  ".student-modal-header p",
);
const openKehadiranModal = document.getElementById("openKehadiranModal");
const closeModal = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModal = document.getElementById("cancelModal");

const kehadiranClassId = document.getElementById("kehadiranClassId");
const kehadiranStudentSearch = document.getElementById(
  "kehadiranStudentSearch",
);
const kehadiranStudentId = document.getElementById("kehadiranStudentId");
const kehadiranDate = document.getElementById("kehadiranDate");
const kehadiranStatus = document.getElementById("kehadiranStatus");
const saveKehadiranBtn = document.getElementById("saveKehadiranBtn");
const totalAbsensiCard = document.getElementById("totalAbsensiCard");
const hadirHariIniCard = document.getElementById("hadirHariIniCard");
const izinSakitCard = document.getElementById("izinSakitCard");
const alphaCard = document.getElementById("alphaCard");

let currentPage = 1;
let selectedKehadiranId = null;
const rowsPerPage = 5;

/* =========================
   HELPER
========================== */

function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStudentById(studentId) {
  return students.find((student) => student.id === Number(studentId));
}

function getKelasById(classId) {
  return kelas.find((item) => item.id === Number(classId));
}

const waliKelasClassId = resolveWaliKelasClassId();

function isWaliKelasRole() {
  return isWaliKelasUser();
}

function getAllowedKelasOptions() {
  return isWaliKelasRole()
    ? kelas.filter((item) => item.id === waliKelasClassId)
    : kelas;
}

function getCurrentRoleClassId() {
  return isWaliKelasRole() ? waliKelasClassId : null;
}

function getKehadiranStudent(item) {
  return getStudentById(item.studentId);
}

function getKehadiranKelas(item) {
  return getKelasById(item.classId);
}

function getKehadiranStudentName(item) {
  return getKehadiranStudent(item)?.name || "-";
}

function getKehadiranClassName(item) {
  return getKehadiranKelas(item)?.name || "-";
}

function getStatusBadgeClass(status) {
  const statusMap = {
    Hadir: "badge-success",
    Izin: "badge-warning",
    Sakit: "badge-info",
    Alpha: "badge-danger",
  };

  return statusMap[status] || "badge-warning";
}

function isDuplicateKehadiran({ studentId, date }, ignoredId = null) {
  return kehadiran.some(
    (item) =>
      Number(item.id) !== Number(ignoredId) &&
      Number(item.studentId) === Number(studentId) &&
      item.date === date,
  );
}

function getStudentsByClassId(classId) {
  return students.filter(
    (student) => getStudentClassId(student, kelas) === Number(classId),
  );
}

function getFilteredStudentsBySelectedClass() {
  const selectedClassId = Number(kehadiranClassId.value);
  const keyword = kehadiranStudentSearch.value.trim().toLowerCase();

  if (!selectedClassId) return [];

  return getStudentsByClassId(selectedClassId).filter((student) =>
    student.name.toLowerCase().includes(keyword),
  );
}

function updateStudentControlState() {
  const hasSelectedClass = Boolean(kehadiranClassId.value);

  kehadiranStudentSearch.disabled = !hasSelectedClass;
  kehadiranStudentId.disabled = !hasSelectedClass;
}

function migrateLegacyStudentClassData() {
  if (migrateStudentClassIds(students, kelas)) {
    saveStudentData();
  }
}

function renderSummaryCards() {
  const today = getTodayDate();
  const visibleKehadiran = kehadiran.filter(isAllowedKehadiranItem);
  const presentToday = visibleKehadiran.filter(
    (item) => item.date === today && item.status === "Hadir",
  ).length;
  const permissionOrSick = visibleKehadiran.filter(
    (item) => item.status === "Izin" || item.status === "Sakit",
  ).length;
  const absent = visibleKehadiran.filter(
    (item) => item.status === "Alpha",
  ).length;

  totalAbsensiCard.textContent = visibleKehadiran.length;
  hadirHariIniCard.textContent = presentToday;
  izinSakitCard.textContent = permissionOrSick;
  alphaCard.textContent = absent;
}

/* =========================
   DROPDOWN
========================== */

function renderClassDropdowns() {
  const classOptions = getAllowedKelasOptions()
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");

  filterClass.innerHTML = `
    <option value="">${isWaliKelasRole() ? "Kelas Anda" : "Semua Kelas"}</option>
    ${classOptions}
  `;

  kehadiranClassId.innerHTML = `
    <option value="">Pilih kelas</option>
    ${classOptions}
  `;

  if (isWaliKelasRole()) {
    filterClass.value = waliKelasClassId;
    filterClass.disabled = true;
    filterClass.hidden = true;
    filterClass.style.display = "none";
    kehadiranClassId.value = waliKelasClassId;
    kehadiranClassId.disabled = true;
    kehadiranClassId.closest(".form-group").hidden = true;
  } else {
    filterClass.disabled = false;
    filterClass.hidden = false;
    filterClass.style.display = "";
    kehadiranClassId.disabled = false;
    kehadiranClassId.closest(".form-group").hidden = false;
  }
}

function renderStudentDropdown(selectedStudentId = "") {
  const selectedClassId = Number(kehadiranClassId.value);
  const filteredStudents = getFilteredStudentsBySelectedClass();

  if (!selectedClassId) {
    kehadiranStudentId.innerHTML = `
      <option value="">Pilih kelas terlebih dahulu</option>
    `;
    return;
  }

  if (!filteredStudents.length) {
    kehadiranStudentId.innerHTML = `
      <option value="">Belum ada data</option>
    `;
    return;
  }

  kehadiranStudentId.innerHTML = `
    <option value="">Pilih siswa</option>
    ${filteredStudents
      .map(
        (student) => `<option value="${student.id}">${student.name}</option>`,
      )
      .join("")}
  `;
  kehadiranStudentId.value = selectedStudentId;
}

/* =========================
   MODAL
========================== */

openKehadiranModal.addEventListener("click", () => {
  selectedKehadiranId = null;
  setKehadiranModalMode("add");
  resetKehadiranForm();
  updateStudentControlState();
  renderStudentDropdown();
  kehadiranModal.classList.add("show");
});

function hideModal() {
  kehadiranModal.classList.remove("show");
}

function resetKehadiranForm() {
  kehadiranClassId.value = getCurrentRoleClassId() || "";
  kehadiranStudentSearch.value = "";
  kehadiranStudentId.value = "";
  kehadiranDate.value = getTodayDate();
  kehadiranStatus.value = "";
}

function setKehadiranModalMode(mode) {
  if (mode === "edit") {
    kehadiranModalTitle.textContent = "Edit Absensi";
    kehadiranModalDescription.textContent = "Ubah data kehadiran siswa";
    saveKehadiranBtn.textContent = "Simpan Perubahan";
    return;
  }

  kehadiranModalTitle.textContent = "Tambah Absensi";
  kehadiranModalDescription.textContent = "Tambahkan data kehadiran siswa";
  saveKehadiranBtn.textContent = "Simpan Absensi";
}

function fillKehadiranForm(selectedKehadiran) {
  kehadiranClassId.value = selectedKehadiran.classId;
  kehadiranStudentSearch.value = "";
  updateStudentControlState();
  renderStudentDropdown(selectedKehadiran.studentId);
  kehadiranDate.value = selectedKehadiran.date;
  kehadiranStatus.value = selectedKehadiran.status;
}

closeModal.addEventListener("click", hideModal);
closeModalBtn.addEventListener("click", hideModal);
cancelModal.addEventListener("click", hideModal);

kehadiranClassId.addEventListener("change", () => {
  kehadiranStudentSearch.value = "";
  kehadiranStudentId.value = "";
  updateStudentControlState();
  renderStudentDropdown();
});

kehadiranStudentSearch.addEventListener("input", () => {
  renderStudentDropdown();
});

/* =========================
   SAVE KEHADIRAN
========================== */

saveKehadiranBtn.addEventListener("click", async () => {
  const selectedStudent = getStudentById(kehadiranStudentId.value);
  const selectedClass = getKelasById(kehadiranClassId.value);
  const studentClassId = selectedStudent
    ? getStudentClassId(selectedStudent, kelas)
    : null;

  if (
    !selectedClass ||
    !selectedStudent ||
    !kehadiranDate.value ||
    !kehadiranStatus.value
  ) {
    showToast({
      type: "error",
      title: "Data belum lengkap",
      message: "Kelas, siswa, tanggal, dan status kehadiran wajib diisi.",
    });

    return;
  }

  if (studentClassId !== selectedClass.id) {
    showToast({
      type: "warning",
      title: "Siswa tidak sesuai kelas",
      message: "Pilih siswa dari kelas yang sedang dipilih.",
    });

    return;
  }

  const kehadiranData = {
    classId: selectedClass.id,
    studentId: selectedStudent.id,
    date: kehadiranDate.value,
    status: kehadiranStatus.value,
  };

  const isEditMode = Boolean(selectedKehadiranId);

  if (
    isDuplicateKehadiran(kehadiranData, isEditMode ? selectedKehadiranId : null)
  ) {
    showToast({
      type: "warning",
      title: "Absensi duplikat",
      message: "Absensi siswa untuk tanggal ini sudah ada",
    });

    return;
  }

  try {
    if (isEditMode) {
      await updateKehadiranData(selectedKehadiranId, kehadiranData);
    } else {
      await createKehadiranData(kehadiranData);
      currentPage = 1;
    }
  } catch (error) {
    showToast({
      type: "error",
      title: "Gagal menyimpan data absensi",
      message:
        error?.message ||
        "Terjadi kesalahan saat menyimpan data absensi ke server.",
    });
    return;
  }

  renderSummaryCards();
  filterKehadiran();
  hideModal();

  selectedKehadiranId = null;
  setKehadiranModalMode("add");
  resetKehadiranForm();

  showToast({
    type: "success",
    title: isEditMode ? "Absensi diperbarui" : "Absensi berhasil ditambahkan",
    message: `${selectedStudent.name} sudah tersimpan di tabel kehadiran.`,
  });
});

/* =========================
   RENDER TABLE
========================== */

function renderKehadiran(data) {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Belum ada data</td>
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
            <i class="bi bi-calendar-check-fill"></i>
          </div>
        </td>
        <td>${getKehadiranStudentName(item)}</td>
        <td>
          <span class="class-badge class-blue">${getKehadiranClassName(item)}</span>
        </td>
        <td>${item.date}</td>
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
      filterKehadiran();
    });
  });
}

/* =========================
   SEARCH & FILTER
========================== */

searchInput.addEventListener("keyup", () => {
  currentPage = 1;
  filterKehadiran();
});

filterClass.addEventListener("change", () => {
  currentPage = 1;
  filterKehadiran();
});

filterStatus.addEventListener("change", () => {
  currentPage = 1;
  filterKehadiran();
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterClass.value = getCurrentRoleClassId() || "";
  filterStatus.value = "";
  currentPage = 1;
  filterKehadiran();
});

function isAllowedKehadiranItem(item) {
  return !isWaliKelasRole() || Number(item.classId) === waliKelasClassId;
}

function filterKehadiran() {
  const keyword = searchInput.value.toLowerCase();
  const selectedClass = getCurrentRoleClassId() || Number(filterClass.value);
  const selectedStatus = filterStatus.value;

  const filtered = kehadiran.filter((item) => {
    if (!isAllowedKehadiranItem(item)) return false;

    const studentName = getKehadiranStudentName(item).toLowerCase();
    const className = getKehadiranClassName(item).toLowerCase();

    const matchSearch =
      studentName.includes(keyword) ||
      className.includes(keyword) ||
      item.date.includes(keyword) ||
      item.status.toLowerCase().includes(keyword);

    const matchClass = !selectedClass || Number(item.classId) === selectedClass;
    const matchStatus = !selectedStatus || item.status === selectedStatus;

    return matchSearch && matchClass && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderKehadiran(filtered);
  renderPagination(filtered);
}

/* =========================
   ACTION
========================== */

tableBody.addEventListener("click", (event) => {
  const editButton = event.target.closest(".btn-edit");
  const deleteButton = event.target.closest(".btn-delete");

  if (editButton) {
    editKehadiran(Number(editButton.dataset.id));
    return;
  }

  if (!deleteButton) return;

  deleteKehadiran(Number(deleteButton.dataset.id));
});

function editKehadiran(id) {
  const selectedKehadiran = kehadiran.find((item) => item.id === id);

  if (!selectedKehadiran) return;
  if (!isAllowedKehadiranItem(selectedKehadiran)) return;

  selectedKehadiranId = id;
  setKehadiranModalMode("edit");
  fillKehadiranForm(selectedKehadiran);
  kehadiranModal.classList.add("show");
}

function deleteKehadiran(id) {
  const kehadiranIndex = kehadiran.findIndex((item) => item.id === id);

  if (kehadiranIndex === -1) return;

  const selectedKehadiran = kehadiran[kehadiranIndex];
  if (!isAllowedKehadiranItem(selectedKehadiran)) return;

  showToast({
    type: "delete",
    title: "Hapus data absensi?",
    message: `Absensi ${getKehadiranStudentName(selectedKehadiran)} akan dihapus dari tabel.`,
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
          const currentIndex = kehadiran.findIndex((item) => item.id === id);

          if (currentIndex === -1) return;
          if (!isAllowedKehadiranItem(kehadiran[currentIndex])) return;

          try {
            await deleteKehadiranData(id);
            renderSummaryCards();
            filterKehadiran();
          } catch (error) {
            showToast({
              type: "error",
              title: "Gagal menghapus data absensi",
              message:
                error?.message ||
                "Terjadi kesalahan saat menghapus data absensi dari server.",
            });
            return;
          }

          showToast({
            type: "success",
            title: "Data absensi dihapus",
            message: "Data absensi berhasil dihapus dari tabel.",
          });
        },
      },
    ],
  });
}

async function initKehadiranPage() {
  await loadKelasData();
  await loadStudentData();
  await loadKehadiranData();

  migrateLegacyStudentClassData();
  renderClassDropdowns();
  updateStudentControlState();
  renderStudentDropdown();
  renderSummaryCards();
  filterKehadiran();
  console.log("Kehadiran rendered");
}

initKehadiranPage().catch((error) => {
  console.error("Gagal memuat halaman kehadiran", error);
  showToast({
    type: "error",
    title: "Gagal memuat data absensi",
    message: error?.message || "Data absensi gagal dimuat dari server.",
  });
});
