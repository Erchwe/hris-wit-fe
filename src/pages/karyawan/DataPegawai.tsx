import { useEffect, useState } from 'react';
import api from '../../utils/api.ts';

interface Pegawai {
    id_data_pegawai: string;
    nama_lengkap: string;
    posisi: { String: string, Valid: boolean };
    foto_url?: string; 
}

export default function DataPegawai() {
    const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/pegawai')
            .then((res) => {
                if (Array.isArray(res.data.data)) {
                    setPegawaiList(res.data.data);
                }
            })
            .catch((err) => {
                console.error('Gagal mengambil data pegawai:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="p-6">Memuat data pegawai...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Data Pegawai</h1>
                </div>
                <div className="flex gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Buat Pegawai</button>
                    <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">Permintaan Perubahan Data</button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4">
                <button className="text-blue-600 text-sm hover:underline">Upload Pegawai</button>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Cari Pegawai..."
                        className="w-full md:w-auto border px-3 py-2 rounded-lg text-sm"
                    />
                    <button className="bg-white border px-4 py-2 rounded-lg text-sm">Filter</button>
                    <button className="bg-white border px-4 py-2 rounded-lg text-sm">Download</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {pegawaiList.map((pegawai) => (
                    <div
                        key={pegawai.id_data_pegawai}
                        className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center transition hover:shadow-lg hover:-translate-y-1"
                    >
                        <img
                            src={pegawai.foto_url || '/default-avatar.png'}
                            alt={pegawai.nama_lengkap}
                            className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-gray-200"
                        />
                        <h2 className="font-semibold text-base text-gray-800">{pegawai.nama_lengkap}</h2>
                        <p className="text-sm text-gray-500">
                            {pegawai.posisi?.Valid ? pegawai.posisi.String : 'Tidak ada posisi'}
                        </p>
                    </div>
                ))}
            </div>

            {!loading && pegawaiList.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-500">Tidak ada data pegawai untuk ditampilkan.</p>
                </div>
            )}
        </div>
    );
}