import { supabase } from "../config/supabase.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";

function mapStudentRecord(record) {
  return {
    id: record.id,
    nisn: record.nisn,
    name: record.nama,
    classId: record.kelas_id,
    gender: record.jenis_kelamin,
    parent: record.nama_orang_tua,
    phone: record.no_telepon,
    income: record.penghasilan_ortu,
    house: record.status_rumah,
  };
}

function mapStudentPayload(student) {
  return {
    nisn: student.nisn,
    nama: student.name,
    kelas_id: student.classId,
    jenis_kelamin: student.gender,
    nama_orang_tua: student.parent,
    no_telepon: student.phone,
    penghasilan_ortu: student.income,
    status_rumah: student.house,
  };
}

export async function getAllStudents() {
  return requestWithRetry(async () => {
    const { data, error } = await supabase
      .from("siswa")
      .select("*")
      .order("id");

    if (error) throw error;

    return data.map(mapStudentRecord);
  });
}

export async function createStudent(student) {
  return requestWithRetry(async () => {
    const payload = mapStudentPayload(student);
    const { data, error } = await supabase
      .from("siswa")
      .insert(payload)
      .select();

    if (error) throw error;

    return data.map(mapStudentRecord);
  });
}

export async function updateStudent(id, student) {
  return requestWithRetry(async () => {
    const payload = mapStudentPayload(student);
    const { data, error } = await supabase
      .from("siswa")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data.map(mapStudentRecord);
  });
}

export async function deleteStudent(id) {
  return requestWithRetry(async () => {
    const { error } = await supabase.from("siswa").delete().eq("id", id);

    if (error) throw error;
  });
}
