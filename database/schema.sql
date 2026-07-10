-- ===========================================
-- SIAKAD SD RAWA GEMPOL
-- Database Schema
-- PostgreSQL (Supabase)
-- ===========================================

-- ==========================
-- TABEL GURU
-- ==========================

CREATE TABLE guru (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    nip VARCHAR(30) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    nama VARCHAR(100) NOT NULL,
    jenis_kelamin VARCHAR(20),

    no_telepon VARCHAR(20),

    mata_pelajaran VARCHAR(100),

    tipe_guru VARCHAR(100),

    role VARCHAR(30) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- ==========================
-- TABEL KELAS
-- ==========================

CREATE TABLE kelas (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    nama_kelas VARCHAR(50) NOT NULL,

    tingkat VARCHAR(30),

    label VARCHAR(5),

    status VARCHAR(20),

    guru_id INTEGER,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_kelas_guru
        FOREIGN KEY (guru_id)
        REFERENCES guru(id)
        ON DELETE SET NULL
);




-- ==========================
-- TABEL SISWA
-- ==========================

CREATE TABLE siswa (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    nisn VARCHAR(30) UNIQUE NOT NULL,

    nama VARCHAR(100) NOT NULL,

    kelas_id INTEGER NOT NULL,

    jenis_kelamin VARCHAR(20),

    nama_orang_tua VARCHAR(100),

    no_telepon VARCHAR(20),

    penghasilan_ortu VARCHAR(30),

    status_rumah VARCHAR(30),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_siswa_kelas
        FOREIGN KEY (kelas_id)
        REFERENCES kelas(id)
        ON DELETE CASCADE
);




-- ==========================
-- TABEL NILAI
-- ==========================

CREATE TABLE nilai (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    siswa_id INTEGER NOT NULL,

    guru_id INTEGER NOT NULL,

    kelas_id INTEGER NOT NULL,

    mata_pelajaran VARCHAR(100),

    nilai_tugas NUMERIC(5,2),

    nilai_uts NUMERIC(5,2),

    nilai_uas NUMERIC(5,2),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_nilai_siswa
        FOREIGN KEY (siswa_id)
        REFERENCES siswa(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_nilai_guru
        FOREIGN KEY (guru_id)
        REFERENCES guru(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_nilai_kelas
        FOREIGN KEY (kelas_id)
        REFERENCES kelas(id)
        ON DELETE CASCADE
);




-- ==========================
-- TABEL KEHADIRAN
-- ==========================

CREATE TABLE kehadiran (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    siswa_id INTEGER NOT NULL,

    kelas_id INTEGER NOT NULL,

    tanggal DATE NOT NULL,

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_kehadiran_siswa
        FOREIGN KEY (siswa_id)
        REFERENCES siswa(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_kehadiran_kelas
        FOREIGN KEY (kelas_id)
        REFERENCES kelas(id)
        ON DELETE CASCADE
);