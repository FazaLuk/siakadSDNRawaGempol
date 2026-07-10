import { supabase } from "../config/supabase.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";

function mapKelasRecord(record) {
  return {
    id: record.id,
    name: record.nama_kelas,
    level: record.tingkat,
    label: record.label,
    status: record.status,
    guruId: record.guru_id,
  };
}

function mapKelasPayload(kelas) {
  return {
    nama_kelas: kelas.name,
    tingkat: kelas.level,
    label: kelas.label,
    status: kelas.status,
    guru_id: kelas.guruId || null,
  };
}

export async function getAllKelas() {
  return requestWithRetry(async () => {
    const { data, error } = await supabase
      .from("kelas")
      .select("*")
      .order("id");

    if (error) throw error;

    return data.map(mapKelasRecord);
  });
}

export async function createKelas(kelas) {
  return requestWithRetry(async () => {
    const payload = mapKelasPayload(kelas);
    const { data, error } = await supabase
      .from("kelas")
      .insert(payload)
      .select();

    if (error) throw error;

    return data.map(mapKelasRecord);
  });
}

export async function updateKelas(id, kelas) {
  return requestWithRetry(async () => {
    const payload = mapKelasPayload(kelas);
    const { data, error } = await supabase
      .from("kelas")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data.map(mapKelasRecord);
  });
}

export async function deleteKelas(id) {
  return requestWithRetry(async () => {
    const { error } = await supabase.from("kelas").delete().eq("id", id);

    if (error) throw error;
  });
}
