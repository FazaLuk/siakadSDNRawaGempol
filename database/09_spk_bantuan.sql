CREATE TABLE spk_bantuan (
    id_spk SERIAL PRIMARY KEY,

    id_siswa INT NOT NULL,

    periode VARCHAR(30) NOT NULL,

    nilai_penghasilan NUMERIC(5,2) NOT NULL,

    nilai_status_rumah NUMERIC(5,2) NOT NULL,

    hasil_saw NUMERIC(10,4) NOT NULL,

    ranking INT,

    status_rekomendasi VARCHAR(20)
    CHECK (
        status_rekomendasi IN (
            'Layak',
            'Tidak Layak'
        )
    ),

    keterangan TEXT,

    CONSTRAINT fk_spk_siswa
    FOREIGN KEY (id_siswa)
    REFERENCES siswa(id_siswa)
    ON DELETE CASCADE
);