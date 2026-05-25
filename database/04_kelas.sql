CREATE TABLE kelas (
    id_kelas SERIAL PRIMARY KEY,
    nama_kelas VARCHAR(20) NOT NULL,

    tingkat INT NOT NULL
    CHECK (tingkat BETWEEN 1 AND 6),

    id_wali_kelas INT UNIQUE,

    CONSTRAINT fk_kelas_wali
    FOREIGN KEY (id_wali_kelas)
    REFERENCES guru(id_guru)
    ON DELETE SET NULL
);