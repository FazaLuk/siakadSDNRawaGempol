CREATE TABLE guru (
    id_guru SERIAL PRIMARY KEY,
    nip VARCHAR(30) UNIQUE NOT NULL,
    nama_guru VARCHAR(100) NOT NULL,

    jenis_guru VARCHAR(30) NOT NULL
    CHECK (jenis_guru IN ('Wali Kelas', 'Guru Mata Pelajaran')),

    mapel_diampu VARCHAR(50)
);