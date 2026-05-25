import {
  renderGenderChart,
  renderStudentChart,
  destroyGenderChart,
} from "../components/charts.js";
import {
  students,
  STUDENT_STORAGE_KEY,
  STUDENT_DATA_CHANGED_EVENT,
  countStudentsByClassId,
  syncStudentData,
  syncStudentDataFromStorageValue,
} from "../modules/students.js";
import { guru, getHomeroomGuruData } from "../modules/guru.js";
import { kelas, getActiveKelasData } from "../modules/kelas.js";
import {
  getGuruInfo,
  getRole,
  resolveWaliKelasClassId,
} from "../modules/auth.js";
import {
  calculateBantuanScore,
  getBantuanStatus,
} from "../modules/spkBantuan.js";

console.log("Dashboard page connected");

const totalStudents = document.getElementById("totalStudents");
const totalStudentsLabel = document.getElementById("totalStudentsLabel");
const totalStudentsExtra = document.getElementById("totalStudentsExtra");
const totalGuru = document.getElementById("totalGuru");
const totalActiveKelas = document.getElementById("totalActiveKelas");
const totalHomeroomGuru = document.getElementById("totalHomeroomGuru");
const maleStudents = document.getElementById("maleStudents");
const femaleStudents = document.getElementById("femaleStudents");
const dashboardTitle = document.getElementById("dashboardMainTitle");
const dashboardDescription = document.getElementById("dashboardMainDescription");
const studentChartTitle = document.getElementById("studentChartTitle");
const studentChartDescription = document.getElementById("studentChartDescription");
const waliMaleStudents = document.getElementById("waliMaleStudents");
const waliFemaleStudents = document.getElementById("waliFemaleStudents");
const waliMalePercent = document.getElementById("waliMalePercent");
const waliFemalePercent = document.getElementById("waliFemalePercent");
const waliBantuanLayak = document.getElementById("waliBantuanLayak");
const waliHeroClassName = document.getElementById("waliHeroClassName");
const waliHeroTeacher = document.getElementById("waliHeroTeacher");
const waliSummaryClassName = document.getElementById("waliSummaryClassName");
const waliSummaryLevel = document.getElementById("waliSummaryLevel");
const waliSummaryLabel = document.getElementById("waliSummaryLabel");
const waliSummaryStatus = document.getElementById("waliSummaryStatus");

const userRole = getRole();
let waliKelasClassId = resolveWaliKelasClassId();

function setTextContent(element, value) {
  if (!element) return;

  element.textContent = value;
}

function getPercent(value, total) {
  if (!total) return "0%";

  return `${Math.round((value / total) * 1000) / 10}%`;
}

function isWaliKelasDashboard() {
  return userRole === "wali_kelas";
}

function applyDashboardLayout() {
  document.body.classList.toggle("dashboard-role-wali", isWaliKelasDashboard());
  document.body.classList.toggle("dashboard-role-admin", !isWaliKelasDashboard());
}

function getStudentGenderCount(gender, sourceStudents) {
  return sourceStudents.filter((student) => student.gender === gender).length;
}

function getVisibleKelas() {
  if (!isWaliKelasDashboard() || !waliKelasClassId) return kelas;

  return kelas.filter((item) => Number(item.id) === Number(waliKelasClassId));
}

function getVisibleStudents() {
  if (!isWaliKelasDashboard() || !waliKelasClassId) {
    return isWaliKelasDashboard() ? [] : students;
  }

  return students.filter(
    (student) => countStudentsByClassId([student], kelas, waliKelasClassId) > 0,
  );
}

function getStudentsByClass() {
  const visibleKelas = getVisibleKelas();

  if (!visibleKelas.length) {
    return {
      labels: [],
      data: [],
    };
  }

  const sourceStudents = isWaliKelasDashboard() ? getVisibleStudents() : students;

  return {
    labels: visibleKelas.map((item) => item.name),
    data: visibleKelas.map((item) =>
      countStudentsByClassId(sourceStudents, kelas, item.id),
    ),
  };
}

function getLayakBantuanCount(sourceStudents) {
  return sourceStudents.filter(
    (student) => getBantuanStatus(calculateBantuanScore(student)) === "Layak",
  ).length;
}

function updateWaliDashboardDetails(visibleKelas, visibleStudents) {
  const classData = visibleKelas[0];
  const { guruName } = getGuruInfo();
  const maleCount = getStudentGenderCount("Laki-laki", visibleStudents);
  const femaleCount = getStudentGenderCount("Perempuan", visibleStudents);
  const layakCount = getLayakBantuanCount(visibleStudents);
  const className = classData?.name || "Kelas";

  setTextContent(waliHeroClassName, className);
  setTextContent(waliHeroTeacher, guruName || "Wali Kelas");
  setTextContent(waliSummaryClassName, className);
  setTextContent(waliSummaryLevel, classData?.level || "-");
  setTextContent(waliSummaryLabel, classData?.label || "-");
  setTextContent(waliSummaryStatus, classData?.status || "-");

  setTextContent(waliMaleStudents, maleCount);
  setTextContent(waliFemaleStudents, femaleCount);
  setTextContent(waliBantuanLayak, layakCount);
  setTextContent(
    waliMalePercent,
    `${getPercent(maleCount, visibleStudents.length)} dari kelas`,
  );
  setTextContent(
    waliFemalePercent,
    `${getPercent(femaleCount, visibleStudents.length)} dari kelas`,
  );

  setTextContent(totalStudentsLabel, "Siswa di Kelas");
  setTextContent(totalStudentsExtra, `Rombel ${className}`);

  setTextContent(studentChartTitle, "Siswa di Kelas");
  setTextContent(
    studentChartDescription,
    "Distribusi jumlah siswa pada rombel yang sedang diampu.",
  );

  renderGenderChart(maleCount, femaleCount);
}

function updateAdminDashboardDetails(
  visibleStudents,
  activeKelas,
  homeroomGuru,
) {
  setTextContent(totalStudentsLabel, "Total Siswa");
  setTextContent(totalStudentsExtra, "Data siswa tersimpan");
  setTextContent(studentChartTitle, "Statistik Siswa");
  setTextContent(
    studentChartDescription,
    "Jumlah siswa per kelas untuk melihat distribusi data secara cepat.",
  );

  setTextContent(totalGuru, guru.length);
  setTextContent(totalActiveKelas, activeKelas.length);
  setTextContent(totalHomeroomGuru, homeroomGuru.length);
  destroyGenderChart();
}

function renderDashboard() {
  waliKelasClassId = resolveWaliKelasClassId();
  applyDashboardLayout();

  const visibleStudents = getVisibleStudents();
  const visibleKelas = getVisibleKelas();
  const activeKelas = getActiveKelasData().filter((item) =>
    visibleKelas.some((kelasItem) => Number(kelasItem.id) === Number(item.id)),
  );
  const homeroomGuru = getHomeroomGuruData();
  const maleStudentCount = getStudentGenderCount(
    "Laki-laki",
    isWaliKelasDashboard() ? visibleStudents : students,
  );
  const femaleStudentCount = getStudentGenderCount(
    "Perempuan",
    isWaliKelasDashboard() ? visibleStudents : students,
  );
  const studentClassChart = getStudentsByClass();
  const waliClassName = visibleKelas[0]?.name || "kelas wali";

  if (isWaliKelasDashboard()) {
    if (waliKelasClassId) {
      setTextContent(dashboardTitle, `Dashboard ${waliClassName}`);
      setTextContent(
        dashboardDescription,
        "Informasi sekolah, visi-misi, dan ringkasan data rombel yang Anda ampu.",
      );
      updateWaliDashboardDetails(visibleKelas, visibleStudents);
    } else {
      setTextContent(dashboardTitle, "Dashboard Wali Kelas");
      setTextContent(
        dashboardDescription,
        "Belum ada kelas terhubung. Hubungkan guru ini di menu Data Kelas.",
      );
    }
  } else {
    setTextContent(dashboardTitle, "Dashboard Sekolah");
    setTextContent(
      dashboardDescription,
      "Ringkasan informasi penting sekolah dan data akademik yang dirancang agar mudah dibaca dan dapat diakses dengan cepat.",
    );
    updateAdminDashboardDetails(visibleStudents, activeKelas, homeroomGuru);
  }

  setTextContent(totalStudents, visibleStudents.length);
  setTextContent(maleStudents, maleStudentCount);
  setTextContent(femaleStudents, femaleStudentCount);

  renderStudentChart(studentClassChart.labels, studentClassChart.data, {
    compact: isWaliKelasDashboard(),
    colors: isWaliKelasDashboard()
      ? ["#2563eb", "#22c55e", "#f59e0b", "#a855f7"]
      : ["#2563eb", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899"],
  });
}

function handleStudentDataChange(nextStudents) {
  syncStudentData(nextStudents);
  renderDashboard();
}

window.addEventListener("storage", (event) => {
  if (event.key !== STUDENT_STORAGE_KEY) return;

  syncStudentDataFromStorageValue(event.newValue);
  renderDashboard();
});

window.addEventListener(STUDENT_DATA_CHANGED_EVENT, (event) => {
  handleStudentDataChange(event.detail?.students);
});

renderDashboard();
