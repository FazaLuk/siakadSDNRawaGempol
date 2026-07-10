import {
  getAllGuru,
  createGuru,
  updateGuru,
  deleteGuru,
} from "../services/guruService.js";

/* =========================
   STORAGE CONFIG
========================== */

export const GURU_DATA_CHANGED_EVENT = "guruDataChanged";
export const guru = [];

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

export async function loadGuruData() {
  const data = await getAllGuru();
  guru.splice(0, guru.length, ...data);
  notifyGuruDataChanged();
  return guru;
}

export async function createGuruData(guruData) {
  const created = await createGuru(guruData);

  if (Array.isArray(created) && created[0]) {
    guru.unshift(created[0]);
    notifyGuruDataChanged();
    return created[0];
  }

  return null;
}

export async function updateGuruData(id, guruData) {
  const updated = await updateGuru(id, guruData);

  if (Array.isArray(updated) && updated[0]) {
    const index = guru.findIndex((item) => item.id === id);

    if (index !== -1) {
      Object.assign(guru[index], updated[0]);
    } else {
      guru.unshift(updated[0]);
    }

    notifyGuruDataChanged();
    return updated[0];
  }

  return null;
}

export async function deleteGuruData(id) {
  await deleteGuru(id);

  const index = guru.findIndex((item) => item.id === id);

  if (index !== -1) {
    guru.splice(index, 1);
  }

  notifyGuruDataChanged();
}

export function getHomeroomGuruData() {
  return guru.filter(isHomeroomGuru);
}

export function getGuruByUsername(username) {
  const normalizedUsername = username.trim().toLowerCase();

  return guru.find(
    (item) =>
      String(item.username || "")
        .trim()
        .toLowerCase() === normalizedUsername,
  );
}

export function getGuruById(id) {
  return guru.find((item) => item.id === id);
}

export function saveGuruData() {
  notifyGuruDataChanged();
}

function notifyGuruDataChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(GURU_DATA_CHANGED_EVENT, {
      detail: {
        guru,
      },
    }),
  );
}
