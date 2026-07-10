import {
  getAllNilai,
  createNilai,
  updateNilai,
  deleteNilai,
} from "../services/nilaiService.js";

/* =========================
   STORAGE CONFIG
========================== */

export const NILAI_DATA_CHANGED_EVENT = "nilaiDataChanged";
export const nilai = [];

export async function loadNilaiData() {
  const data = await getAllNilai();
  nilai.splice(0, nilai.length, ...data);
  notifyNilaiDataChanged();
  return nilai;
}

export async function createNilaiData(nilaiData) {
  const created = await createNilai(nilaiData);

  if (Array.isArray(created) && created[0]) {
    nilai.unshift(created[0]);
    notifyNilaiDataChanged();
    return created[0];
  }

  return null;
}

export async function updateNilaiData(id, nilaiData) {
  const updated = await updateNilai(id, nilaiData);

  if (Array.isArray(updated) && updated[0]) {
    const index = nilai.findIndex((item) => item.id === id);

    if (index !== -1) {
      Object.assign(nilai[index], updated[0]);
    } else {
      nilai.unshift(updated[0]);
    }

    notifyNilaiDataChanged();
    return updated[0];
  }

  return null;
}

export async function deleteNilaiData(id) {
  await deleteNilai(id);

  const index = nilai.findIndex((item) => item.id === id);

  if (index !== -1) {
    nilai.splice(index, 1);
  }

  notifyNilaiDataChanged();
}

export function calculateAverageScore(taskScore, utsScore, uasScore) {
  const total = Number(taskScore) + Number(utsScore) + Number(uasScore);

  return Math.round((total / 3) * 100) / 100;
}

export function saveNilaiData() {
  notifyNilaiDataChanged();
}

function notifyNilaiDataChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(NILAI_DATA_CHANGED_EVENT, {
      detail: {
        nilai,
      },
    }),
  );
}
