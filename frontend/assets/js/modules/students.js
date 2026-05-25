/* =========================
   STORAGE CONFIG
========================== */

export const STUDENT_STORAGE_KEY = "studentData";
export const STUDENT_DATA_CHANGED_EVENT = "studentDataChanged";

/* =========================
   LOAD DATA
========================== */

function getStoredStudentData() {
  if (typeof localStorage === "undefined") return [];

  try {
    const storedData = localStorage.getItem(STUDENT_STORAGE_KEY);

    // kalau belum ada data
    if (!storedData) return [];

    const parsedData = JSON.parse(storedData);

    // pastikan array
    if (!Array.isArray(parsedData)) return [];

    return parsedData;
  } catch (error) {
    console.error("Gagal memuat data siswa dari localStorage", error);

    return [];
  }
}

function parseStudentData(value) {
  try {
    if (!value) return [];

    const parsedData = JSON.parse(value);

    if (!Array.isArray(parsedData)) return [];

    return parsedData;
  } catch (error) {
    console.error("Gagal membaca sinkronisasi data siswa", error);

    return [];
  }
}

/* =========================
   STATE
========================== */

export const students = getStoredStudentData();

export function syncStudentData(nextStudents) {
  if (!Array.isArray(nextStudents)) return;

  students.splice(0, students.length, ...nextStudents);
}

export function syncStudentDataFromStorageValue(value) {
  syncStudentData(parseStudentData(value));
}

/* =========================
   RELATION HELPER
========================== */

export function getKelasIdByName(kelasData, className) {
  const selectedKelas = kelasData.find((item) => item.name === className);

  return selectedKelas ? selectedKelas.id : null;
}

export function getStudentClassId(student, kelasData) {
  if (student.classId) {
    return Number(student.classId);
  }

  return getKelasIdByName(kelasData, student.class);
}

export function getStudentClassName(student, kelasData) {
  const selectedKelas = kelasData.find(
    (item) => item.id === getStudentClassId(student, kelasData)
  );

  return selectedKelas ? selectedKelas.name : student.class || "-";
}

export function countStudentsByClassId(studentData, kelasData, classId) {
  return studentData.filter(
    (student) => getStudentClassId(student, kelasData) === Number(classId)
  ).length;
}

export function migrateStudentClassIds(studentData, kelasData) {
  let hasMigratedData = false;

  studentData.forEach((student) => {
    if (student.classId) return;

    const classId = getStudentClassId(student, kelasData);

    if (!classId) return;

    student.classId = classId;
    hasMigratedData = true;
  });

  return hasMigratedData;
}

/* =========================
   SAVE DATA
========================== */

export function saveStudentData() {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(students));

    window.dispatchEvent(
      new CustomEvent(STUDENT_DATA_CHANGED_EVENT, {
        detail: {
          students,
        },
      })
    );
  } catch (error) {
    console.error("Gagal menyimpan data siswa ke localStorage", error);
  }
}
