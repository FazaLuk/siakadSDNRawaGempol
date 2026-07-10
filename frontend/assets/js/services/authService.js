import { supabase } from "../config/supabase.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";

function mapGuruRecord(record) {
  return {
    id: record.id,
    username: record.username,
    password: record.password,
    role: record.role,
    name: record.nama,
  };
}

export async function findGuruByUsername(username) {
  return requestWithRetry(async () => {
    const normalizedUsername = String(username || "").trim();

    const { data, error } = await supabase
      .from("guru")
      .select("id, username, password, role, nama")
      .ilike("username", normalizedUsername)
      .limit(1);

    if (error) throw error;

    return Array.isArray(data) && data[0] ? mapGuruRecord(data[0]) : null;
  });
}

export async function authenticateGuru(username, password, role = null) {
  return requestWithRetry(async () => {
    const normalizedUsername = String(username || "").trim();
    const normalizedPassword = String(password || "").trim();

    let query = supabase
      .from("guru")
      .select("id, username, password, role, nama")
      .ilike("username", normalizedUsername)
      .eq("password", normalizedPassword);

    if (role) {
      query = query.eq("role", role);
    }

    const { data, error } = await query.limit(1);

    if (error) throw error;

    const guru = Array.isArray(data) && data[0] ? mapGuruRecord(data[0]) : null;

    return guru;
  });
}
