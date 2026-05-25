import {
  getStudentClassName,
  STUDENT_STORAGE_KEY,
  students,
  syncStudentDataFromStorageValue,
} from "./students.js";

/* =========================
   SCORING CONFIG
========================== */

const INCOME_WEIGHT = 0.7;
const HOUSE_WEIGHT = 0.3;

/* =========================
   SCORE HELPER
========================== */

export function getIncomeScore(income) {
  const normalizedIncome = String(income || "").toLowerCase();

  if (normalizedIncome.includes("<") || normalizedIncome.includes("1 juta")) {
    return normalizedIncome.includes(">")
      ? 40
      : normalizedIncome.includes("2") || normalizedIncome.includes("3")
        ? 70
        : 100;
  }

  if (
    normalizedIncome.includes("1 - 2") ||
    normalizedIncome.includes("2 - 3") ||
    normalizedIncome.includes("1 - 3")
  ) {
    return 70;
  }

  if (normalizedIncome.includes(">") || normalizedIncome.includes("3 juta")) {
    return 40;
  }

  return 40;
}

export function getHouseScore(house) {
  const normalizedHouse = String(house || "").toLowerCase();

  if (
    normalizedHouse.includes("kontrak") ||
    normalizedHouse.includes("ngontrak")
  ) {
    return 100;
  }

  if (normalizedHouse.includes("menumpang")) return 90;

  if (normalizedHouse.includes("milik sendiri")) return 50;

  return 50;
}

export function calculateBantuanScore(student) {
  const incomeScore = getIncomeScore(student.income);
  const houseScore = getHouseScore(student.house);

  return Math.round(incomeScore * INCOME_WEIGHT + houseScore * HOUSE_WEIGHT);
}

export function getBantuanStatus(score) {
  if (score >= 80) return "Layak";

  if (score >= 60) return "Dipertimbangkan";

  return "Tidak Prioritas";
}

export function getBantuanStatusBadge(status) {
  if (status === "Layak") return "badge-success";

  if (status === "Dipertimbangkan") return "badge-warning";

  return "badge-danger";
}

export function syncBantuanStudentData(event) {
  if (event.key !== STUDENT_STORAGE_KEY) return;

  syncStudentDataFromStorageValue(event.newValue);
}

export function getBantuanRanking(kelasData) {
  return students
    .map((student) => {
      const score = calculateBantuanScore(student);

      return {
        ...student,
        className: getStudentClassName(student, kelasData),
        bantuanScore: score,
        bantuanStatus: getBantuanStatus(score),
      };
    })
    .sort((firstStudent, secondStudent) => {
      if (secondStudent.bantuanScore !== firstStudent.bantuanScore) {
        return secondStudent.bantuanScore - firstStudent.bantuanScore;
      }

      return firstStudent.name.localeCompare(secondStudent.name);
    })
    .map((student, index) => ({
      ...student,
      ranking: index + 1,
    }));
}
