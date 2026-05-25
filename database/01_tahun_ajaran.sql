CREATE TABLE tahun_ajaran (
    id_tahun_ajaran SERIAL PRIMARY KEY,
    tahun_mulai INT NOT NULL,
    tahun_selesai INT NOT NULL,
    aktif BOOLEAN DEFAULT TRUE
);