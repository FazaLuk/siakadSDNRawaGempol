console.log("Nilai page connected");

import {
  nilai,
  calculateAverageScore,
  loadNilaiData,
  createNilaiData,
  updateNilaiData,
  deleteNilaiData,
} from "../modules/nilai.js";
import {
  students,
  getStudentClassId,
  migrateStudentClassIds,
  saveStudentData,
  loadStudentData,
} from "../modules/students.js";
import { guru, loadGuruData } from "../modules/guru.js";
import { kelas, loadKelasData } from "../modules/kelas.js";
import { showToast } from "../modules/toast.js";
import {
  isWaliKelasUser,
  resolveWaliKelasClassId,
} from "../modules/auth.js";
import { isHomeroomGuru } from "../modules/guru.js";

/* =========================
   ELEMENT
========================== */

const tableBody = document.getElementById("nilaiTableBody");
const searchInput = document.getElementById("searchNilai");
const filterClass = document.getElementById("filterClass");
const pagination = document.getElementById("pagination");
const nilaiModal = document.getElementById("nilaiModal");
const nilaiModalTitle = nilaiModal.querySelector(".student-modal-header h3");
const nilaiModalDescription = nilaiModal.querySelector(
  ".student-modal-header p",
);
const openNilaiModal = document.getElementById("openNilaiModal");
const closeModal = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModal = document.getElementById("cancelModal");
const resetFilterBtn = document.querySelector(".filter-reset-btn");

const nilaiStudentId = document.getElementById("nilaiStudentId");
const nilaiStudentSearch = document.getElementById("nilaiStudentSearch");
const nilaiClassName = document.getElementById("nilaiClassName");
const nilaiGuruId = document.getElementById("nilaiGuruId");
const nilaiSubject = document.getElementById("nilaiSubject");
const nilaiTask = document.getElementById("nilaiTask");
const nilaiUts = document.getElementById("nilaiUts");
const nilaiUas = document.getElementById("nilaiUas");
const nilaiAverage = document.getElementById("nilaiAverage");
const saveNilaiBtn = document.getElementById("saveNilaiBtn");
const totalNilaiCard = document.getElementById("totalNilaiCard");
const nilaiTertinggiCard = document.getElementById("nilaiTertinggiCard");
const nilaiTerendahCard = document.getElementById("nilaiTerendahCard");
const rataAkademikCard = document.getElementById("rataAkademikCard");

let currentPage = 1;
let selectedNilaiId = null;
const rowsPerPage = 5;

/* =========================
   HELPER
========================== */

function getStudentById(studentId) {
  return students.find((student) => student.id === Number(studentId));
}

function getGuruById(guruId) {
  return guru.find((item) => item.id === Number(guruId));
}

function getKelasById(classId) {
  return kelas.find((item) => item.id === Number(classId));
}

function getKelasByGuruId(guruId) {
  return kelas.find((item) => Number(item.guruId) === Number(guruId));
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

function getAllowedHomeroomGuru() {
  const homeroomGuru = getHomeroomGuruData();

  if (!isWaliKelasRole()) {
    return homeroomGuru;
  }

  return homeroomGuru.filter(
    (item) => getKelasByGuruId(item.id)?.id === waliKelasClassId,
  );
}

function getHomeroomGuruData() {
  return guru.filter(
    (item) => isHomeroomGuru(item) && getKelasByGuruId(item.id),
  );
}

function getAvailableSubjects() {
  const subjectSet = new Set();

  guru.forEach((item) => {
    const subject = item.subject?.trim();

    if (!subject || subject === "-") return;

    subjectSet.add(subject);
  });

  return [...subjectSet].sort((firstSubject, secondSubject) =>
    firstSubject.localeCompare(secondSubject),
  );
}

function getSelectedHomeroomClass() {
  if (isWaliKelasRole()) {
    return getKelasById(waliKelasClassId);
  }

  return getKelasByGuruId(nilaiGuruId.value);
}

function getNilaiStudent(item) {
  return getStudentById(item.studentId);
}

function getNilaiGuru(item) {
  return getGuruById(item.guruId);
}

function getNilaiKelas(item) {
  return getKelasById(item.classId);
}

function getNilaiStudentName(item) {
  return getNilaiStudent(item)?.name || "-";
}

function getNilaiGuruName(item) {
  return getNilaiGuru(item)?.name || "-";
}

function getNilaiClassName(item) {
  return getNilaiKelas(item)?.name || "-";
}

function isScoreValid(value) {
  const score = Number(value);

  return value !== "" && Number.isFinite(score) && score >= 0 && score <= 100;
}

function isDuplicateNilai({ studentId, classId, subject }, ignoredId = null) {
  return nilai.some(
    (item) =>
      item.id !== ignoredId &&
      Number(item.studentId) === Number(studentId) &&
      Number(item.classId) === Number(classId) &&
      item.subject === subject,
  );
}

function sanitizeScoreInput(input) {
  input.value = input.value.replace(/[^\d.]/g, "");

  const score = Number(input.value);

  if (input.value && score > 100) {
    input.value = "100";
  }
}

function getCurrentAverage() {
  if (
    !isScoreValid(nilaiTask.value) ||
    !isScoreValid(nilaiUts.value) ||
    !isScoreValid(nilaiUas.value)
  ) {
    return "";
  }

  return calculateAverageScore(nilaiTask.value, nilaiUts.value, nilaiUas.value);
}

function updateAveragePreview() {
  nilaiAverage.value = getCurrentAverage();
}

function getStudentsByClassId(classId) {
  return students.filter(
    (student) => getStudentClassId(student, kelas) === Number(classId),
  );
}

function getFilteredStudentsBySelectedClass() {
  const selectedKelas = getSelectedHomeroomClass();
  const keyword = nilaiStudentSearch.value.trim().toLowerCase();

  if (!selectedKelas) return [];

  return getStudentsByClassId(selectedKelas.id).filter((student) =>
    student.name.toLowerCase().includes(keyword),
  );
}

function updateSelectedGuruClass() {
  const selectedKelas = getSelectedHomeroomClass();

  nilaiClassName.value = selectedKelas ? selectedKelas.name : "";
  nilaiStudentSearch.disabled = !selectedKelas;
  nilaiStudentId.disabled = !selectedKelas;
}

function migrateLegacyStudentClassData() {
  if (migrateStudentClassIds(students, kelas)) {
    saveStudentData();
  }
}

function getAverageScores() {
  return nilai
    .filter(isAllowedNilaiItem)
    .map((item) =>
      calculateAverageScore(item.taskScore, item.utsScore, item.uasScore),
    );
}

function formatScore(value) {
  return Number.isInteger(value) ? value : value.toFixed(1);
}

function renderSummaryCards() {
  const averages = getAverageScores();
  const visibleNilai = nilai.filter(isAllowedNilaiItem);

  totalNilaiCard.textContent = visibleNilai.length;

  if (!averages.length) {
    nilaiTertinggiCard.textContent = "-";
    nilaiTerendahCard.textContent = "-";
    rataAkademikCard.textContent = "-";
    return;
  }

  const highestScore = Math.max(...averages);
  const lowestScore = Math.min(...averages);
  const academicAverage =
    averages.reduce((total, score) => total + score, 0) / averages.length;

  nilaiTertinggiCard.textContent = formatScore(highestScore);
  nilaiTerendahCard.textContent = formatScore(lowestScore);
  rataAkademikCard.textContent = formatScore(
    Math.round(academicAverage * 10) / 10,
  );
}

/* =========================
   DROPDOWN
========================== */

function renderFilterDropdowns() {
  const classOptions = getAllowedKelasOptions()
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");

  filterClass.innerHTML = `
    <option value="">${isWaliKelasRole() ? "Kelas Anda" : "Semua Kelas"}</option>
    ${classOptions}
  `;

  if (isWaliKelasRole()) {
    filterClass.value = waliKelasClassId;
    filterClass.disabled = true;
    filterClass.hidden = true;
    filterClass.style.display = "none";
  } else {
    filterClass.disabled = false;
    filterClass.hidden = false;
    filterClass.style.display = "";
  }
}

function renderStudentDropdown(selectedStudentId = "") {
  const selectedKelas = getSelectedHomeroomClass();
  const filteredStudents = getFilteredStudentsBySelectedClass();

  if (!selectedKelas) {
    nilaiStudentId.innerHTML = `
      <option value="">Pilih wali kelas terlebih dahulu</option>
    `;
    return;
  }

  if (!filteredStudents.length) {
    nilaiStudentId.innerHTML = `
      <option value="">Belum ada data</option>
    `;
    return;
  }

  nilaiStudentId.innerHTML = `
    <option value="">Pilih siswa</option>
    ${filteredStudents
      .map(
        (student) => `<option value="${student.id}">${student.name}</option>`,
      )
      .join("")}
  `;

  nilaiStudentId.value = selectedStudentId;
}

function renderSubjectDropdown(selectedSubject = "") {
  const subjects = getAvailableSubjects();

  if (!subjects.length) {
    nilaiSubject.innerHTML = `
      <option value="">Belum ada mata pelajaran</option>
    `;
    nilaiSubject.disabled = true;
    return;
  }

  nilaiSubject.disabled = false;
  nilaiSubject.innerHTML = `
    <option value="">Pilih mata pelajaran</option>
    ${subjects
      .map((subject) => `<option value="${subject}">${subject}</option>`)
      .join("")}
  `;
  nilaiSubject.value = selectedSubject;
}

function renderFormDropdowns() {
  const homeroomGuru = getAllowedHomeroomGuru();
  const subjects = getAvailableSubjects();

  nilaiGuruId.innerHTML = `
    <option value="">Pilih wali kelas</option>
    ${homeroomGuru
      .map((item) => {
        const assignedKelas = getKelasByGuruId(item.id);

        return `<option value="${item.id}">${item.name} - Wali ${assignedKelas?.name || "-"}</option>`;
      })
      .join("")}
  `;

  const hasRelationData =
    students.length && homeroomGuru.length && kelas.length && subjects.length;

  nilaiStudentSearch.disabled = true;
  nilaiStudentId.disabled = true;
  nilaiGuruId.disabled = !homeroomGuru.length;
  saveNilaiBtn.disabled = !hasRelationData;

  if (isWaliKelasRole() && homeroomGuru.length) {
    nilaiGuruId.value = String(homeroomGuru[0].id);
    nilaiGuruId.disabled = true;
  }

  if (isWaliKelasRole()) {
    nilaiGuruId.closest(".form-group").hidden = true;
    updateSelectedGuruClass();
  } else {
    nilaiGuruId.closest(".form-group").hidden = false;
  }

  renderStudentDropdown();
  renderSubjectDropdown();
}

/* =========================
   MODAL
========================== */

openNilaiModal.addEventListener("click", () => {
  selectedNilaiId = null;
  setNilaiModalMode("add");
  resetNilaiForm();
  renderFormDropdowns();
  nilaiModal.classList.add("show");
});

function hideModal() {
  nilaiModal.classList.remove("show");
}

function resetNilaiForm() {
  nilaiStudentId.value = "";
  nilaiStudentSearch.value = "";
  nilaiClassName.value = "";
  nilaiGuruId.value = "";
  nilaiSubject.value = "";
  nilaiTask.value = "";
  nilaiUts.value = "";
  nilaiUas.value = "";
  nilaiAverage.value = "";
}

function setNilaiModalMode(mode) {
  if (mode === "edit") {
    nilaiModalTitle.textContent = "Edit Nilai";
    nilaiModalDescription.textContent = "Ubah data nilai siswa";
    saveNilaiBtn.textContent = "Simpan Perubahan";
    return;
  }

  nilaiModalTitle.textContent = "Tambah Nilai";
  nilaiModalDescription.textContent = "Tambahkan data nilai siswa";
  saveNilaiBtn.textContent = "Simpan Nilai";
}

function fillNilaiForm(selectedNilai) {
  const currentHomeroomGuru = getAllowedHomeroomGuru()[0];

  nilaiGuruId.value =
    isWaliKelasRole() && currentHomeroomGuru
      ? currentHomeroomGuru.id
      : selectedNilai.guruId;
  nilaiStudentSearch.value = "";
  updateSelectedGuruClass();
  renderStudentDropdown(selectedNilai.studentId);
  renderSubjectDropdown(selectedNilai.subject);
  nilaiTask.value = selectedNilai.taskScore;
  nilaiUts.value = selectedNilai.utsScore;
  nilaiUas.value = selectedNilai.uasScore;
  updateAveragePreview();
}

closeModal.addEventListener("click", hideModal);
closeModalBtn.addEventListener("click", hideModal);
cancelModal.addEventListener("click", hideModal);

nilaiGuruId.addEventListener("change", () => {
  nilaiStudentSearch.value = "";
  nilaiStudentId.value = "";
  updateSelectedGuruClass();
  renderStudentDropdown();
});

nilaiStudentSearch.addEventListener("input", () => {
  renderStudentDropdown();
});

[nilaiTask, nilaiUts, nilaiUas].forEach((input) => {
  input.addEventListener("input", () => {
    sanitizeScoreInput(input);
    updateAveragePreview();
  });
});

/* =========================
   SAVE NILAI
========================== */

saveNilaiBtn.addEventListener("click", async () => {
  const selectedStudent = getStudentById(nilaiStudentId.value);
  const selectedGuru = getGuruById(nilaiGuruId.value);
  const selectedKelas = getSelectedHomeroomClass();
  const classId = selectedKelas ? selectedKelas.id : null;
  const studentClassId = selectedStudent
    ? getStudentClassId(selectedStudent, kelas)
    : null;

  if (
    !selectedStudent ||
    !selectedGuru ||
    !classId ||
    !nilaiSubject.value ||
    !nilaiTask.value ||
    !nilaiUts.value ||
    !nilaiUas.value
  ) {
    showToast({
      type: "error",
      title: "Data belum lengkap",
      message:
        "Siswa, kelas, guru, mapel, nilai tugas, UTS, dan UAS wajib diisi.",
    });

    return;
  }

  if (studentClassId !== classId) {
    showToast({
      type: "warning",
      title: "Siswa tidak sesuai kelas",
      message: "Pilih siswa dari kelas wali yang sedang dipilih.",
    });

    return;
  }

  if (
    !isScoreValid(nilaiTask.value) ||
    !isScoreValid(nilaiUts.value) ||
    !isScoreValid(nilaiUas.value)
  ) {
    showToast({
      type: "warning",
      title: "Nilai tidak valid",
      message: "Nilai tugas, UTS, dan UAS harus berada di rentang 0 - 100.",
    });

    return;
  }

  const nilaiData = {
    studentId: selectedStudent.id,
    guruId: selectedGuru.id,
    classId,
    subject: nilaiSubject.value,
    taskScore: Number(nilaiTask.value),
    utsScore: Number(nilaiUts.value),
    uasScore: Number(nilaiUas.value),
  };

  const isEditMode = Boolean(selectedNilaiId);

  if (isDuplicateNilai(nilaiData, isEditMode ? selectedNilaiId : null)) {
    showToast({
      type: "warning",
      title: "Nilai duplikat",
      message: "Nilai siswa untuk mata pelajaran ini sudah ada",
    });

    return;
  }

  try {
    if (isEditMode) {
      await updateNilaiData(selectedNilaiId, nilaiData);
    } else {
      await createNilaiData(nilaiData);
      currentPage = 1;
    }
  } catch (error) {
    showToast({
      type: "error",
      title: "Gagal menyimpan data nilai",
      message:
        error?.message ||
        "Terjadi kesalahan saat menyimpan data nilai ke server.",
    });
    return;
  }

  renderSummaryCards();
  filterNilai();
  hideModal();

  selectedNilaiId = null;
  setNilaiModalMode("add");
  resetNilaiForm();

  showToast({
    type: "success",
    title: isEditMode ? "Data nilai diperbarui" : "Nilai berhasil ditambahkan",
    message: `${selectedStudent.name} sudah tersimpan di tabel nilai.`,
  });
});

/* =========================
   RENDER TABLE
========================== */

function renderNilai(data) {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="11" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((item, index) => {
    const averageScore = calculateAverageScore(
      item.taskScore,
      item.utsScore,
      item.uasScore,
    );

    tableBody.innerHTML += `
      <tr>
        <td>${start + index + 1}</td>
        <td>
          <div class="student-avatar">
            <i class="bi bi-journal-check"></i>
          </div>
        </td>
        <td>${getNilaiStudentName(item)}</td>
        <td>
          <span class="class-badge class-blue">${getNilaiClassName(item)}</span>
        </td>
        <td>${getNilaiGuruName(item)}</td>
        <td>${item.subject}</td>
        <td>${item.taskScore}</td>
        <td>${item.utsScore}</td>
        <td>${item.uasScore}</td>
        <td>
          <span class="status-badge badge-success">${averageScore}</span>
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
      filterNilai();
    });
  });
}

/* =========================
   SEARCH & FILTER
========================== */

searchInput.addEventListener("keyup", () => {
  currentPage = 1;
  filterNilai();
});

filterClass.addEventListener("change", () => {
  currentPage = 1;
  filterNilai();
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterClass.value = getCurrentRoleClassId() || "";
  currentPage = 1;
  filterNilai();
});

function isAllowedNilaiItem(item) {
  return !isWaliKelasRole() || Number(item.classId) === waliKelasClassId;
}

function filterNilai() {
  const keyword = searchInput.value.toLowerCase();
  const selectedClass = getCurrentRoleClassId() || Number(filterClass.value);

  const filtered = nilai.filter((item) => {
    if (!isAllowedNilaiItem(item)) return false;

    const studentName = getNilaiStudentName(item).toLowerCase();
    const guruName = getNilaiGuruName(item).toLowerCase();
    const className = getNilaiClassName(item).toLowerCase();
    const subject = item.subject.toLowerCase();

    const matchSearch =
      studentName.includes(keyword) ||
      guruName.includes(keyword) ||
      className.includes(keyword) ||
      subject.includes(keyword);

    const matchClass = !selectedClass || Number(item.classId) === selectedClass;

    return matchSearch && matchClass;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderNilai(filtered);
  renderPagination(filtered);
}

/* =========================
   ACTION
========================== */

tableBody.addEventListener("click", (event) => {
  const editButton = event.target.closest(".btn-edit");
  const deleteButton = event.target.closest(".btn-delete");

  if (editButton) {
    editNilai(Number(editButton.dataset.id));
    return;
  }

  if (!deleteButton) return;

  deleteNilai(Number(deleteButton.dataset.id));
});

function editNilai(id) {
  const selectedNilai = nilai.find((item) => item.id === id);

  if (!selectedNilai) return;
  if (!isAllowedNilaiItem(selectedNilai)) return;

  selectedNilaiId = id;
  setNilaiModalMode("edit");
  renderFormDropdowns();
  fillNilaiForm(selectedNilai);
  nilaiModal.classList.add("show");
}

function deleteNilai(id) {
  const nilaiIndex = nilai.findIndex((item) => item.id === id);

  if (nilaiIndex === -1) return;

  const selectedNilai = nilai[nilaiIndex];
  if (!isAllowedNilaiItem(selectedNilai)) return;

  showToast({
    type: "delete",
    title: "Hapus data nilai?",
    message: `Nilai ${getNilaiStudentName(selectedNilai)} akan dihapus dari tabel.`,
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
          const currentIndex = nilai.findIndex((item) => item.id === id);

          if (currentIndex === -1) return;
          if (!isAllowedNilaiItem(nilai[currentIndex])) return;

          try {
            await deleteNilaiData(id);
            renderSummaryCards();
            filterNilai();
          } catch (error) {
            showToast({
              type: "error",
              title: "Gagal menghapus data nilai",
              message:
                error?.message ||
                "Terjadi kesalahan saat menghapus data nilai dari server.",
            });
            return;
          }

          showToast({
            type: "success",
            title: "Data nilai dihapus",
            message: "Data nilai berhasil dihapus dari tabel.",
          });
        },
      },
    ],
  });
}

async function initNilaiPage() {
  await loadGuruData();
  await loadKelasData();
  await loadStudentData();
  await loadNilaiData();

  migrateLegacyStudentClassData();
  renderFilterDropdowns();
  renderFormDropdowns();
  renderSummaryCards();
  filterNilai();
  console.log("Nilai rendered");
}

initNilaiPage().catch((error) => {
  console.error("Gagal memuat halaman nilai", error);
  showToast({
    type: "error",
    title: "Gagal memuat data nilai",
    message: error?.message || "Data nilai gagal dimuat dari server.",
  });
});
