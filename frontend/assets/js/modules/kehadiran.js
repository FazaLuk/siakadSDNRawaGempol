import {
  getAllKehadiran,
  createKehadiran,
  updateKehadiran,
  deleteKehadiran,
} from "../services/kehadiranService.js";

/* =========================
   STORAGE CONFIG
========================== */

export const KEHADIRAN_DATA_CHANGED_EVENT = "kehadiranDataChanged";
export const kehadiran = [];

export async function loadKehadiranData() {
  const data = await getAllKehadiran();
  kehadiran.splice(0, kehadiran.length, ...data);
  notifyKehadiranDataChanged();
  return kehadiran;
}

export async function createKehadiranData(kehadiranData) {
  const created = await createKehadiran(kehadiranData);

  if (Array.isArray(created) && created[0]) {
    kehadiran.unshift(created[0]);
    notifyKehadiranDataChanged();
    return created[0];
  }

  return null;
}

export async function updateKehadiranData(id, kehadiranData) {
  const updated = await updateKehadiran(id, kehadiranData);

  if (Array.isArray(updated) && updated[0]) {
    const index = kehadiran.findIndex((item) => item.id === id);

    if (index !== -1) {
      Object.assign(kehadiran[index], updated[0]);
    } else {
      kehadiran.unshift(updated[0]);
    }

    notifyKehadiranDataChanged();
    return updated[0];
  }

  return null;
}

export async function deleteKehadiranData(id) {
  await deleteKehadiran(id);

  const index = kehadiran.findIndex((item) => item.id === id);

  if (index !== -1) {
    kehadiran.splice(index, 1);
  }

  notifyKehadiranDataChanged();
}

export function saveKehadiranData() {
  notifyKehadiranDataChanged();
}

function notifyKehadiranDataChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(KEHADIRAN_DATA_CHANGED_EVENT, {
      detail: {
        kehadiran,
      },
    }),
  );
}
