import { supabase } from "../config/supabase.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";

function mapKehadiranRecord(record) {
  return {
    id: record.id,
    studentId: record.siswa_id,
    classId: record.kelas_id,
    date: record.tanggal ? record.tanggal.toString().slice(0, 10) : "",
    status: record.status,
  };
}

function mapKehadiranPayload(kehadiran) {
  return {
    siswa_id: kehadiran.studentId,
    kelas_id: kehadiran.classId,
    tanggal: kehadiran.date,
    status: kehadiran.status,
  };
}

export async function getAllKehadiran() {
  return requestWithRetry(async () => {
    const { data, error } = await supabase
      .from("kehadiran")
      .select("*")
      .order("id");

    if (error) throw error;

    return data.map(mapKehadiranRecord);
  });
}

export async function createKehadiran(kehadiran) {
  return requestWithRetry(async () => {
    const payload = mapKehadiranPayload(kehadiran);
    const { data, error } = await supabase
      .from("kehadiran")
      .insert(payload)
      .select();

    if (error) throw error;

    return data.map(mapKehadiranRecord);
  });
}

export async function updateKehadiran(id, kehadiran) {
  return requestWithRetry(async () => {
    const payload = mapKehadiranPayload(kehadiran);
    const { data, error } = await supabase
      .from("kehadiran")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data.map(mapKehadiranRecord);
  });
}

export async function deleteKehadiran(id) {
  return requestWithRetry(async () => {
    const { error } = await supabase.from("kehadiran").delete().eq("id", id);

    if (error) throw error;
  });
}
