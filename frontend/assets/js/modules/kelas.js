import {
  getAllKelas,
  createKelas,
  updateKelas,
  deleteKelas,
} from "../services/kelasService.js";

/* =========================
   STORAGE CONFIG
========================== */

export const KELAS_DATA_CHANGED_EVENT = "kelasDataChanged";
export const kelas = [];

/* =========================
   HELPERS
========================== */

export function isKelasActive(item) {
  const status = String(item?.status ?? "Aktif")
    .trim()
    .toLowerCase();

  return status === "aktif" || status === "active";
}

export function reloadKelasFromStorage() {
  return kelas;
}

export function getActiveKelasData() {
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
        String(item.homeroomTeacher || "")
          .trim()
          .toLowerCase() === String(guru.name).trim().toLowerCase()),
  );

  if (!matchedKelas) return null;

  matchedKelas.guruId = guru.id;
  delete matchedKelas.homeroomTeacher;
  updateKelasData(matchedKelas.id, matchedKelas).catch((error) => {
    console.error("Gagal menghubungkan guru ke kelas", error);
  });

  return matchedKelas.id;
}

/* =========================
   STATE
========================== */

export async function loadKelasData() {
  const data = await getAllKelas();
  kelas.splice(0, kelas.length, ...data);
  notifyKelasDataChanged();
  return kelas;
}

export async function createKelasData(kelasData) {
  const created = await createKelas(kelasData);

  if (Array.isArray(created) && created[0]) {
    kelas.unshift(created[0]);
    notifyKelasDataChanged();
    return created[0];
  }

  return null;
}

export async function updateKelasData(id, kelasData) {
  const updated = await updateKelas(id, kelasData);

  if (Array.isArray(updated) && updated[0]) {
    const index = kelas.findIndex((item) => item.id === id);

    if (index !== -1) {
      Object.assign(kelas[index], updated[0]);
    } else {
      kelas.unshift(updated[0]);
    }

    notifyKelasDataChanged();
    return updated[0];
  }

  return null;
}

export async function deleteKelasData(id) {
  await deleteKelas(id);

  const index = kelas.findIndex((item) => item.id === id);

  if (index !== -1) {
    kelas.splice(index, 1);
  }

  notifyKelasDataChanged();
}

export function saveKelasData() {
  notifyKelasDataChanged();
}

function notifyKelasDataChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(KELAS_DATA_CHANGED_EVENT, {
      detail: {
        kelas,
      },
    }),
  );
}
