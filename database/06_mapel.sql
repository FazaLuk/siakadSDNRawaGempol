CREATE TABLE mapel (
    id_mapel SERIAL PRIMARY KEY,

    nama_mapel VARCHAR(100) NOT NULL,

    kelompok VARCHAR(30) NOT NULL
    CHECK (
        kelompok IN (
            'Umum',
            'Agama',
            'PJOK'
        )
    )
);