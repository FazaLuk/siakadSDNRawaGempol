import { supabase } from "../config/supabase.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";

function mapGuruRecord(record) {
  const isAutoCredential = String(record.username || "").startsWith(
    "__guru_auto__",
  );

  return {
    id: record.id,
    nip: record.nip,
    username: isAutoCredential ? "" : record.username,
    password: record.password === "__guru_auto__" ? "" : record.password,
    name: record.nama,
    gender: record.jenis_kelamin,
    phone: record.no_telepon,
    subject: record.mata_pelajaran,
    type: record.tipe_guru,
    role: record.role,
  };
}

function mapGuruPayload(guru) {
  return {
    nip: guru.nip,
    username: guru.username || `__guru_auto__${guru.nip}`,
    password: guru.password || "__guru_auto__",
    nama: guru.name,
    jenis_kelamin: guru.gender,
    no_telepon: guru.phone,
    mata_pelajaran: guru.subject || null,
    tipe_guru: guru.type,
    role: guru.role,
  };
}

export async function getAllGuru() {
  return requestWithRetry(async () => {
    const { data, error } = await supabase
      .from("guru")
      .select("*")
      .order("id");

    if (error) throw error;

    return data.map(mapGuruRecord);
  });
}

export async function createGuru(guru) {
  return requestWithRetry(async () => {
    const payload = mapGuruPayload(guru);
    const { data, error } = await supabase
      .from("guru")
      .insert(payload)
      .select();

    if (error) throw error;

    return data.map(mapGuruRecord);
  });
}

export async function updateGuru(id, guru) {
  return requestWithRetry(async () => {
    const payload = mapGuruPayload(guru);
    const { data, error } = await supabase
      .from("guru")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data.map(mapGuruRecord);
  });
}

export async function deleteGuru(id) {
  return requestWithRetry(async () => {
    const { error } = await supabase.from("guru").delete().eq("id", id);

    if (error) throw error;
  });
}
