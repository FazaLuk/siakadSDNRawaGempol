CREATE TABLE siswa (
    id_siswa SERIAL PRIMARY KEY,

    nisn VARCHAR(20) UNIQUE NOT NULL,

    nama_siswa VARCHAR(100) NOT NULL,

    jenis_kelamin VARCHAR(10) NOT NULL
    CHECK (jenis_kelamin IN ('L', 'P')),

    tanggal_lahir DATE NOT NULL,

    nama_ortu VARCHAR(100) NOT NULL,

    penghasilan_ortu VARCHAR(20) NOT NULL
    CHECK (
        penghasilan_ortu IN (
            '<1jt',
            '1jt-2jt',
            '2jt-3jt',
            '>3jt'
        )
    ),

    status_rumah VARCHAR(20) NOT NULL
    CHECK (
        status_rumah IN (
            'Milik Sendiri',
            'Mengontrak',
            'Menumpang'
        )
    ),

    no_hp_ortu VARCHAR(20),

    id_kelas INT NOT NULL,

    CONSTRAINT fk_siswa_kelas
    FOREIGN KEY (id_kelas)
    REFERENCES kelas(id_kelas)
    ON DELETE CASCADE
);