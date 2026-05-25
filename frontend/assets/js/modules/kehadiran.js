/* =========================
   STORAGE CONFIG
========================== */

export const KEHADIRAN_STORAGE_KEY = "kehadiranData";

/* =========================
   LOAD DATA
========================== */

function getStoredKehadiranData() {
  if (typeof localStorage === "undefined") return [];

  try {
    const storedData = localStorage.getItem(KEHADIRAN_STORAGE_KEY);

    if (!storedData) return [];

    const parsedData = JSON.parse(storedData);

    if (!Array.isArray(parsedData)) return [];

    return parsedData;
  } catch (error) {
    console.error("Gagal memuat data kehadiran dari localStorage", error);

    return [];
  }
}

/* =========================
   STATE
========================== */

export const kehadiran = getStoredKehadiranData();

/* =========================
   SAVE DATA
========================== */

export function saveKehadiranData() {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(KEHADIRAN_STORAGE_KEY, JSON.stringify(kehadiran));
  } catch (error) {
    console.error("Gagal menyimpan data kehadiran ke localStorage", error);
  }
}
