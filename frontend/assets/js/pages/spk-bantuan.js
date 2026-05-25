console.log("SPK Bantuan page connected");

import { getActiveKelasData } from "../modules/kelas.js";
import { getStudentClassId } from "../modules/students.js";
import {
  getBantuanRanking,
  getBantuanStatusBadge,
  syncBantuanStudentData,
} from "../modules/spkBantuan.js";

/* =========================
   ELEMENT
========================== */

const tableBody = document.getElementById("spkBantuanTableBody");
const searchInput = document.getElementById("searchSpkBantuan");
const filterClass = document.getElementById("filterClass");
const filterStatus = document.getElementById("filterStatus");
const resetFilterBtn = document.querySelector(".filter-reset-btn");
const pagination = document.getElementById("pagination");
const totalSiswaText = document.getElementById("totalSiswaText");
const layakCount = document.getElementById("layakCount");
const dipertimbangkanCount = document.getElementById("dipertimbangkanCount");
const tidakPrioritasCount = document.getElementById("tidakPrioritasCount");

let currentPage = 1;
const rowsPerPage = 5;
const activeKelas = getActiveKelasData();

/* =========================
   DROPDOWN
========================== */

function renderClassDropdown() {
  filterClass.innerHTML = `
    <option value="">Semua Kelas</option>
    ${activeKelas
      .map((item) => `<option value="${item.id}">${item.name}</option>`)
      .join("")}
  `;
}

/* =========================
   RENDER STATS
========================== */

function renderStats(data) {
  const layakTotal = data.filter((item) => item.bantuanStatus === "Layak").length;
  const dipertimbangkanTotal = data.filter(
    (item) => item.bantuanStatus === "Dipertimbangkan"
  ).length;
  const tidakPrioritasTotal = data.filter(
    (item) => item.bantuanStatus === "Tidak Prioritas"
  ).length;

  totalSiswaText.textContent = data.length;
  layakCount.textContent = layakTotal;
  dipertimbangkanCount.textContent = dipertimbangkanTotal;
  tidakPrioritasCount.textContent = tidakPrioritasTotal;
}

/* =========================
   RENDER TABLE
========================== */

function renderBantuan(data, hasStudentData) {
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!hasStudentData) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Belum ada data</td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((student) => {
    tableBody.innerHTML += `
      <tr>
        <td>
          <span class="status-badge badge-info">#${student.ranking}</span>
        </td>
        <td>${student.name}</td>
        <td>
          <span class="class-badge class-blue">${student.className}</span>
        </td>
        <td>
          <span class="income-badge income-orange">${student.income || "-"}</span>
        </td>
        <td>${student.house || "-"}</td>
        <td>
          <span class="status-badge badge-info">${student.bantuanScore}</span>
        </td>
        <td>
          <span class="status-badge ${getBantuanStatusBadge(student.bantuanStatus)}">
            ${student.bantuanStatus}
          </span>
        </td>
      </tr>
    `;
  });
}

/* =========================
   PAGINATION
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
      filterBantuan();
    });
  });
}

/* =========================
   FILTER SYSTEM
========================== */

function filterBantuan() {
  const keyword = searchInput.value.toLowerCase();
  const selectedClass = Number(filterClass.value);
  const selectedStatus = filterStatus.value;
  const rankingData = getBantuanRanking(activeKelas);

  const filtered = rankingData.filter((student) => {
    const matchSearch = student.name.toLowerCase().includes(keyword);
    const matchClass =
      !selectedClass || getStudentClassId(student, activeKelas) === selectedClass;
    const matchStatus =
      !selectedStatus || student.bantuanStatus === selectedStatus;

    return matchSearch && matchClass && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderStats(rankingData);
  renderBantuan(filtered, rankingData.length > 0);
  renderPagination(filtered);
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  filterBantuan();
});

filterClass.addEventListener("change", () => {
  currentPage = 1;
  filterBantuan();
});

filterStatus.addEventListener("change", () => {
  currentPage = 1;
  filterBantuan();
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterClass.value = "";
  filterStatus.value = "";
  currentPage = 1;
  filterBantuan();
});

window.addEventListener("storage", (event) => {
  syncBantuanStudentData(event);
  currentPage = 1;
  filterBantuan();
});

renderClassDropdown();
filterBantuan();

console.log("SPK Bantuan rendered");
