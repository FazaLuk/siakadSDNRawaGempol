import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../services/studentService.js";

/* =========================
   STORAGE CONFIG
========================== */

export const STUDENT_DATA_CHANGED_EVENT = "studentDataChanged";
export const students = [];

export function syncStudentData(nextStudents) {
  if (!Array.isArray(nextStudents)) return;

  students.splice(0, students.length, ...nextStudents);
}

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
    (item) => item.id === getStudentClassId(student, kelasData),
  );

  return selectedKelas ? selectedKelas.name : student.class || "-";
}

export function countStudentsByClassId(studentData, kelasData, classId) {
  return studentData.filter(
    (student) => getStudentClassId(student, kelasData) === Number(classId),
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

export async function loadStudentData() {
  const data = await getAllStudents();
  students.splice(0, students.length, ...data);
  notifyStudentDataChanged();
  return students;
}

export async function createStudentData(studentData) {
  const created = await createStudent(studentData);

  if (Array.isArray(created) && created[0]) {
    students.unshift(created[0]);
    notifyStudentDataChanged();
    return created[0];
  }

  return null;
}

export async function updateStudentData(id, studentData) {
  const updated = await updateStudent(id, studentData);

  if (Array.isArray(updated) && updated[0]) {
    const index = students.findIndex((item) => item.id === id);

    if (index !== -1) {
      Object.assign(students[index], updated[0]);
    } else {
      students.unshift(updated[0]);
    }

    notifyStudentDataChanged();
    return updated[0];
  }

  return null;
}

export async function deleteStudentData(id) {
  await deleteStudent(id);

  const index = students.findIndex((item) => item.id === id);

  if (index !== -1) {
    students.splice(index, 1);
  }

  notifyStudentDataChanged();
}

export function saveStudentData() {
  notifyStudentDataChanged();
}

function notifyStudentDataChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(STUDENT_DATA_CHANGED_EVENT, {
      detail: {
        students,
      },
    }),
  );
}
