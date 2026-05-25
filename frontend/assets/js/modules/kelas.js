/* =========================
   STORAGE CONFIG
========================== */

export const KELAS_STORAGE_KEY = "kelasData";

/* =========================
   LOAD DATA
========================== */

function getStoredKelasData() {
  if (typeof localStorage === "undefined") return [];

  try {
    const storedData = localStorage.getItem(KELAS_STORAGE_KEY);

    // kalau belum ada data
    if (!storedData) return [];

    const parsedData = JSON.parse(storedData);

    // pastikan array
    if (!Array.isArray(parsedData)) return [];

    return parsedData;
  } catch (error) {
    console.error("Gagal memuat data kelas dari localStorage", error);

    return [];
  }
}

/* =========================
   STATE
========================== */

export const kelas = getStoredKelasData();

/* =========================
   HELPER
========================== */

export function isKelasActive(item) {
  const status = String(item?.status ?? "Aktif").trim().toLowerCase();

  return status === "aktif" || status === "active";
}

export function reloadKelasFromStorage() {
  const freshData = getStoredKelasData();

  kelas.splice(0, kelas.length, ...freshData);

  return kelas;
}

export function getActiveKelasData() {
  reloadKelasFromStorage();

  return kelas.filter(isKelasActive);
}

export function getKelasIdByGuruId(guruId) {
  if (!guruId) return null;

  return (
    kelas.find((item) => Number(item.guruId) === Number(guruId))?.id || null
  );
}

export function linkGuruToKelasByName(guru) {
  if (!guru?.id || !guru?.name) return null;

  const existingClassId = getKelasIdByGuruId(guru.id);
  if (existingClassId) return existingClassId;

  const matchedKelas = kelas.find(
    (item) =>
      !item.guruId &&
      (item.homeroomTeacher === guru.name ||
        String(item.homeroomTeacher || "").trim().toLowerCase() ===
          String(guru.name).trim().toLowerCase()),
  );

  if (!matchedKelas) return null;

  matchedKelas.guruId = guru.id;
  delete matchedKelas.homeroomTeacher;
  saveKelasData();

  return matchedKelas.id;
}

/* =========================
   SAVE DATA
========================== */

export function saveKelasData() {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(KELAS_STORAGE_KEY, JSON.stringify(kelas));
  } catch (error) {
    console.error("Gagal menyimpan data kelas ke localStorage", error);
  }
}
