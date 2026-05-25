/* =========================
   STORAGE CONFIG
========================== */

export const GURU_STORAGE_KEY = "guruData";

export function isHomeroomGuru(item) {
  return (
    item?.role === "wali_kelas" ||
    item?.type === "Wali Kelas" ||
    item?.type === "Wali Kelas & Guru Mapel"
  );
}

function resolveGuruRole(item) {
  if (isHomeroomGuru(item)) return "wali_kelas";

  return item?.role || "guru";
}

/* =========================
   LOAD DATA
========================== */

function getStoredGuruData() {
  if (typeof localStorage === "undefined") return [];

  try {
    const storedData = localStorage.getItem(GURU_STORAGE_KEY);

    // kalau belum ada data
    if (!storedData) return [];

    const parsedData = JSON.parse(storedData);

    // pastikan array
    if (!Array.isArray(parsedData)) return [];

    // cleanup legacy field
    const normalizedData = parsedData.map((item) => {
      if (!Object.prototype.hasOwnProperty.call(item, "homeroomClass")) {
        item = { ...item };
      } else {
        const { homeroomClass, ...guruData } = item;
        item = guruData;
      }

      item.role = resolveGuruRole(item);
      item.username =
        item.username ||
        item.userName ||
        item.loginUsername ||
        item.accountUsername ||
        "";
      item.password =
        item.password ||
        item.pass ||
        item.loginPassword ||
        item.accountPassword ||
        "";

      return item;
    });

    // update storage jika ada legacy data atau missing fields
    localStorage.setItem(GURU_STORAGE_KEY, JSON.stringify(normalizedData));

    return normalizedData;
  } catch (error) {
    console.error("Gagal memuat data guru dari localStorage", error);

    return [];
  }
}

/* =========================
   STATE
========================== */

export const guru = getStoredGuruData();

/* =========================
   HELPER
========================== */

export function getHomeroomGuruData() {
  return guru.filter(isHomeroomGuru);
}

export function getGuruByUsername(username) {
  const normalizedUsername = username.trim().toLowerCase();

  return guru.find(
    (item) => String(item.username || "").trim().toLowerCase() === normalizedUsername,
  );
}

export function getGuruById(id) {
  return guru.find((item) => item.id === id);
}

/* =========================
   SAVE DATA
========================== */

export function saveGuruData() {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(GURU_STORAGE_KEY, JSON.stringify(guru));
  } catch (error) {
    console.error("Gagal menyimpan data guru ke localStorage", error);
  }
}
