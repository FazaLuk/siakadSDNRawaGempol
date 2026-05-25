/* =========================
   STORAGE CONFIG
========================== */

export const NILAI_STORAGE_KEY = "nilaiData";

/* =========================
   LOAD DATA
========================== */

function getStoredNilaiData() {
  if (typeof localStorage === "undefined") return [];

  try {
    const storedData = localStorage.getItem(NILAI_STORAGE_KEY);

    if (!storedData) return [];

    const parsedData = JSON.parse(storedData);

    if (!Array.isArray(parsedData)) return [];

    return parsedData;
  } catch (error) {
    console.error("Gagal memuat data nilai dari localStorage", error);

    return [];
  }
}

/* =========================
   STATE
========================== */

export const nilai = getStoredNilaiData();

/* =========================
   HELPER
========================== */

export function calculateAverageScore(taskScore, utsScore, uasScore) {
  const total = Number(taskScore) + Number(utsScore) + Number(uasScore);

  return Math.round((total / 3) * 100) / 100;
}

/* =========================
   SAVE DATA
========================== */

export function saveNilaiData() {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(NILAI_STORAGE_KEY, JSON.stringify(nilai));
  } catch (error) {
    console.error("Gagal menyimpan data nilai ke localStorage", error);
  }
}
