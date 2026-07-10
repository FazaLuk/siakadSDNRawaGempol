import { supabase } from "../config/supabase.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";

function mapNilaiRecord(record) {
  return {
    id: record.id,
    studentId: record.siswa_id,
    guruId: record.guru_id,
    classId: record.kelas_id,
    subject: record.mata_pelajaran,
    taskScore: Number(record.nilai_tugas),
    utsScore: Number(record.nilai_uts),
    uasScore: Number(record.nilai_uas),
  };
}

function mapNilaiPayload(nilai) {
  return {
    siswa_id: nilai.studentId,
    guru_id: nilai.guruId,
    kelas_id: nilai.classId,
    mata_pelajaran: nilai.subject,
    nilai_tugas: nilai.taskScore,
    nilai_uts: nilai.utsScore,
    nilai_uas: nilai.uasScore,
  };
}

export async function getAllNilai() {
  return requestWithRetry(async () => {
    const { data, error } = await supabase
      .from("nilai")
      .select("*")
      .order("id");

    if (error) throw error;

    return data.map(mapNilaiRecord);
  });
}

export async function createNilai(nilai) {
  return requestWithRetry(async () => {
    const payload = mapNilaiPayload(nilai);
    const { data, error } = await supabase
      .from("nilai")
      .insert(payload)
      .select();

    if (error) throw error;

    return data.map(mapNilaiRecord);
  });
}

export async function updateNilai(id, nilai) {
  return requestWithRetry(async () => {
    const payload = mapNilaiPayload(nilai);
    const { data, error } = await supabase
      .from("nilai")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data.map(mapNilaiRecord);
  });
}

export async function deleteNilai(id) {
  return requestWithRetry(async () => {
    const { error } = await supabase.from("nilai").delete().eq("id", id);

    if (error) throw error;
  });
}
