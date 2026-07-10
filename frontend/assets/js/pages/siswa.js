console.log("Siswa page connected");
import {
  students,
  saveStudentData,
  getStudentClassId,
  getStudentClassName,
  migrateStudentClassIds,
  loadStudentData,
  createStudentData,
  updateStudentData,
  deleteStudentData,
} from "../modules/students.js";
import { getActiveKelasData, loadKelasData } from "../modules/kelas.js";
import {
  calculateBantuanScore,
  getBantuanStatus,
} from "../modules/spkBantuan.js";
import { showToast } from "../modules/toast.js";
import {
  getRole,
  isWaliKelasUser,
  resolveWaliKelasClassId,
} from "../modules/auth.js";

/* =========================
   ELEMENT
========================== */

const tableBody = document.getElementById("studentTableBody");
const searchInput = document.getElementById("searchStudent");
const filterClass = document.getElementById("filterClass");
const filterGender = document.getElementById("filterGender");
const pagination = document.getElementById("pagination");
const studentModal = document.getElementById("studentModal");
const studentModalTitle = studentModal.querySelector(
  ".student-modal-header h3",
);
const studentModalDescription = studentModal.querySelector(
  ".student-modal-header p",
);
const studentDetailModal = document.getElementById("studentDetailModal");
const closeStudentDetailModal = document.getElementById(
  "closeStudentDetailModal",
);
const closeStudentDetailModalBtn = document.getElementById(
  "closeStudentDetailModalBtn",
);
const closeStudentDetailFooterBtn = document.getElementById(
  "closeStudentDetailFooterBtn",
);
const detailStudentName = document.getElementById("detailStudentName");
const detailStudentNisn = document.getElementById("detailStudentNisn");
const detailStudentClass = document.getElementById("detailStudentClass");
const detailStudentGender = document.getElementById("detailStudentGender");
const detailStudentParent = document.getElementById("detailStudentParent");
const detailStudentIncome = document.getElementById("detailStudentIncome");
const detailStudentPhone = document.getElementById("detailStudentPhone");
const totalSiswaCard = document.getElementById("totalSiswaCard");
const siswaLakiCard = document.getElementById("siswaLakiCard");
const siswaPerempuanCard = document.getElementById("siswaPerempuanCard");
const siswaLayakBantuanCard = document.getElementById("siswaLayakBantuanCard");
const siswaLakiPercent = document.getElementById("siswaLakiPercent");
const siswaPerempuanPercent = document.getElementById("siswaPerempuanPercent");

let waliKelasClassId = resolveWaliKelasClassId();
let activeKelas = [];

function syncWaliKelasScope() {
  waliKelasClassId = resolveWaliKelasClassId();
}

function syncActiveKelas() {
  activeKelas = getActiveKelasData();
}

function isWaliKelasRole() {
  return isWaliKelasUser();
}

function isWaliKelasFormScope() {
  return getRole() === "wali_kelas" && Boolean(waliKelasClassId);
}

function getVisibleStudents() {
  return isWaliKelasRole()
    ? students.filter(
        (student) =>
          Number(getStudentClassId(student, activeKelas)) ===
          Number(waliKelasClassId),
      )
    : students;
}

function getVisibleClasses() {
  return isWaliKelasRole()
    ? activeKelas.filter(
        (item) => Number(item.id) === Number(waliKelasClassId),
      )
    : activeKelas;
}

function getWaliKelasClass() {
  return activeKelas.find(
    (item) => Number(item.id) === Number(waliKelasClassId),
  );
}

function getFormClassOptions() {
  syncActiveKelas();
  syncWaliKelasScope();

  if (!isWaliKelasFormScope()) {
    return activeKelas;
  }

  const scopedClass = getWaliKelasClass();

  return scopedClass ? [scopedClass] : activeKelas;
}

const openStudentModal = document.getElementById("openStudentModal");

const closeModal = document.getElementById("closeModal");

const closeModalBtn = document.getElementById("closeModalBtn");

const cancelModal = document.getElementById("cancelModal");
let currentPage = 1;
let selectedStudentId = null;
let lastNisnWarningKey = "";

/* OPEN */
openStudentModal.addEventListener("click", () => {
  selectedStudentId = null;
  setStudentModalMode("add");
  resetStudentForm();
  renderClassDropdowns();
  applyLockedStudentClassValue();
  studentModal.classList.add("show");
});
/* =========================
   NISN VALIDATION
========================== */

const studentNisn = document.getElementById("studentNisn");

studentNisn.addEventListener("input", () => {
  /* HANYA ANGKA */
  const rawValue = studentNisn.value;

  studentNisn.value = rawValue.replace(/\D/g, "");

  if (rawValue !== studentNisn.value) {
    showNisnWarning(
      "format",
      "Format NISN salah",
      "NISN hanya boleh berisi angka.",
    );

    return;
  }

  validateNisnRealtime();
});

function isNisnDuplicate(nisn) {
  return students.some(
    (student) => student.nisn === nisn && student.id !== selectedStudentId,
  );
}

function validateNisn(nisn) {
  if (!/^\d{10}$/.test(nisn)) {
    return {
      valid: false,
      key: "length",
      title: "Format NISN salah",
      message: "NISN harus tepat 10 digit angka.",
    };
  }

  if (isNisnDuplicate(nisn)) {
    return {
      valid: false,
      key: "duplicate",
      title: "NISN sudah digunakan",
      message: "Gunakan NISN lain yang belum terdaftar.",
    };
  }

  return { valid: true };
}

function showNisnWarning(key, title, message) {
  if (lastNisnWarningKey === key) return;

  lastNisnWarningKey = key;

  showToast({
    type: "warning",
    title,
    message,
  });
}

function validateNisnRealtime() {
  const nisn = studentNisn.value;

  if (!nisn) {
    lastNisnWarningKey = "";
    return;
  }

  const nisnValidation = validateNisn(nisn);

  if (nisnValidation.valid) {
    lastNisnWarningKey = "";
    return;
  }

  showNisnWarning(
    nisnValidation.key,
    nisnValidation.title,
    nisnValidation.message,
  );
}
/* CLOSE FUNCTION */
function hideModal() {
  studentModal.classList.remove("show");
}

function hideDetailModal() {
  studentDetailModal.classList.remove("show");
}

function resetStudentForm() {
  studentName.value = "";
  studentNisn.value = "";
  studentGender.value = "";
  studentParent.value = "";
  studentIncome.value = "";
  studentHouse.value = "";
  studentPhone.value = "";
  lastNisnWarningKey = "";

  if (!isWaliKelasFormScope()) {
    studentClass.value = "";
  }
}

function applyLockedStudentClassValue() {
  if (!isWaliKelasFormScope()) return;

  const lockedClass = getWaliKelasClass();

  if (!lockedClass) return;

  studentClass.value = String(lockedClass.id);
}

function setStudentModalMode(mode) {
  if (mode === "edit") {
    studentModalTitle.textContent = "Edit Siswa";
    studentModalDescription.textContent = "Ubah data siswa";
    saveStudentBtn.textContent = "Simpan Perubahan";
    return;
  }

  studentModalTitle.textContent = "Tambah Siswa";
  studentModalDescription.textContent = "Tambahkan data siswa baru";
  saveStudentBtn.textContent = "Simpan Siswa";
}

function fillStudentForm(student) {
  studentName.value = student.name;
  studentNisn.value = student.nisn;
  studentClass.value = getStudentClassId(student, activeKelas) || "";
  studentGender.value = student.gender;
  studentParent.value = student.parent || "";
  studentIncome.value = student.income || "";
  studentHouse.value = student.house || "";
  studentPhone.value = student.phone || "";
}

/* CLOSE */
closeModal.addEventListener("click", hideModal);

closeModalBtn.addEventListener("click", hideModal);

cancelModal.addEventListener("click", hideModal);

closeStudentDetailModal.addEventListener("click", hideDetailModal);

closeStudentDetailModalBtn.addEventListener("click", hideDetailModal);

closeStudentDetailFooterBtn.addEventListener("click", hideDetailModal);

const rowsPerPage = 5;

/* =========================
   FORM INPUT
========================== */

const studentName = document.getElementById("studentName");

const studentClass = document.getElementById("studentClass");

const studentGender = document.getElementById("studentGender");

const studentParent = document.getElementById("studentParent");

const studentIncome = document.getElementById("studentIncome");

const studentHouse = document.getElementById("studentHouse");

const studentPhone = document.getElementById("studentPhone");

const saveStudentBtn = document.getElementById("saveStudentBtn");

function getKelasById(classId) {
  return activeKelas.find((item) => item.id === Number(classId));
}

function migrateLegacyStudentClassData() {
  if (migrateStudentClassIds(students, activeKelas)) {
    saveStudentData();
  }
}

function getPercent(value, total) {
  if (!total) return "0%";

  return `${Math.round((value / total) * 1000) / 10}%`;
}

function renderSummaryCards() {
  const visibleStudents = getVisibleStudents();
  const maleStudents = visibleStudents.filter(
    (student) => student.gender === "Laki-laki",
  ).length;
  const femaleStudents = visibleStudents.filter(
    (student) => student.gender === "Perempuan",
  ).length;
  const eligibleStudents = visibleStudents.filter(
    (student) => getBantuanStatus(calculateBantuanScore(student)) === "Layak",
  ).length;

  totalSiswaCard.textContent = visibleStudents.length;
  siswaLakiCard.textContent = maleStudents;
  siswaPerempuanCard.textContent = femaleStudents;
  siswaLayakBantuanCard.textContent = eligibleStudents;
  siswaLakiPercent.textContent = `${getPercent(maleStudents, visibleStudents.length)} dari total`;
  siswaPerempuanPercent.textContent = `${getPercent(femaleStudents, visibleStudents.length)} dari total`;
}

function renderClassDropdowns() {
  const classOptions = getFormClassOptions();

  if (!classOptions.length) {
    filterClass.innerHTML = `
      <option value="">Belum ada kelas aktif</option>
    `;
    studentClass.innerHTML = `
      <option value="">Belum ada kelas aktif</option>
    `;
    filterClass.disabled = true;
    studentClass.disabled = true;
    saveStudentBtn.disabled = true;

    return;
  }

  filterClass.disabled = false;
  studentClass.disabled = false;
  saveStudentBtn.disabled = false;

  const classOptionHtml = classOptions
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");

  if (isWaliKelasFormScope()) {
    const kelasOption = classOptions[0];

    filterClass.innerHTML = classOptionHtml;
    studentClass.innerHTML = `
      <option value="${kelasOption.id}" selected>${kelasOption.name}</option>
    `;
    filterClass.value = String(kelasOption.id);
    studentClass.value = String(kelasOption.id);
    filterClass.disabled = true;
    studentClass.disabled = true;
    applyLockedStudentClassValue();
    return;
  }

  filterClass.innerHTML = `
    <option value="">Semua Kelas</option>
    ${classOptionHtml}
  `;
  studentClass.innerHTML = `
    <option value="">Pilih kelas</option>
    ${classOptionHtml}
  `;
}

function refreshSiswaPageData() {
  syncActiveKelas();
  syncWaliKelasScope();
  renderClassDropdowns();
  renderSummaryCards();
  filterStudents();
}

/* =========================
   SAVE STUDENT
========================== */

saveStudentBtn.addEventListener("click", async () => {
  /* VALIDATION */
  if (
    !studentName.value ||
    !studentNisn.value ||
    !studentClass.value ||
    !studentGender.value
  ) {
    showToast({
      type: "error",
      title: "Data belum lengkap",
      message: "Nama, NISN, kelas, dan jenis kelamin wajib diisi.",
    });

    return;
  }

  const selectedKelas = getKelasById(studentClass.value);

  if (!selectedKelas) {
    showToast({
      type: "error",
      title: "Kelas tidak valid",
      message: "Pilih kelas aktif yang tersedia.",
    });

    return;
  }

  const studentData = {
    nisn: studentNisn.value,
    name: studentName.value,
    classId: selectedKelas.id,
    class: selectedKelas.name,
    gender: studentGender.value,
    parent: studentParent.value,
    income: studentIncome.value,
    house: studentHouse.value,
    phone: studentPhone.value,
  };

  const nisnValidation = validateNisn(studentData.nisn);

  if (!nisnValidation.valid) {
    showToast({
      type: "warning",
      title: nisnValidation.title,
      message: nisnValidation.message,
    });

    lastNisnWarningKey = nisnValidation.key;

    return;
  }

  const isEditMode = Boolean(selectedStudentId);

  try {
    if (isEditMode) {
      await updateStudentData(selectedStudentId, studentData);
    } else {
      await createStudentData(studentData);
      currentPage = 1;
    }
  } catch (error) {
    showToast({
      type: "error",
      title: "Gagal menyimpan data siswa",
      message:
        error?.message ||
        "Terjadi kesalahan saat menyimpan data siswa ke server.",
    });
    return;
  }

  renderSummaryCards();

  /* RE-RENDER */
  filterStudents();

  /* CLOSE MODAL */
  hideModal();

  /* RESET FORM */
  selectedStudentId = null;
  setStudentModalMode("add");
  resetStudentForm();

  showToast({
    type: "success",
    title: isEditMode ? "Data siswa diperbarui" : "Siswa berhasil ditambahkan",
    message: `${studentData.name} sudah tersimpan di tabel.`,
  });
});
/* =========================
   RENDER TABLE
========================== */

function renderStudents(data) {
  tableBody.innerHTML = "";

  /* =========================
   PAGINATION
========================== */

  const start = (currentPage - 1) * rowsPerPage;

  const end = start + rowsPerPage;

  const paginatedData = data.slice(start, end);

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((student, index) => {
    tableBody.innerHTML += `

            <tr>

                <td>

    ${start + index + 1}

</td>

                <!-- FOTO -->
                <td>

                    <div class="student-avatar">

                        <i class="bi bi-person-fill"></i>

                    </div>

                </td>

                <!-- NISN -->
                <td>${student.nisn}</td>

                <!-- NAMA -->
                <td>${student.name}</td>

                <!-- KELAS -->
                <td>

                    <span class="class-badge class-blue">

                        ${getStudentClassName(student, activeKelas)}

                    </span>

                </td>

                <!-- GENDER -->
                <td>

                    <div class="gender-info">

                        ${
                          student.gender === "Laki-laki"
                            ? `
                            <i class="bi bi-gender-male gender-male-icon"></i>
                            `
                            : `
                            <i class="bi bi-gender-female gender-female-icon"></i>
                            `
                        }

                        ${student.gender}

                    </div>

                </td>

                <!-- PARENT -->
                <td>${student.parent}</td>

                <!-- INCOME -->
                <td>

                    <span class="income-badge income-orange">

                        ${student.income}

                    </span>

                </td>

                <!-- PHONE -->
                <td>${student.phone}</td>

                <!-- ACTION -->
                <td>

                    <div class="table-action">

                        <button class="action-btn btn-view" data-id="${student.id}" type="button">

                            <i class="bi bi-eye-fill"></i>

                        </button>

                        <button class="action-btn btn-edit" data-id="${student.id}" type="button">

                            <i class="bi bi-pencil-fill"></i>

                        </button>

                        <button class="action-btn btn-delete" data-id="${student.id}" type="button">

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
                class="
                    pagination-btn
                    ${currentPage === i ? "active" : ""}
                "
                data-page="${i}"
            >

                ${i}

            </button>

        `;
  }

  /* BUTTON EVENT */
  document.querySelectorAll(".pagination-btn").forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = Number(button.dataset.page);

      filterStudents();
    });
  });
}

/* =========================
   SEARCH
========================== */

searchInput.addEventListener("keyup", () => {
  currentPage = 1;
  filterStudents();
});

/* =========================
   FILTER CLASS
========================== */

filterClass.addEventListener("change", () => {
  currentPage = 1;
  filterStudents();
});

tableBody.addEventListener("click", (event) => {
  const viewButton = event.target.closest(".btn-view");
  const editButton = event.target.closest(".btn-edit");
  const deleteButton = event.target.closest(".btn-delete");

  if (viewButton) {
    viewStudent(Number(viewButton.dataset.id));

    return;
  }

  if (editButton) {
    const id = Number(editButton.dataset.id);

    editStudent(id);

    return;
  }

  if (!deleteButton) return;

  const id = Number(deleteButton.dataset.id);

  deleteStudent(id);
});

/* =========================
   VIEW STUDENT
========================== */

function viewStudent(id) {
  const selectedStudent = students.find((student) => student.id === id);

  if (!selectedStudent) return;

  detailStudentName.textContent = selectedStudent.name;
  detailStudentNisn.textContent = selectedStudent.nisn;
  detailStudentClass.textContent = getStudentClassName(
    selectedStudent,
    activeKelas,
  );
  detailStudentGender.innerHTML = `
    <div class="gender-info">
      ${
        selectedStudent.gender === "Laki-laki"
          ? `<i class="bi bi-gender-male gender-male-icon"></i>`
          : `<i class="bi bi-gender-female gender-female-icon"></i>`
      }
      ${selectedStudent.gender}
    </div>
  `;
  detailStudentParent.textContent = selectedStudent.parent || "-";
  detailStudentIncome.textContent = selectedStudent.income || "-";
  detailStudentPhone.textContent = selectedStudent.phone || "-";

  studentDetailModal.classList.add("show");
}

/* =========================
   EDIT STUDENT
========================== */

function editStudent(id) {
  const selectedStudent = students.find((student) => student.id === id);

  if (!selectedStudent) return;

  selectedStudentId = id;
  setStudentModalMode("edit");
  renderClassDropdowns();
  fillStudentForm(selectedStudent);
  applyLockedStudentClassValue();
  studentModal.classList.add("show");
}

/* =========================
   DELETE STUDENT
========================== */

function deleteStudent(id) {
  const studentIndex = students.findIndex((student) => student.id === id);

  if (studentIndex === -1) return;

  const selectedStudent = students[studentIndex];

  showToast({
    type: "delete",
    title: "Hapus data siswa?",
    message: `${selectedStudent.name} akan dihapus dari tabel.`,
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
          const currentIndex = students.findIndex(
            (student) => student.id === id,
          );

          if (currentIndex === -1) return;

          try {
            await deleteStudentData(id);
            renderSummaryCards();
          } catch (error) {
            showToast({
              type: "error",
              title: "Gagal menghapus data siswa",
              message:
                error?.message ||
                "Terjadi kesalahan saat menghapus data siswa dari server.",
            });
            return;
          }

          /* RENDER ULANG */
          filterStudents();

          showToast({
            type: "success",
            title: "Data siswa dihapus",
            message: `${selectedStudent.name} berhasil dihapus dari tabel.`,
          });
        },
      },
    ],
  });
}
/* =========================
   FILTER GENDER
========================== */

filterGender.addEventListener("change", () => {
  currentPage = 1;
  filterStudents();
});

/* =========================
   FILTER SYSTEM
========================== */

function filterStudents() {
  const keyword = searchInput.value.toLowerCase();

  const selectedClass = Number(filterClass.value);

  const selectedGender = filterGender.value;
  const studentsToSearch = getVisibleStudents();

  const filtered = studentsToSearch.filter((student) => {
    const matchSearch =
      student.name.toLowerCase().includes(keyword) ||
      student.nisn.toLowerCase().includes(keyword);

    const matchClass =
      !selectedClass ||
      getStudentClassId(student, activeKelas) === selectedClass;

    const matchGender = !selectedGender || student.gender === selectedGender;

    return matchSearch && matchClass && matchGender;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderStudents(filtered);
  renderPagination(filtered);
}

async function initSiswaPage() {
  await loadKelasData();
  await loadStudentData();

  syncActiveKelas();
  renderClassDropdowns();
  migrateLegacyStudentClassData();
  renderSummaryCards();
  filterStudents();
  console.log("Students rendered");
}

initSiswaPage().catch((error) => {
  console.error("Gagal memuat halaman siswa", error);
  showToast({
    type: "error",
    title: "Gagal memuat data siswa",
    message: error?.message || "Data siswa gagal dimuat dari server.",
  });
});
