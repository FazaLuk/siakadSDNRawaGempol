console.log("Laporan page connected");

import { kelas } from "../modules/kelas.js";
import { guru } from "../modules/guru.js";
import { isWaliKelasUser, resolveWaliKelasClassId } from "../modules/auth.js";
import {
  getAvailableSubjects,
  getBantuanBadgeClass,
  getFilteredEmptyMessage,
  getReportData,
  getReportEmptyMessage,
  getStatusBadgeClass,
  REPORT_TYPES,
} from "../modules/laporan.js";

/* =========================
   ELEMENT
========================== */

const reportType = document.getElementById("reportType");
const searchInput = document.getElementById("searchLaporan");
const filterClass = document.getElementById("filterClass");
const filterSubject = document.getElementById("filterSubject");
const filterMonth = document.getElementById("filterMonth");
const filterGender = document.getElementById("filterGender");
const filterBantuanStatus = document.getElementById("filterBantuanStatus");
const resetFilterBtn = document.querySelector(".filter-reset-btn");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const printPreviewBtn = document.getElementById("printPreviewBtn");
const tableHead = document.getElementById("laporanTableHead");
const tableBody = document.getElementById("laporanTableBody");
const pagination = document.getElementById("pagination");
const reportTitle = document.getElementById("reportTitle");
const reportDescription = document.getElementById("reportDescription");
const reportTotal = document.getElementById("reportTotal");
const reportClassName = document.getElementById("reportClassName");
const reportFilterCount = document.getElementById("reportFilterCount");

let currentPage = 1;
let currentFilteredData = [];
const rowsPerPage = 5;

const kopLogoPath = "../assets/images/logo_kab_tng.png";
const kopEndRow = 8;
const reportTitleRow = 10;
const reportInfoStartRow = 12;
const tableHeaderRow = 15;

const reportConfig = {
  [REPORT_TYPES.NILAI]: {
    title: "Laporan Nilai",
    shortTitle: "Nilai",
    description: "Preview nilai siswa berdasarkan kelas dan mata pelajaran",
    source: "nilaiData",
    fileNamePrefix: "laporan-nilai",
    sheetName: "Laporan Nilai",
  },
  [REPORT_TYPES.KEHADIRAN]: {
    title: "Laporan Kehadiran",
    shortTitle: "Kehadiran",
    description: "Preview absensi siswa berdasarkan kelas dan bulan",
    source: "kehadiranData",
    fileNamePrefix: "laporan-kehadiran",
    sheetName: "Laporan Kehadiran",
  },
  [REPORT_TYPES.SISWA]: {
    title: "Laporan Data Siswa",
    shortTitle: "Siswa",
    description: "Preview data siswa berdasarkan kelas dan jenis kelamin",
    source: "studentData",
    fileNamePrefix: "laporan-siswa",
    sheetName: "Laporan Siswa",
  },
  [REPORT_TYPES.BANTUAN]: {
    title: "Laporan SPK Bantuan",
    shortTitle: "SPK",
    description: "Preview ranking bantuan berdasarkan kelas dan status",
    source: "studentData",
    fileNamePrefix: "laporan-spk",
    sheetName: "Laporan SPK",
  },
};

/* =========================
   DROPDOWN
========================== */

const waliKelasClassId = resolveWaliKelasClassId();

function isWaliKelasRole() {
  return isWaliKelasUser();
}

function getAllowedKelasOptions() {
  return isWaliKelasRole()
    ? kelas.filter((item) => item.id === waliKelasClassId)
    : kelas;
}

function renderClassDropdown() {
  const classOptions = getAllowedKelasOptions()
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join("");

  filterClass.innerHTML = `
    <option value="">Pilih Kelas</option>
    ${classOptions}
  `;

  if (isWaliKelasRole()) {
    filterClass.value = waliKelasClassId;
    filterClass.disabled = true;
  } else {
    filterClass.disabled = false;
  }
}

function renderSubjectDropdown() {
  const subjects = getAvailableSubjects();

  filterSubject.innerHTML = `
    <option value="">Semua Mata Pelajaran</option>
    ${subjects
      .map((subject) => `<option value="${subject}">${subject}</option>`)
      .join("")}
  `;
}

/* =========================
   FILTER UI
========================== */

function hideDynamicFilters() {
  filterSubject.hidden = true;
  filterMonth.hidden = true;
  filterGender.hidden = true;
  filterBantuanStatus.hidden = true;
}

function updateDynamicFilters() {
  hideDynamicFilters();

  if (reportType.value === REPORT_TYPES.NILAI) {
    filterSubject.hidden = false;
  }

  if (reportType.value === REPORT_TYPES.KEHADIRAN) {
    filterMonth.hidden = false;
  }

  if (reportType.value === REPORT_TYPES.SISWA) {
    filterGender.hidden = false;
  }

  if (reportType.value === REPORT_TYPES.BANTUAN) {
    filterBantuanStatus.hidden = false;
  }
}

function resetDynamicFilterValues() {
  filterSubject.value = "";
  filterMonth.value = "";
  filterGender.value = "";
  filterBantuanStatus.value = "";
}

function updateReportHeader(totalData) {
  const selectedConfig = reportConfig[reportType.value];
  const selectedKelas = getSelectedKelas();
  const activeFilters = [
    searchInput.value.trim(),
    filterClass.value,
    filterSubject.value,
    filterMonth.value,
    filterGender.value,
    filterBantuanStatus.value,
  ].filter(Boolean).length;

  reportTitle.textContent = selectedConfig.shortTitle;
  reportDescription.textContent = selectedConfig.description;
  reportTotal.textContent = totalData;
  reportClassName.textContent = selectedKelas ? selectedKelas.name : "-";
  reportFilterCount.textContent = activeFilters;
}

function getSelectedKelas() {
  return kelas.find((item) => Number(item.id) === Number(filterClass.value));
}

function getGuruNameById(guruId, fallback = "-") {
  const selectedGuru = guru.find((item) => Number(item.id) === Number(guruId));

  return selectedGuru ? selectedGuru.name : fallback;
}

function getSelectedClassInfo() {
  const selectedKelas = getSelectedKelas();

  if (!selectedKelas) {
    return {
      className: "-",
      homeroomTeacher: "-",
    };
  }

  return {
    className: selectedKelas.name,
    homeroomTeacher: getGuruNameById(
      selectedKelas.guruId,
      selectedKelas.homeroomTeacher || "-",
    ),
  };
}

function getExportFileName(selectedConfig, className) {
  const classSlug = className
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[\\/:*?"<>|]+/g, "-");

  return `${selectedConfig.fileNamePrefix}-kelas-${classSlug}.xlsx`;
}

/* =========================
   TABLE TEMPLATE
========================== */

function renderTableHead() {
  const headMap = {
    [REPORT_TYPES.NILAI]: `
      <tr>
        <th>No</th>
        <th>Nama Siswa</th>
        <th>Kelas</th>
        <th>Mata Pelajaran</th>
        <th>Tugas</th>
        <th>UTS</th>
        <th>UAS</th>
        <th>Rata-rata</th>
      </tr>
    `,
    [REPORT_TYPES.KEHADIRAN]: `
      <tr>
        <th>No</th>
        <th>Nama Siswa</th>
        <th>Kelas</th>
        <th>Tanggal</th>
        <th>Status</th>
      </tr>
    `,
    [REPORT_TYPES.SISWA]: `
      <tr>
        <th>No</th>
        <th>NISN</th>
        <th>Nama Siswa</th>
        <th>Kelas</th>
        <th>Jenis Kelamin</th>
        <th>Penghasilan Orang Tua</th>
        <th>Status Rumah</th>
      </tr>
    `,
    [REPORT_TYPES.BANTUAN]: `
      <tr>
        <th>Ranking</th>
        <th>Nama Siswa</th>
        <th>Kelas</th>
        <th>Penghasilan Orang Tua</th>
        <th>Status Rumah</th>
        <th>Skor Akhir</th>
        <th>Status Bantuan</th>
      </tr>
    `,
  };

  tableHead.innerHTML = headMap[reportType.value];
}

function renderRow(item, index, start) {
  const rowNumber = start + index + 1;

  if (reportType.value === REPORT_TYPES.NILAI) {
    return `
      <tr>
        <td>${rowNumber}</td>
        <td>${item.studentName}</td>
        <td><span class="class-badge class-blue">${item.className}</span></td>
        <td>${item.subject}</td>
        <td>${item.taskScore}</td>
        <td>${item.utsScore}</td>
        <td>${item.uasScore}</td>
        <td><span class="status-badge badge-success">${item.averageScore}</span></td>
      </tr>
    `;
  }

  if (reportType.value === REPORT_TYPES.KEHADIRAN) {
    return `
      <tr>
        <td>${rowNumber}</td>
        <td>${item.studentName}</td>
        <td><span class="class-badge class-blue">${item.className}</span></td>
        <td>${item.date}</td>
        <td>
          <span class="status-badge ${getStatusBadgeClass(item.status)}">
            ${item.status}
          </span>
        </td>
      </tr>
    `;
  }

  if (reportType.value === REPORT_TYPES.SISWA) {
    return `
      <tr>
        <td>${rowNumber}</td>
        <td>${item.nisn || "-"}</td>
        <td>${item.name}</td>
        <td><span class="class-badge class-blue">${item.className}</span></td>
        <td>${item.gender || "-"}</td>
        <td><span class="income-badge income-orange">${item.income || "-"}</span></td>
        <td>${item.house || "-"}</td>
      </tr>
    `;
  }

  return `
    <tr>
      <td><span class="status-badge badge-info">#${rowNumber}</span></td>
      <td>${item.name}</td>
      <td><span class="class-badge class-blue">${item.className}</span></td>
      <td><span class="income-badge income-orange">${item.income || "-"}</span></td>
      <td>${item.house || "-"}</td>
      <td><span class="status-badge badge-info">${item.bantuanScore}</span></td>
      <td>
        <span class="status-badge ${getBantuanBadgeClass(item.bantuanStatus)}">
          ${item.bantuanStatus}
        </span>
      </td>
    </tr>
  `;
}

/* =========================
   RENDER TABLE
========================== */

function renderLaporan(data, hasReportData) {
  tableBody.innerHTML = "";
  renderTableHead();

  const columnCount = tableHead.querySelectorAll("th").length;
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  if (!hasReportData) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="${columnCount}" class="text-center">
          ${getReportEmptyMessage(reportType.value)}
        </td>
      </tr>
    `;
    return;
  }

  if (!paginatedData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="${columnCount}" class="text-center">
          ${getFilteredEmptyMessage(reportType.value)}
        </td>
      </tr>
    `;
    return;
  }

  paginatedData.forEach((item, index) => {
    tableBody.innerHTML += renderRow(item, index, start);
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
      filterLaporan();
    });
  });
}

/* =========================
   FILTER SYSTEM
========================== */

function matchKeyword(item, keyword) {
  if (!keyword) return true;

  return Object.values(item).some((value) =>
    String(value || "")
      .toLowerCase()
      .includes(keyword),
  );
}

function filterLaporan() {
  const keyword = searchInput.value.toLowerCase();
  const selectedClass = Number(filterClass.value);
  const selectedSubject = filterSubject.value;
  const selectedMonth = filterMonth.value;
  const selectedGender = filterGender.value;
  const selectedBantuanStatus = filterBantuanStatus.value;
  const sourceData = getReportData(reportType.value);

  if (!selectedClass) {
    currentFilteredData = [];
    updateReportHeader(0);
    renderTableHead();
    tableBody.innerHTML = `
      <tr>
        <td colspan="${tableHead.querySelectorAll("th").length}" class="text-center">
          Pilih kelas terlebih dahulu untuk menampilkan preview laporan
        </td>
      </tr>
    `;
    pagination.innerHTML = "";
    return;
  }

  const filtered = sourceData.filter((item) => {
    const matchSearch = matchKeyword(item, keyword);
    const matchClass = Number(item.classId) === selectedClass;
    const matchSubject =
      reportType.value !== REPORT_TYPES.NILAI ||
      !selectedSubject ||
      item.subject === selectedSubject;
    const matchMonth =
      reportType.value !== REPORT_TYPES.KEHADIRAN ||
      !selectedMonth ||
      item.date?.startsWith(selectedMonth);
    const matchGender =
      reportType.value !== REPORT_TYPES.SISWA ||
      !selectedGender ||
      item.gender === selectedGender;
    const matchBantuanStatus =
      reportType.value !== REPORT_TYPES.BANTUAN ||
      !selectedBantuanStatus ||
      item.bantuanStatus === selectedBantuanStatus;

    return (
      matchSearch &&
      matchClass &&
      matchSubject &&
      matchMonth &&
      matchGender &&
      matchBantuanStatus
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  currentFilteredData = filtered;
  updateReportHeader(filtered.length);
  renderLaporan(filtered, sourceData.length > 0);
  renderPagination(filtered);
}

/* =========================
   EXPORT EXCEL
========================== */

function getExportHeader() {
  const headerMap = {
    [REPORT_TYPES.NILAI]: [
      "No",
      "Nama Siswa",
      "Kelas",
      "Mata Pelajaran",
      "Tugas",
      "UTS",
      "UAS",
      "Rata-rata",
    ],
    [REPORT_TYPES.KEHADIRAN]: [
      "No",
      "Nama Siswa",
      "Kelas",
      "Tanggal",
      "Status",
    ],
    [REPORT_TYPES.SISWA]: [
      "No",
      "NISN",
      "Nama Siswa",
      "Kelas",
      "Jenis Kelamin",
      "Penghasilan Orang Tua",
      "Status Rumah",
    ],
    [REPORT_TYPES.BANTUAN]: [
      "Ranking",
      "Nama Siswa",
      "Kelas",
      "Penghasilan Orang Tua",
      "Status Rumah",
      "Skor Akhir",
      "Status Bantuan",
    ],
  };

  return headerMap[reportType.value];
}

function getExportRows(data) {
  if (reportType.value === REPORT_TYPES.NILAI) {
    return data.map((item, index) => [
      index + 1,
      item.studentName,
      item.className,
      item.subject,
      item.taskScore,
      item.utsScore,
      item.uasScore,
      item.averageScore,
    ]);
  }

  if (reportType.value === REPORT_TYPES.KEHADIRAN) {
    return data.map((item, index) => [
      index + 1,
      item.studentName,
      item.className,
      item.date,
      item.status,
    ]);
  }

  if (reportType.value === REPORT_TYPES.SISWA) {
    return data.map((item, index) => [
      index + 1,
      item.nisn || "-",
      item.name,
      item.className,
      item.gender || "-",
      item.income || "-",
      item.house || "-",
    ]);
  }

  return data.map((item, index) => [
    index + 1,
    item.name,
    item.className,
    item.income || "-",
    item.house || "-",
    item.bantuanScore,
    item.bantuanStatus,
  ]);
}

function getColumnLetter(columnNumber) {
  let letter = "";
  let currentNumber = columnNumber;

  while (currentNumber > 0) {
    const remainder = (currentNumber - 1) % 26;

    letter = String.fromCharCode(65 + remainder) + letter;
    currentNumber = Math.floor((currentNumber - 1) / 26);
  }

  return letter;
}

function downloadWorkbook(buffer, fileName) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function getImageBase64(imagePath) {
  return fetch(imagePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Gagal memuat logo kop sekolah.");
      }

      return response.blob();
    })
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }),
    );
}

function applySchoolLetterhead(workbook, worksheet, logoBase64) {
  const logoImageId = workbook.addImage({
    base64: logoBase64,
    extension: "png",
  });

  worksheet.addImage(logoImageId, {
    tl: { col: 0.2, row: 1.2 },

    ext: {
      width: 140,
      height: 140,
    },

    editAs: "oneCell",
  });

  const kopRows = [
    {
      row: 2,
      text: "PEMERINTAH KABUPATEN TANGERANG",
      size: 14,
      bold: true,
    },
    {
      row: 3,
      text: "DINAS PENDIDIKAN",
      size: 14,
      bold: true,
    },
    {
      row: 4,
      text: "SD N RAWA GEMPOL",
      size: 14,
      bold: true,
    },
    {
      row: 5,
      text: "NPSN:20602847, NSS:101280318010",
      size: 14,
      bold: true,
    },
    {
      row: 6,
      text: "Jl. Gaga Kecil, Gempol Sari, Kec. Sepatan Timur., Kab. Tangerang",
      size: 10,
      italic: true,
    },
    {
      row: 7,
      text: "Kode Pos (15521) Email: sdrawagempol@gmail.com",
      size: 10,
      italic: true,
    },
  ];

  kopRows.forEach((item) => {
    worksheet.mergeCells(`C${item.row}:H${item.row}`);
    worksheet.getCell(`C${item.row}`).value = item.text;
    worksheet.getCell(`C${item.row}`).font = {
      name: "Times New Roman",
      size: item.size,
      bold: Boolean(item.bold),
      italic: Boolean(item.italic),
    };
    worksheet.getCell(`C${item.row}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });

  for (let column = 1; column <= 8; column++) {
    worksheet.getCell(`${getColumnLetter(column)}${kopEndRow}`).border = {
      bottom: { style: "double" },
    };
  }
}

function applyWorksheetLayout(worksheet, columnCount) {
  const layoutColumnCount = Math.max(columnCount, 8);
  const tableLastColumn = getColumnLetter(columnCount);
  const reportLastColumn = getColumnLetter(layoutColumnCount);

  worksheet.columns = Array.from({ length: layoutColumnCount }, (_, index) => ({
    width: index === 0 ? 10 : 24,
  }));

  worksheet.getColumn(1).width = 8;
  worksheet.getColumn(2).width = 18;

  for (let rowNumber = 1; rowNumber <= tableHeaderRow; rowNumber++) {
    worksheet.getRow(rowNumber).height = 20;
  }

  worksheet.mergeCells(
    `A${reportTitleRow}:${reportLastColumn}${reportTitleRow}`,
  );
  worksheet.getRow(reportTitleRow).height = 24;
  worksheet.getCell(`A${reportTitleRow}`).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell(`A${reportTitleRow}`).font = {
    name: "Times New Roman",
    bold: true,
    size: 14,
  };

  worksheet.mergeCells(`A${reportInfoStartRow}:B${reportInfoStartRow}`);
  worksheet.mergeCells(
    `C${reportInfoStartRow}:${reportLastColumn}${reportInfoStartRow}`,
  );
  worksheet.mergeCells(`A${reportInfoStartRow + 1}:B${reportInfoStartRow + 1}`);
  worksheet.mergeCells(
    `C${reportInfoStartRow + 1}:${reportLastColumn}${reportInfoStartRow + 1}`,
  );

  [reportInfoStartRow, reportInfoStartRow + 1].forEach((rowNumber) => {
    worksheet.getRow(rowNumber).eachCell((cell) => {
      cell.font = { name: "Times New Roman", size: 11 };
      cell.alignment = { vertical: "middle" };
    });
  });

  worksheet.getRow(tableHeaderRow).height = 22;
  worksheet.getRow(tableHeaderRow).eachCell((cell) => {
    cell.font = { name: "Times New Roman", bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFF6FF" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= tableHeaderRow) return;

    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle" };
      cell.font = {
        name: "Times New Roman",
        size: 11,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  worksheet.autoFilter = {
    from: `A${tableHeaderRow}`,
    to: `${tableLastColumn}${tableHeaderRow}`,
  };
}

async function exportLaporanExcel() {
  const ExcelJS = window.ExcelJS;

  if (!ExcelJS) {
    alert(
      "Library ExcelJS belum termuat. Periksa koneksi internet lalu coba lagi.",
    );
    return;
  }

  if (!filterClass.value) {
    alert("Pilih satu kelas terlebih dahulu sebelum export laporan.");
    return;
  }

  exportExcelBtn.disabled = true;
  exportExcelBtn.innerHTML = `
    <i class="bi bi-hourglass-split"></i>
    Menyiapkan Excel
  `;

  try {
    const selectedConfig = reportConfig[reportType.value];
    const classInfo = getSelectedClassInfo();
    const exportHeader = getExportHeader();
    const exportRows = getExportRows(currentFilteredData);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(selectedConfig.sheetName);
    const logoBase64 = await getImageBase64(kopLogoPath);

    worksheet.getCell(`A${reportTitleRow}`).value = selectedConfig.title;
    worksheet.getCell(`A${reportInfoStartRow}`).value = "Wali Kelas";
    worksheet.getCell(`C${reportInfoStartRow}`).value =
      `: ${classInfo.homeroomTeacher}`;
    worksheet.getCell(`A${reportInfoStartRow + 1}`).value = "Nama Kelas";
    worksheet.getCell(`C${reportInfoStartRow + 1}`).value =
      `: ${classInfo.className}`;
    worksheet.getRow(tableHeaderRow).values = exportHeader;

    exportRows.forEach((row, index) => {
      worksheet.getRow(tableHeaderRow + index + 1).values = row;
    });

    applyWorksheetLayout(worksheet, exportHeader.length);
    applySchoolLetterhead(workbook, worksheet, logoBase64);

    const buffer = await workbook.xlsx.writeBuffer();

    downloadWorkbook(
      buffer,
      getExportFileName(selectedConfig, classInfo.className),
    );
  } catch (error) {
    console.error("Gagal export laporan Excel", error);
    alert("Export Excel gagal. Pastikan gambar kop tersedia dan coba lagi.");
  } finally {
    exportExcelBtn.disabled = false;
    exportExcelBtn.innerHTML = `
      <i class="bi bi-file-earmark-excel-fill"></i>
      Export Excel
    `;
  }
}

reportType.addEventListener("change", () => {
  currentPage = 1;
  searchInput.value = "";
  resetDynamicFilterValues();
  updateDynamicFilters();
  filterLaporan();
});

[
  searchInput,
  filterClass,
  filterSubject,
  filterMonth,
  filterGender,
  filterBantuanStatus,
].forEach((input) => {
  input.addEventListener("input", () => {
    currentPage = 1;
    filterLaporan();
  });

  input.addEventListener("change", () => {
    currentPage = 1;
    filterLaporan();
  });
});

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  resetDynamicFilterValues();
  currentPage = 1;
  filterLaporan();
});

exportExcelBtn.addEventListener("click", exportLaporanExcel);

printPreviewBtn.addEventListener("click", () => {
  window.print();
});

renderClassDropdown();
renderSubjectDropdown();
updateDynamicFilters();
filterLaporan();

console.log("Laporan rendered");
