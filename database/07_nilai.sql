CREATE TABLE nilai (
    id_nilai SERIAL PRIMARY KEY,

    id_siswa INT NOT NULL,
    id_guru INT NOT NULL,
    id_mapel INT NOT NULL,
    id_semester INT NOT NULL,
    id_tahun_ajaran INT NOT NULL,

    nilai_angka NUMERIC(5,2) NOT NULL,

    nilai_huruf VARCHAR(5),

    keterangan TEXT,

    CONSTRAINT fk_nilai_siswa
    FOREIGN KEY (id_siswa)
    REFERENCES siswa(id_siswa)
    ON DELETE CASCADE,

    CONSTRAINT fk_nilai_guru
    FOREIGN KEY (id_guru)
    REFERENCES guru(id_guru)
    ON DELETE CASCADE,

    CONSTRAINT fk_nilai_mapel
    FOREIGN KEY (id_mapel)
    REFERENCES mapel(id_mapel)
    ON DELETE CASCADE,

    CONSTRAINT fk_nilai_semester
    FOREIGN KEY (id_semester)
    REFERENCES semester(id_semester)
    ON DELETE CASCADE,

    CONSTRAINT fk_nilai_tahun_ajaran
    FOREIGN KEY (id_tahun_ajaran)
    REFERENCES tahun_ajaran(id_tahun_ajaran)
    ON DELETE CASCADE
);