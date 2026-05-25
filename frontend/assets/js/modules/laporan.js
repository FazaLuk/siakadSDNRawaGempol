import { kehadiran } from "./kehadiran.js";
import { kelas } from "./kelas.js";
import { nilai, calculateAverageScore } from "./nilai.js";
import { getBantuanRanking, getBantuanStatusBadge } from "./spkBantuan.js";
import {
  getStudentClassId,
  getStudentClassName,
  students,
} from "./students.js";

/* =========================
   REPORT CONFIG
========================== */

export const REPORT_TYPES = {
  NILAI: "nilai",
  KEHADIRAN: "kehadiran",
  SISWA: "siswa",
  BANTUAN: "bantuan",
};

/* =========================
   RELATION HELPER
========================== */

function getStudentById(studentId) {
  return students.find((student) => Number(student.id) === Number(studentId));
}

function getKelasById(classId) {
  return kelas.find((item) => Number(item.id) === Number(classId));
}

export function getReportClassId(item) {
  if (item.classId) return Number(item.classId);

  return getStudentClassId(item, kelas);
}

export function getReportClassName(classId, student = null) {
  if (student) return getStudentClassName(student, kelas);

  return getKelasById(classId)?.name || "-";
}

export function getAvailableSubjects() {
  const subjectSet = new Set();

  nilai.forEach((item) => {
    if (!item.subject) return;

    subjectSet.add(item.subject);
  });

  return [...subjectSet].sort((firstSubject, secondSubject) =>
    firstSubject.localeCompare(secondSubject)
  );
}

export function getStatusBadgeClass(status) {
  const statusMap = {
    Hadir: "badge-success",
    Izin: "badge-warning",
    Sakit: "badge-info",
    Alpha: "badge-danger",
  };

  return statusMap[status] || "badge-warning";
}

/* =========================
   DATA BUILDER
========================== */

export function getNilaiReportData() {
  return nilai.map((item) => {
    const student = getStudentById(item.studentId);
    const classId = Number(item.classId);

    return {
      ...item,
      studentName: student?.name || "-",
      classId,
      className: getReportClassName(classId),
      averageScore: calculateAverageScore(
        item.taskScore,
        item.utsScore,
        item.uasScore
      ),
    };
  });
}

export function getKehadiranReportData() {
  return kehadiran.map((item) => {
    const student = getStudentById(item.studentId);
    const classId = Number(item.classId);

    return {
      ...item,
      studentName: student?.name || "-",
      classId,
      className: getReportClassName(classId),
    };
  });
}

export function getSiswaReportData() {
  return students.map((student) => ({
    ...student,
    classId: getStudentClassId(student, kelas),
    className: getStudentClassName(student, kelas),
  }));
}

export function getBantuanReportData() {
  return getBantuanRanking(kelas).map((student) => ({
    ...student,
    classId: getStudentClassId(student, kelas),
  }));
}

export function getReportData(reportType) {
  const reportMap = {
    [REPORT_TYPES.NILAI]: getNilaiReportData,
    [REPORT_TYPES.KEHADIRAN]: getKehadiranReportData,
    [REPORT_TYPES.SISWA]: getSiswaReportData,
    [REPORT_TYPES.BANTUAN]: getBantuanReportData,
  };

  return reportMap[reportType]?.() || [];
}

export function getReportEmptyMessage(reportType) {
  const messageMap = {
    [REPORT_TYPES.NILAI]: "Belum ada data",
    [REPORT_TYPES.KEHADIRAN]: "Belum ada data",
    [REPORT_TYPES.SISWA]: "Belum ada data",
    [REPORT_TYPES.BANTUAN]: "Belum ada data",
  };

  return messageMap[reportType] || "Belum ada data";
}

export function getFilteredEmptyMessage(reportType) {
  const messageMap = {
    [REPORT_TYPES.NILAI]: "Belum ada data",
    [REPORT_TYPES.KEHADIRAN]: "Belum ada data",
    [REPORT_TYPES.SISWA]: "Belum ada data",
    [REPORT_TYPES.BANTUAN]: "Belum ada data",
  };

  return messageMap[reportType] || "Belum ada data";
}

export function getBantuanBadgeClass(status) {
  return getBantuanStatusBadge(status);
}
