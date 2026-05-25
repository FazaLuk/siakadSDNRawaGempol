CREATE TABLE semester (
    id_semester SERIAL PRIMARY KEY,
    id_tahun_ajaran INT NOT NULL,
    nama_semester VARCHAR(20) NOT NULL,
    urutan INT NOT NULL,
    aktif BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_semester_tahun_ajaran
    FOREIGN KEY (id_tahun_ajaran)
    REFERENCES tahun_ajaran(id_tahun_ajaran)
    ON DELETE CASCADE
);