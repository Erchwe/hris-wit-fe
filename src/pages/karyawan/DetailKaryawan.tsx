import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api.ts';

// --- DEFINISI TIPE DATA ---

type NullableString = { String: string; Valid: boolean };
type NullableTime = { Time: string; Valid: boolean };
type NullableBool = { Bool: boolean; Valid: boolean };

type DetailGridProps<T extends object> = {
    data: T;
    renderFunc: (val: T[keyof T]) => string;
};

function DetailGrid<T extends object>({ data, renderFunc }: DetailGridProps<T>) {
    const entries = Object.entries(data) as [keyof T, T[keyof T]][];

    const fieldsToDecode = ['jenis_kelamin', 'status', 'profesi_kerja'];

    const midPoint = Math.ceil(entries.length / 2);
    const col1 = entries.slice(0, midPoint);
    const col2 = entries.slice(midPoint);

    const formatLabel = (key: string) =>
        key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

    const renderCell = (key: keyof T, value: T[keyof T]) => {
        let displayValue = renderFunc(value);

        if (fieldsToDecode.includes(String(key)) && displayValue !== '-') {
            try {
                displayValue = atob(displayValue);
            } catch (e) {
                console.error(`Gagal decode base64 untuk key: ${String(key)}`, e);
            }
        }

        return displayValue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
                {col1.map(([key, value]) => (
                    <div key={String(key)} className="flex justify-between py-2 border-b">
                        <span className="text-sm text-gray-500">{formatLabel(String(key))}</span>
                        <span className="text-sm font-medium text-gray-800 text-right">
                            {renderCell(key, value)}
                        </span>
                    </div>
                ))}
            </div>
            <div>
                {col2.map(([key, value]) => (
                    <div key={String(key)} className="flex justify-between py-2 border-b">
                        <span className="text-sm text-gray-500">{formatLabel(String(key))}</span>
                        <span className="text-sm font-medium text-gray-800 text-right">
                            {renderCell(key, value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export interface Keluarga {
    nama_istri_suami?: NullableString;
    jenis_kelamin?: NullableString;
    tempat_lahir?: NullableString;
    tgl_lahir?: NullableTime;
    pendidikan_terakhir?: NullableString;
    pekerjaan_skrg?: NullableString;
    nama_ayah?: NullableString;
    pekerjaan_ayah?: NullableString;
    nama_ibu?: NullableString;
    pekerjaan_ibu?: NullableString;
    alamat_rumah?: NullableString;
}

export interface Anak {
    nama: NullableString;
    jenis_kelamin: NullableString;
    tempat_lahir: NullableString;
    tgl_lahir: NullableTime;
    pendidikan_pekerjaan: NullableString;
}

export interface SaudaraKandung {
    nama_saudara_kandung: NullableString;
    jenis_kelamin: NullableString;
    tempat_lahir: NullableString;
    tgl_lahir: NullableTime;
    pendidikan_pekerjaan: NullableString;
}

export interface PendidikanFormal {
    jenjang_pddk: string;
    nama_sekolah: string;
    jurusan_fakultas: string;
    kota: string;
    tgl_lulus: NullableTime;
    ipk: { Float64: number; Valid: boolean };
    institusi: string;
}

export interface PendidikanNonFormal {
    jenis_pendidikan: string;
    institusi: string;
    kota: string;
    tgl_lulus: NullableTime;
    keterangan: string;
}

export interface Bahasa {
    bahasa: string;
    lisan: string;
    tulisan: string;
    keterangan: string;
}

export interface PengalamanKerja {
    nama_perusahaan: string;
    periode: string;
    jabatan: string;
    gaji: string;
    alasan_pindah: string;
}

export interface Referensi {
    nama: string;
    nama_perusahaan: string;
    jabatan: string;
    no_telp_perusahaan: string;
}

export interface DetailPelamarData {
    id_lowongan_pekerjaan: string;
    email: string;
    nama_lengkap: string;
    tempat_lahir?: NullableString;
    tgl_lahir?: NullableTime;
    jenis_kelamin?: NullableString;
    kewarganegaraan?: NullableString;
    phone?: NullableString;
    mobile?: NullableString;
    agama?: NullableString;
    gol_darah?: NullableString;
    status_menikah?: NullableBool;
    no_ktp?: NullableString;
    no_npwp?: NullableString;
    status?: string;
    asal_kota?: NullableString;
    gaji_terakhir?: { Float64: number; Valid: boolean };
    harapan_gaji?: { Float64: number; Valid: boolean };
    sedang_bekerja?: NullableString;
    sumber_informasi?: NullableString;
    alasan?: NullableString;
    profesi_kerja?: NullableString;
    keluarga: Keluarga;
    anak?: Anak[];
    saudara_kandung?: SaudaraKandung[];
    pendidikan_formal?: PendidikanFormal[];
    pendidikan_non_formal?: PendidikanNonFormal[];
    bahasa?: Bahasa[];
    pengalaman_kerja?: PengalamanKerja[];
    referensi?: Referensi[];
}

const renderValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
        if (!value.Valid) return '-';
        if ('Time' in value) {
            if (value.Time.startsWith('0001-01-01')) return '-';
            return new Date(value.Time.split('T')[0]).toLocaleDateString('id-ID');
        }
        if ('Bool' in value) return value.Bool ? 'Ya' : 'Tidak';
        if ('String' in value) return value.String;
    }
    return String(value);
};

function KeluargaTab({keluarga, anak, saudara_kandung}: {
    keluarga: Keluarga,
    anak: Anak[],
    saudara_kandung: SaudaraKandung[]
}) {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Data Pasangan & Orang Tua</h3>
                {keluarga ? (
                    <DetailGrid data={keluarga} renderFunc={renderValue} />
                ) : (
                    <p className="text-sm text-gray-500">Tidak ada data pasangan & orang tua.</p>
                )}
            </div>

            <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Data Anak</h3>
                {anak && anak.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-2">Nama</th>
                            <th className="p-2">Jenis Kelamin</th>
                            <th className="p-2">Pendidikan/Pekerjaan</th>
                        </tr>
                        </thead>
                        <tbody>
                        {anak.map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2">{renderValue(item.nama)}</td>
                                <td className="p-2">{renderValue(item.jenis_kelamin)}</td>
                                <td className="p-2">{renderValue(item.pendidikan_pekerjaan)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-gray-500">Tidak ada data anak.</p>
                )}
            </div>

            <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Data Saudara Kandung</h3>
                {saudara_kandung && saudara_kandung.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="p-2">Nama</th>
                            <th className="p-2">Jenis Kelamin</th>
                            <th className="p-2">Pendidikan/Pekerjaan</th>
                        </tr>
                        </thead>
                        <tbody>
                        {saudara_kandung.map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2">{renderValue(item.nama_saudara_kandung)}</td>
                                <td className="p-2">{renderValue(item.jenis_kelamin)}</td>
                                <td className="p-2">{renderValue(item.pendidikan_pekerjaan)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-gray-500">Tidak ada data saudara kandung.</p>
                )}
            </div>
        </div>
    );
}

export default function DetailKaryawan() {
    const { id_data_pelamar } = useParams<{ id_data_pelamar: string }>();
    const [pelamar, setPelamar] = useState<DetailPelamarData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('identitas');

    useEffect(() => {
        if (id_data_pelamar) {
            api.get(`/pelamar/${id_data_pelamar}`)
                .then(res => {
                    console.log("Response data pelamar:", res.data.data);
                    setPelamar(res.data.data);
                })
                .catch(err => console.error("Gagal memuat detail pelamar:", err))
                .finally(() => setLoading(false));
        }
    }, [id_data_pelamar]);

    if (loading) return <div className="p-8">Memuat data detail pelamar...</div>;
    if (!pelamar) return <div className="p-8">Data pelamar tidak ditemukan.</div>;
    if (!pelamar) return <p>Data pelamar tidak tersedia</p>;



    const TabButton = ({ tabName, label }: { tabName: string; label: string }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === tabName
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

        return (
        <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold">{renderValue(pelamar.nama_lengkap)}</h1>
                    <span className="text-sm text-gray-500">Detail Pelamar</span>
                </div>
                <div className="flex gap-2">
                    <button className="btn-primary bg-green-600 hover:bg-green-700">Convert to Employee</button>
                    <button className="btn-secondary">Export PDF</button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                {/* Navigasi Tab */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex gap-6 px-6">
                        <TabButton tabName="identitas" label="IDENTITAS" />
                        <TabButton tabName="keluarga" label="KELUARGA" />
                        <TabButton tabName="pendidikan" label="PENDIDIKAN" />
                        <TabButton tabName="pengalaman" label="PENGALAMAN KERJA" />
                    </nav>
                </div>

                {/* Konten Tab */}
                <div className="p-6">
                    {activeTab === "identitas" && (
                        <DetailGrid data={pelamar} renderFunc={renderValue} />
                    )}
                    {activeTab === 'keluarga' && (
                        <KeluargaTab
                            keluarga={pelamar.keluarga}
                            anak={pelamar.anak || []}
                            saudara_kandung={pelamar.saudara_kandung || []}
                        />
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t text-right">
                    <Link to="/karyawan/daftarkaryawan" className="btn-secondary">
                        Kembali
                    </Link>
                </div>
            </div>
        </div>
    );
}


