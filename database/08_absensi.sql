CREATE TABLE absensi (
    id_absensi SERIAL PRIMARY KEY,

    id_siswa INT NOT NULL,
    id_guru INT NOT NULL,
    id_tahun_ajaran INT NOT NULL,

    tanggal DATE NOT NULL,

    status VARCHAR(20) NOT NULL
    CHECK (
        status IN (
            'Hadir',
            'Izin',
            'Sakit',
            'Alfa'
        )
    ),

    keterangan TEXT,

    CONSTRAINT fk_absensi_siswa
    FOREIGN KEY (id_siswa)
    REFERENCES siswa(id_siswa)
    ON DELETE CASCADE,

    CONSTRAINT fk_absensi_guru
    FOREIGN KEY (id_guru)
    REFERENCES guru(id_guru)
    ON DELETE CASCADE,

    CONSTRAINT fk_absensi_tahun_ajaran
    FOREIGN KEY (id_tahun_ajaran)
    REFERENCES tahun_ajaran(id_tahun_ajaran)
    ON DELETE CASCADE
);